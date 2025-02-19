/*
  # Add Conversations and Messages Support

  1. New Tables
    - conversations
      - Stores GHL conversations with local sync status
    - messages
      - Stores GHL messages with attachments and metadata
    - conversation_participants
      - Links conversations to clients and users

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    
  3. Functions
    - sync_conversation
    - sync_message
    - get_conversation_messages
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_conversation_id text UNIQUE,
  ghl_contact_id text REFERENCES clients(ghl_contact_id),
  ghl_location_id text,
  type text NOT NULL,
  last_message_body text,
  last_message_type text,
  last_message_date timestamptz,
  unread_count integer DEFAULT 0,
  inbox boolean DEFAULT true,
  starred boolean DEFAULT false,
  deleted boolean DEFAULT false,
  assigned_to text,
  user_id text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz,
  sync_status text CHECK (sync_status IN ('pending', 'success', 'failed')),
  sync_error text
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  ghl_message_id text UNIQUE,
  type text NOT NULL,
  message_type text NOT NULL,
  body text,
  direction text CHECK (direction IN ('inbound', 'outbound')),
  status text CHECK (status IN ('pending', 'scheduled', 'sent', 'delivered', 'read', 'undelivered', 'connected', 'failed', 'opened')),
  content_type text,
  attachments jsonb,
  meta jsonb,
  source text,
  user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz,
  sync_status text CHECK (sync_status IN ('pending', 'success', 'failed')),
  sync_error text
);

-- Create conversation participants table
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'participant', 'observer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, client_id, user_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view conversations they have access to"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update conversations they own"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM conversation_participants
          WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Create indexes
CREATE INDEX idx_conversations_ghl_contact_id ON conversations(ghl_contact_id);
CREATE INDEX idx_conversations_ghl_conversation_id ON conversations(ghl_conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_ghl_message_id ON messages(ghl_message_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_client_id ON conversation_participants(client_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Create sync functions
CREATE OR REPLACE FUNCTION sync_conversation(
  conversation_data jsonb,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conversation_id uuid;
  _result jsonb;
BEGIN
  -- Insert or update conversation
  INSERT INTO conversations (
    ghl_conversation_id,
    ghl_contact_id,
    ghl_location_id,
    type,
    last_message_body,
    last_message_type,
    last_message_date,
    unread_count,
    inbox,
    starred,
    deleted,
    assigned_to,
    user_id,
    created_by,
    synced_at,
    sync_status
  ) VALUES (
    conversation_data->>'id',
    conversation_data->>'contactId',
    conversation_data->>'locationId',
    conversation_data->>'type',
    conversation_data->>'lastMessageBody',
    conversation_data->>'lastMessageType',
    (conversation_data->>'lastMessageDate')::timestamptz,
    (conversation_data->>'unreadCount')::integer,
    (conversation_data->>'inbox')::boolean,
    (conversation_data->>'starred')::boolean,
    (conversation_data->>'deleted')::boolean,
    conversation_data->>'assignedTo',
    conversation_data->>'userId',
    user_id,
    now(),
    'success'
  )
  ON CONFLICT (ghl_conversation_id) 
  DO UPDATE SET
    last_message_body = EXCLUDED.last_message_body,
    last_message_type = EXCLUDED.last_message_type,
    last_message_date = EXCLUDED.last_message_date,
    unread_count = EXCLUDED.unread_count,
    inbox = EXCLUDED.inbox,
    starred = EXCLUDED.starred,
    deleted = EXCLUDED.deleted,
    assigned_to = EXCLUDED.assigned_to,
    user_id = EXCLUDED.user_id,
    synced_at = now(),
    sync_status = 'success',
    updated_at = now()
  RETURNING id INTO _conversation_id;

  -- Build result
  SELECT row_to_json(c)::jsonb INTO _result
  FROM (
    SELECT * FROM conversations WHERE id = _conversation_id
  ) c;

  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION sync_message(
  message_data jsonb,
  conversation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _message_id uuid;
  _result jsonb;
BEGIN
  -- Insert or update message
  INSERT INTO messages (
    conversation_id,
    ghl_message_id,
    type,
    message_type,
    body,
    direction,
    status,
    content_type,
    attachments,
    meta,
    source,
    user_id,
    synced_at,
    sync_status
  ) VALUES (
    conversation_id,
    message_data->>'id',
    message_data->>'type',
    message_data->>'messageType',
    message_data->>'body',
    message_data->>'direction',
    message_data->>'status',
    message_data->>'contentType',
    message_data->'attachments',
    message_data->'meta',
    message_data->>'source',
    message_data->>'userId',
    now(),
    'success'
  )
  ON CONFLICT (ghl_message_id) 
  DO UPDATE SET
    body = EXCLUDED.body,
    status = EXCLUDED.status,
    attachments = EXCLUDED.attachments,
    meta = EXCLUDED.meta,
    synced_at = now(),
    sync_status = 'success',
    updated_at = now()
  RETURNING id INTO _message_id;

  -- Build result
  SELECT row_to_json(m)::jsonb INTO _result
  FROM (
    SELECT * FROM messages WHERE id = _message_id
  ) m;

  RETURN _result;
END;
$$;

-- Create function to get conversation messages
CREATE OR REPLACE FUNCTION get_conversation_messages(
  conversation_id uuid,
  limit_val integer DEFAULT 50,
  before_message_id uuid DEFAULT NULL
)
RETURNS SETOF messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM messages
  WHERE messages.conversation_id = conversation_id
  AND (before_message_id IS NULL OR messages.id < before_message_id)
  ORDER BY created_at DESC
  LIMIT limit_val;
END;
$$;
import { Client } from './client';

export type MessageType = 
  | 'TYPE_CALL'
  | 'TYPE_SMS'
  | 'TYPE_EMAIL'
  | 'TYPE_SMS_REVIEW_REQUEST'
  | 'TYPE_WEBCHAT'
  | 'TYPE_SMS_NO_SHOW_REQUEST'
  | 'TYPE_CAMPAIGN_SMS'
  | 'TYPE_CAMPAIGN_CALL'
  | 'TYPE_CAMPAIGN_EMAIL'
  | 'TYPE_CAMPAIGN_VOICEMAIL'
  | 'TYPE_FACEBOOK'
  | 'TYPE_CAMPAIGN_FACEBOOK'
  | 'TYPE_CAMPAIGN_MANUAL_CALL'
  | 'TYPE_CAMPAIGN_MANUAL_SMS'
  | 'TYPE_GMB'
  | 'TYPE_CAMPAIGN_GMB'
  | 'TYPE_REVIEW'
  | 'TYPE_INSTAGRAM'
  | 'TYPE_WHATSAPP'
  | 'TYPE_CUSTOM_SMS'
  | 'TYPE_CUSTOM_EMAIL'
  | 'TYPE_CUSTOM_PROVIDER_SMS'
  | 'TYPE_CUSTOM_PROVIDER_EMAIL'
  | 'TYPE_IVR_CALL'
  | 'TYPE_ACTIVITY_CONTACT'
  | 'TYPE_ACTIVITY_INVOICE'
  | 'TYPE_ACTIVITY_PAYMENT'
  | 'TYPE_ACTIVITY_OPPORTUNITY'
  | 'TYPE_LIVE_CHAT'
  | 'TYPE_LIVE_CHAT_INFO_MESSAGE'
  | 'TYPE_ACTIVITY_APPOINTMENT'
  | 'TYPE_FACEBOOK_COMMENT'
  | 'TYPE_INSTAGRAM_COMMENT'
  | 'TYPE_ACTIVITY';

export interface Conversation {
  id: string;
  contactId: string;
  locationId: string;
  lastMessageBody?: string;
  lastMessageType?: MessageType;
  lastMessageDate?: string;
  type: 'TYPE_PHONE' | 'TYPE_EMAIL' | 'TYPE_FB_MESSENGER' | 'TYPE_REVIEW';
  unreadCount: number;
  inbox: boolean;
  starred: boolean;
  deleted: boolean;
  assignedTo?: string;
  userId?: string;
  client?: Client;
}

export interface ConversationSearchParams {
  assignedTo?: string;
  contactId?: string;
  followers?: string;
  id?: string;
  lastMessageAction?: 'automated' | 'manual';
  lastMessageDirection?: 'inbound' | 'outbound';
  lastMessageType?: MessageType;
  limit?: number;
  query?: string;
  sort?: 'asc' | 'desc';
  sortBy?: 'last_manual_message_date' | 'last_message_date' | 'score_profile';
  status?: 'all' | 'read' | 'unread' | 'starred' | 'recents';
}
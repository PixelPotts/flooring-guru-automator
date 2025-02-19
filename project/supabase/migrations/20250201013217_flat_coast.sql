/*
  # Payment Processing Functions

  1. New Functions
    - process_payment: Handles payment processing and related updates
    - sync_payment_to_client: Syncs payment data with client records
    - update_invoice_balances: Updates invoice balances after payment

  2. Security
    - Functions are accessible only to authenticated users
    - Data access follows existing RLS policies
*/

-- Function to process a payment
CREATE OR REPLACE FUNCTION process_payment(payment_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payment_id uuid;
  _client_id uuid;
  _created_by uuid;
  _result jsonb;
BEGIN
  -- Extract data
  _client_id := (payment_data->>'clientId')::uuid;
  _created_by := (payment_data->>'created_by')::uuid;

  -- Verify client exists and user has access
  IF NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE id = _client_id 
    AND (created_by = _created_by OR EXISTS (
      SELECT 1 FROM ghl_settings 
      WHERE ghl_settings.created_by = _created_by 
      AND clients.ghl_contact_id IS NOT NULL
    ))
  ) THEN
    RAISE EXCEPTION 'Client not found or access denied';
  END IF;

  -- Insert payment record
  INSERT INTO payments (
    id,
    client_id,
    amount,
    method,
    status,
    date,
    reference,
    check_number,
    card_last4,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    (payment_data->>'id')::uuid,
    _client_id,
    (payment_data->>'amount')::decimal,
    payment_data->>'method',
    'completed',
    (payment_data->>'date')::date,
    payment_data->>'reference',
    payment_data->>'checkNumber',
    payment_data->>'cardLast4',
    payment_data->>'notes',
    _created_by,
    now(),
    now()
  )
  RETURNING id INTO _payment_id;

  -- Update client payment stats
  UPDATE clients
  SET 
    total_revenue = total_revenue + (payment_data->>'amount')::decimal,
    updated_at = now()
  WHERE id = _client_id;

  -- Build result
  _result := jsonb_build_object(
    'payment_id', _payment_id,
    'status', 'completed',
    'processed_at', now()
  );

  RETURN _result;
END;
$$;

-- Function to sync payment with client records
CREATE OR REPLACE FUNCTION sync_payment_to_client(payment_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_id uuid;
  _payment_id uuid;
  _amount decimal;
  _created_by uuid;
BEGIN
  -- Extract data
  _client_id := (payment_data->>'clientId')::uuid;
  _payment_id := (payment_data->>'id')::uuid;
  _amount := (payment_data->>'amount')::decimal;
  _created_by := (payment_data->>'created_by')::uuid;

  -- Update client payment history
  UPDATE clients
  SET
    payment_history = COALESCE(payment_history, '[]'::jsonb) || payment_data,
    last_payment_date = (payment_data->>'date')::date,
    last_payment_amount = _amount,
    updated_at = now()
  WHERE id = _client_id
  AND (created_by = _created_by OR EXISTS (
    SELECT 1 FROM ghl_settings 
    WHERE ghl_settings.created_by = _created_by 
    AND clients.ghl_contact_id IS NOT NULL
  ));

  -- Update related invoices
  PERFORM update_invoice_balances(_payment_id, _amount, _client_id, _created_by);
END;
$$;

-- Function to update invoice balances
CREATE OR REPLACE FUNCTION update_invoice_balances(
  payment_id uuid,
  payment_amount decimal,
  client_id uuid,
  user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _remaining_amount decimal;
  _invoice_record record;
BEGIN
  _remaining_amount := payment_amount;

  -- Process unpaid invoices from oldest to newest
  FOR _invoice_record IN
    SELECT id, balance
    FROM invoices
    WHERE client_id = client_id
    AND balance > 0
    AND created_by = user_id
    ORDER BY date ASC
  LOOP
    -- Calculate payment amount for this invoice
    DECLARE
      _invoice_payment decimal;
    BEGIN
      _invoice_payment := LEAST(_remaining_amount, _invoice_record.balance);
      
      -- Update invoice
      UPDATE invoices
      SET
        balance = balance - _invoice_payment,
        status = CASE 
          WHEN balance - _invoice_payment <= 0 THEN 'paid'
          ELSE 'partial'
        END,
        payments = COALESCE(payments, '[]'::jsonb) || jsonb_build_object(
          'id', payment_id,
          'amount', _invoice_payment,
          'date', CURRENT_DATE
        ),
        updated_at = now()
      WHERE id = _invoice_record.id;

      _remaining_amount := _remaining_amount - _invoice_payment;
      
      EXIT WHEN _remaining_amount <= 0;
    END;
  END LOOP;

  -- Record any overpayment
  IF _remaining_amount > 0 THEN
    INSERT INTO overpayments (
      client_id,
      payment_id,
      amount,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      client_id,
      payment_id,
      _remaining_amount,
      user_id,
      now(),
      now()
    );
  END IF;
END;
$$;
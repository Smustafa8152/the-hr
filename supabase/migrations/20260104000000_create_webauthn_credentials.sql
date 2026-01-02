-- WebAuthn Credentials Table
-- Stores WebAuthn public keys for employee attendance authentication
-- Private keys stay in the device (Secure Enclave)

CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  -- Credential Data
  credential_id TEXT NOT NULL UNIQUE, -- Base64 encoded credential ID
  public_key TEXT NOT NULL, -- Base64 encoded public key
  counter INTEGER NOT NULL DEFAULT 0, -- Replay attack prevention
  
  -- Registration Data (for verification)
  client_data_json TEXT, -- Client data from registration
  attestation_object TEXT, -- Attestation object from registration
  
  -- Metadata
  device_name TEXT, -- User-friendly device name (e.g., "iPhone", "Windows PC")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ, -- Last time this credential was used
  
  CONSTRAINT unique_credential_id UNIQUE(credential_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_employee_id 
  ON public.webauthn_credentials(employee_id);

CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id 
  ON public.webauthn_credentials(credential_id);

-- Enable RLS
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Employees can read their own credentials
DROP POLICY IF EXISTS "Employees can read their own webauthn credentials" ON public.webauthn_credentials;
CREATE POLICY "Employees can read their own webauthn credentials" ON public.webauthn_credentials
  FOR SELECT 
  USING (employee_id = (SELECT employee_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Employees can insert their own credentials (registration)
DROP POLICY IF EXISTS "Employees can register their own webauthn credentials" ON public.webauthn_credentials;
CREATE POLICY "Employees can register their own webauthn credentials" ON public.webauthn_credentials
  FOR INSERT 
  WITH CHECK (employee_id = (SELECT employee_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Employees can delete their own credentials
DROP POLICY IF EXISTS "Employees can delete their own webauthn credentials" ON public.webauthn_credentials;
CREATE POLICY "Employees can delete their own webauthn credentials" ON public.webauthn_credentials
  FOR DELETE 
  USING (employee_id = (SELECT employee_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Admins can read all credentials in their company
DROP POLICY IF EXISTS "Admins can read all webauthn credentials" ON public.webauthn_credentials;
CREATE POLICY "Admins can read all webauthn credentials" ON public.webauthn_credentials
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.user_roles ur ON e.company_id = ur.company_id
      WHERE e.id = webauthn_credentials.employee_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete credentials in their company
DROP POLICY IF EXISTS "Admins can delete webauthn credentials" ON public.webauthn_credentials;
CREATE POLICY "Admins can delete webauthn credentials" ON public.webauthn_credentials
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.user_roles ur ON e.company_id = ur.company_id
      WHERE e.id = webauthn_credentials.employee_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Update attendance_logs to use WebAuthn verification
ALTER TABLE IF EXISTS public.attendance_logs 
  ADD COLUMN IF NOT EXISTS webauthn_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS webauthn_credential_id TEXT,
  ADD COLUMN IF NOT EXISTS webauthn_device_name TEXT;

-- Update verification_method to include 'webauthn'
-- Note: This is a text field, so we can just use it as-is


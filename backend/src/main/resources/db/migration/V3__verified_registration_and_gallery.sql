ALTER TABLE otp_challenges ADD COLUMN reference_id VARCHAR(36) NULL;
CREATE INDEX idx_otp_reference ON otp_challenges(reference_id,channel,purpose,created_at);

CREATE TABLE pending_registrations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pending_registration_email ON pending_registrations(email,created_at);
CREATE INDEX idx_pending_registration_phone ON pending_registrations(phone,created_at);

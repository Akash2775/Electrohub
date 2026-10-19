ALTER TABLE users ADD COLUMN phone VARCHAR(15) NULL;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX uq_users_phone ON users(phone);

CREATE TABLE otp_challenges (
 id VARCHAR(36) PRIMARY KEY,
 user_id VARCHAR(36) NULL,
 channel VARCHAR(10) NOT NULL,
 destination VARCHAR(254) NOT NULL,
 purpose VARCHAR(30) NOT NULL,
 code_hash VARCHAR(128) NULL,
 expires_at TIMESTAMP NOT NULL,
 attempts INT NOT NULL DEFAULT 0,
 consumed_at TIMESTAMP NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX idx_otp_destination ON otp_challenges(channel,destination,purpose,created_at);

CREATE TABLE notifications (
 id VARCHAR(36) PRIMARY KEY,
 user_id VARCHAR(36) NOT NULL,
 type VARCHAR(40) NOT NULL,
 title VARCHAR(160) NOT NULL,
 message VARCHAR(1000) NOT NULL,
 link_url VARCHAR(500) NULL,
 read_at TIMESTAMP NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user ON notifications(user_id,created_at);

CREATE TABLE reviews (
 id VARCHAR(36) PRIMARY KEY,
 product_id VARCHAR(36) NOT NULL,
 user_id VARCHAR(36) NOT NULL,
 order_id VARCHAR(36) NOT NULL,
 rating INT NOT NULL,
 title VARCHAR(120) NOT NULL DEFAULT '',
 body VARCHAR(2000) NOT NULL DEFAULT '',
 status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,product_id),
 FOREIGN KEY(product_id) REFERENCES products(id),
 FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(order_id) REFERENCES orders(id),
 CHECK(rating BETWEEN 1 AND 5)
);
CREATE INDEX idx_reviews_product ON reviews(product_id,status,created_at);

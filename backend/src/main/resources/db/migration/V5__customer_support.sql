CREATE TABLE IF NOT EXISTS support_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(30) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_requests_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_support_user_created (user_id, created_at)
);

SET @support_idx_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'support_requests'
      AND index_name = 'idx_support_user_created'
);

SET @support_idx_sql = IF(
    @support_idx_exists = 0,
    'CREATE INDEX idx_support_user_created ON support_requests(user_id, created_at)',
    'SELECT 1'
);

PREPARE support_idx_stmt FROM @support_idx_sql;
EXECUTE support_idx_stmt;
DEALLOCATE PREPARE support_idx_stmt;

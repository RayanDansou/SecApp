-- SecApp Database Initialization Script
-- This script runs automatically when the database is first created

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE secapp TO secapp_user;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE '✅ SecApp database initialized successfully!';
END $$;
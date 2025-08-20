-- SkillShareHub Database Initialization
-- This script sets up the database users and permissions

-- Create application user for development
CREATE USER skillsharehub_app WITH PASSWORD 'app_password';

-- Create test database for testing
CREATE DATABASE skillsharehub_test;

-- Grant all privileges on main database to app user
GRANT ALL PRIVILEGES ON DATABASE skillsharehub TO skillsharehub_app;
GRANT ALL PRIVILEGES ON DATABASE skillsharehub_test TO skillsharehub_app;

-- Connect to main database and set up schema permissions
\c skillsharehub;
GRANT ALL ON SCHEMA public TO skillsharehub_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO skillsharehub_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO skillsharehub_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO skillsharehub_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO skillsharehub_app;

-- Connect to test database and set up schema permissions
\c skillsharehub_test;
GRANT ALL ON SCHEMA public TO skillsharehub_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO skillsharehub_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO skillsharehub_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO skillsharehub_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO skillsharehub_app;

-- Switch back to main database
\c skillsharehub;

-- Create extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Switch to test database and create extension there too
\c skillsharehub_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Final success message
\echo 'Database initialization completed successfully!';

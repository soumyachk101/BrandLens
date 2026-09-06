-- Environment setup script for BrandLens backend
-- Run this to create the database and apply migrations

DB_NAME=brandlens
DB_USER=brandlens
DB_PASS=devpass

echo "Creating database $DB_NAME..."
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"

echo "Creating user $DB_USER..."
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User may already exist"

echo "Granting privileges..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "Applying migration..."
psql -U $DB_USER -d $DB_NAME -f supabase/migrations/001_initial_schema.sql

echo "Seeding data..."
psql -U $DB_USER -d $DB_NAME -f supabase/migrations/002_seed_data.sql

echo "Database setup complete!"

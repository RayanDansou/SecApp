#!/bin/bash
set -e

echo "🚀 Starting SecApp Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Run migrations
echo "📦 Running database migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if it doesn't exist
echo "👤 Creating default superuser if needed..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@secapp.local', 'Admin123!', role='ADMIN')
    print('✅ Superuser created: admin / Admin123!')
else:
    print('ℹ️  Superuser already exists')
END

echo "✅ Backend initialization complete!"
echo "🎯 Starting application server..."

# Execute the main command
exec "$@"
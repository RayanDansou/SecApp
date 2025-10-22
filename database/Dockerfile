# PostgreSQL Dockerfile - Custom database image
FROM postgres:16-alpine

# Set environment variables
ENV POSTGRES_DB=secapp \
    POSTGRES_USER=secapp_user \
    POSTGRES_PASSWORD=secapp_password

# Copy initialization scripts
COPY init/ /docker-entrypoint-initdb.d/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

EXPOSE 5432
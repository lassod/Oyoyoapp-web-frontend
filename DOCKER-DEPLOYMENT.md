# Docker Deployment Guide

This guide explains how to deploy the web app using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Access to a PostgreSQL database

## Setup

1. Update environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgresql://username:password@host:port/database
  - CONNECTION_POOLING=postgresql://username:password@host:port/database
  - DIRECT_URL=postgresql://username:password@host:port/database
```

## Deployment

### Building and starting the container

From the web app directory:

```bash
docker-compose up -d --build
```

This will:
1. Build the Docker image using the Dockerfile
2. Start a container with the Next.js app running on port 3000

### Viewing logs

```bash
docker-compose logs -f
```

### Stopping the container

```bash
docker-compose down
```

## Building from root directory

If you're in the root of the monorepo, you can build the web app with:

```bash
docker build -t events-web -f apps/web/Dockerfile .
docker run -p 3000:3000 --env-file apps/web/.env.production events-web
```

## Environment Variables

Create a `.env.production` file (not tracked by git) with these variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
CONNECTION_POOLING=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database
# Add other required environment variables here
```

## Troubleshooting

- **Database connection issues**: Ensure your database is accessible from the container network.
- **Build failures**: Check that all required files are being copied into the image.
- **Runtime errors**: Use `docker-compose logs` to view the application logs for errors. 
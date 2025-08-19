# CI Setup Guide

This guide explains how to set up and run the CI pipeline locally, and how to troubleshoot common issues.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (can be run via Docker)

## Local CI Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Test Database

The CI uses a separate test database to avoid interfering with your development database.

```bash
# Start PostgreSQL container for testing
docker run --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=skillsharehub_test \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:15

# Wait for database to be ready
docker exec postgres-test pg_isready -U postgres
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Set Up Test Database Schema

```bash
cd apps/api
npx prisma db push --force-reset
cd ../..
```

## Running CI Commands Locally

### Typecheck (TypeScript Validation)

```bash
npm run ci:typecheck
```

This will:

1. Generate the Prisma client
2. Run TypeScript checks across all workspaces

### Tests

```bash
npm run ci:test
```

This will:

1. Generate the Prisma client
2. Run tests across all workspaces

### Build

```bash
npm run ci:build
```

This will:

1. Generate the Prisma client
2. Build all packages and applications

## Individual Workspace Commands

### API

```bash
# Typecheck
npm run typecheck --workspace=api

# Tests
npm run test --workspace=api

# Build
npm run build --workspace=api
```

### Web

```bash
# Typecheck
npm run typecheck --workspace=web

# Build
npm run build --workspace=web
```

### Packages

```bash
# Types package
npm run typecheck --workspace=@skill-share-hub/types
npm run build --workspace=@skill-share-hub/types

# UI package
npm run typecheck --workspace=@skill-share-hub/ui
npm run build --workspace=@skill-share-hub/ui
```

## Troubleshooting

### Prisma Client Not Generated

If you see errors about missing Prisma types:

```bash
cd apps/api
npm run db:generate
cd ../..
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check the DATABASE_URL in your environment
3. Verify database permissions

### Test Failures

1. Ensure test database is set up correctly
2. Check that test environment variables are loaded
3. Verify database schema matches Prisma schema

### Infinite Recursion in Scripts

The old recursive npm scripts caused infinite loops. These have been replaced with explicit workspace-specific commands.

## GitHub Actions

The CI pipeline runs automatically on:

- Push to main/develop branches
- Pull requests to main/develop branches

The workflow:

1. Sets up PostgreSQL service container
2. Installs dependencies
3. Generates Prisma client
4. Sets up test database
5. Runs typecheck, tests, and builds
6. Tests on Node.js 18 and 20

## Environment Variables

### Required for Tests

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `NODE_ENV`: Set to 'test'

### Required for Build

- All environment variables from `.env.example`

## Security

- Regular `npm audit` runs in CI
- Dependencies are updated regularly
- Known vulnerabilities are addressed promptly

# Database Scripts

This directory contains scripts for managing the database in development and production.

## Available Scripts

### Development Setup
```bash
# Complete database setup for development
# - Drops all tables
# - Generates migrations from schema
# - Applies migrations
npm run db:setup
```

### Migration Management
```bash
# Generate migrations from schema changes
npm run db:migrate:generate

# Apply pending migrations to database
npm run db:migrate:apply

# Check migration status
npm run db:migrate:status
```

### Database Studio
```bash
# Open Drizzle Studio for database management
npm run db:studio
```

## Environment Requirements

Make sure you have the following environment variables set in your `.env` file:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/shor_database
```

## Development Workflow

1. **Initial Setup**: Run `npm run db:setup` to set up the database from scratch
2. **Schema Changes**: Modify schema files in `src/db/schemas/`
3. **Generate Migrations**: Run `npm run db:migrate:generate` to create migration files
4. **Apply Migrations**: Run `npm run db:migrate:apply` to apply changes to database
5. **Verify**: Use `npm run db:studio` to inspect the database

## Safety Notes

- The `db:setup` script only works in development mode
- It will drop all existing tables and data
- Always backup your production database before running migrations
- Test migrations in development before applying to production

## Troubleshooting

- **Connection Issues**: Check your `DATABASE_URL` in the `.env` file
- **Migration Errors**: Ensure your schema is valid and all imports are correct
- **Permission Issues**: Make sure your database user has the necessary permissions

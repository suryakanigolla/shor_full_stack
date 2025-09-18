# Shor Backend API

A modern, type-safe backend API built for a dance studio management platform. This API handles user authentication, role-based permissions, class bookings, studio rentals, and gig management.

## 🚀 Tech Stack

### Core Framework
- **[Hono](https://hono.dev/)** - Fast, lightweight web framework for TypeScript
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript with static typing
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL ORM with excellent TypeScript support
- **[Drizzle Kit](https://kit.drizzle.team/)** - Database migration and introspection tools

### Authentication & Security
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library with built-in security features
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)** - Cross-origin resource sharing

### Development Tools
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript execution and REPL for Node.js
- **[Pino](https://getpino.io/)** - Fast JSON logger
- **[OpenAPI](https://www.openapis.org/)** - API documentation with Scalar

### Build & Deployment
- **[tsc-alias](https://github.com/justkey007/tsc-alias)** - TypeScript path mapping
- **[cross-env](https://github.com/kentcdodds/cross-env)** - Cross-platform environment variables

## 📁 Project Structure

```
src/
├── app.ts                 # Main application setup
├── index.ts              # Application entry point
├── env.ts                # Environment configuration with validation
├── db/
│   ├── config.ts         # Database connection and configuration
│   ├── migrate.ts        # Migration utilities
│   ├── schemas/          # Database schemas organized by domain
│   │   ├── core/         # Core authentication and permission schemas
│   │   ├── user-types/   # User type extensions (artists, studios, students)
│   │   ├── features/     # Feature-specific schemas (classes, gigs, rentals)
│   │   └── shared/       # Shared schemas and enums
│   └── migrations/       # Generated database migrations
├── lib/
│   ├── auth.ts           # Authentication configuration
│   ├── create-app.ts     # Application factory
│   └── configure-open-api.ts # OpenAPI documentation setup
├── middlewares/
│   └── pino-logger.ts    # Request logging middleware
├── routes/
│   ├── auth/             # Authentication routes
│   └── index.route.ts    # Main route definitions
└── scripts/
    ├── setup-db.ts       # Database setup script
    └── seed-roles.ts     # Role and permission seeding
```

## 🗄️ Database Schema

The database is designed with a flexible, role-based permission system:

### Core Tables
- **users** - User accounts with authentication
- **roles** - System roles (student, artist, studio_owner, admin)
- **actions** - Available permissions/actions
- **user_roles** - User-role assignments
- **role_permissions** - Role-permission mappings
- **sessions** - User sessions and OAuth accounts

### User Type Extensions
- **artists** - Dance artists who teach classes
- **studios** - Studio owners who rent spaces
- **students** - Dance students who book classes

### Feature Tables
- **classes** - Dance classes and bookings
- **studio_bookings** - Studio rental bookings
- **gigs** - Performance opportunities and applications

## 🛠️ Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## ⚙️ Environment Setup

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Configure your environment variables in `.env`:**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/shor_database
   
   # Better Auth Configuration
   BETTER_AUTH_SECRET=your-32-character-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   
   # Optional: OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Generate a secure secret key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Set up database tables and seed initial data
npm run db:setup
```

This command will:
- Test database connection
- Drop existing tables (development only)
- Generate migrations from schema
- Apply migrations to create tables
- Seed roles and permissions

### 3. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run test suite with Vitest |
| `npm run db:setup` | Set up database and seed data |
| `npm run db:migrate:generate` | Generate new migration from schema changes |
| `npm run db:migrate:apply` | Apply pending migrations |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## 🔧 Database Management

### Creating Migrations
When you modify database schemas, generate a new migration:
```bash
npm run db:migrate:generate
```

### Applying Migrations
Apply pending migrations to your database:
```bash
npm run db:migrate:apply
```

### Database Studio
Open Drizzle Studio to explore your database:
```bash
npm run db:studio
```

## 🧪 Testing

The project includes a comprehensive test suite built with **Vitest** and **Hono's testing utilities**. Tests cover authentication flows, user registration, validation, and error handling.

### Test Framework
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Hono Testing](https://hono.dev/guides/testing)** - Testing utilities for Hono applications
- **Test Database** - Isolated test environment with automatic cleanup

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/test/auth.test.ts
```

### Test Environment Setup

Tests automatically:
- Set `NODE_ENV=test` for isolated testing
- Use a separate test database
- Clean up data between test runs
- Reset database state before each test suite

### Test Coverage

The test suite includes comprehensive coverage for:

#### Authentication Tests (`src/test/auth.test.ts`)
- **User Registration**
  - Student, artist, and studio owner registration
  - Input validation (email format, password strength, required fields)
  - Duplicate email handling
  - Role-based user creation

- **User Login**
  - Valid credential authentication
  - Invalid password/email handling
  - Input validation

- **User Profile Management**
  - Profile retrieval with authentication
  - Profile updates with validation
  - Password change functionality
  - Session management

- **Password Recovery**
  - Forgot password flow
  - Email verification (when implemented)
  - Input validation

- **Session Management**
  - Session creation and validation
  - Logout functionality
  - Token-based authentication

### Test Data Management

Tests use predefined test data for different user types:

```typescript
const testUsers = {
    student: {
        email: "student@test.com",
        password: "password123",
        name: "Test Student",
        // ... other fields
    },
    artist: {
        email: "artist@test.com",
        // ... artist-specific fields
    },
    studio: {
        email: "studio@test.com",
        // ... studio-specific fields
    }
};
```

### Database Cleanup

Each test suite includes automatic database cleanup:
- Clears all test data before and after tests
- Maintains referential integrity during cleanup
- Ensures test isolation

### Writing New Tests

When adding new features, follow these testing patterns:

1. **Create test file** in `src/test/` directory
2. **Use test utilities** from Hono testing
3. **Set up test data** with proper cleanup
4. **Test both success and error cases**
5. **Validate input/output schemas**

Example test structure:
```typescript
import { testClient } from "hono/testing";
import { describe, it, expect, beforeEach, afterAll } from "vitest";

describe("Feature Name", () => {
    beforeEach(async () => {
        // Setup test data
    });

    afterAll(async () => {
        // Cleanup test data
    });

    it("should handle success case", async () => {
        // Test implementation
    });

    it("should handle error case", async () => {
        // Error testing
    });
});
```

### Test Configuration

Test configuration is defined in `vitest.config.ts`:
- Node.js environment
- TypeScript path aliases (`@/` for `src/`)
- Global test utilities enabled

## 🔐 Authentication

The API uses Better Auth for authentication with support for:
- Email/password authentication
- OAuth providers (Google)
- Session management
- Role-based access control

### Default Roles
- **student** - Can book classes and studios
- **artist** - Can teach classes and apply for gigs
- **studio_owner** - Can rent out studio spaces
- **admin** - Full system access

## 📖 API Documentation

Once the server is running, visit:
- **API Documentation**: `http://localhost:3000/reference`
- **Health Check**: `http://localhost:3000/health`

## 🏗️ Development

### Type Safety
The project is fully type-safe with:
- Database schemas with TypeScript types
- Request/response validation with Zod
- End-to-end type safety from database to API

### Code Organization
- **Schemas** are organized by domain (core, features, user-types)
- **Routes** are modular and feature-based
- **Middleware** handles cross-cutting concerns
- **Scripts** automate common tasks

### Adding New Features
1. Define database schemas in `src/db/schemas/`
2. Generate and apply migrations
3. Create route handlers in `src/routes/`
4. Add OpenAPI documentation
5. Update types and exports

## 🚀 Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   - `NODE_ENV=production`
   - `DATABASE_URL` with production database
   - `BETTER_AUTH_SECRET` with secure secret
   - `BETTER_AUTH_URL` with production domain

3. **Start the production server:**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run typecheck`
5. Run tests: `npm run test`
6. Ensure all tests pass and add tests for new features
7. Submit a pull request

### Testing Requirements
- All new features must include comprehensive tests
- Tests should cover both success and error scenarios
- Maintain test coverage for existing functionality
- Follow the established testing patterns in `src/test/`

## 📄 License

This project is licensed under the ISC License.

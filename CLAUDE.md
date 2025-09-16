# CLAUDE.md

## Date and relevant Info

- Project Start August 2025
- Language of the UI - Spanish (UY)

## Project definition

This is a Next.js 15 real estate platform for Domera, a pre-construction property investment platform operating in Uruguay. The project uses the App Router with TypeScript, Tailwind CSS v4, and Supabase as backend.

## Tech and business Information

### Tech Stack

- **Backend**: PRISMA orm to interact with Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Autentication**: NextAuth.js with Supabase
- **Notifications**: only email with Resend
- **Real-time**: Supabase Real-time channels (no Socket.io)
- **Validations**: multiple layers (Middleware → API/Server Actions → Data Access Layer)

### Key Frontend Patterns

- **App Router Structure**: Uses Next.js 15 App Router with file-based routing
- **Component Architecture**: Modular components in `src/components/` with clear separation of concerns
- **Styling**: Tailwind CSS v4 with custom brand colors and responsive design
- **State Management**: React useState for local component state, Supabase for global state

### BACKEND ARCHITECTURE

1. **Server Actions** - Core business logic and data mutations
2. **API Endpoints** - When needed for specific integrations
3. **Data Access Layer** - Secure CRUD operations though Prisma ORM, with validations (ONLY entry point to access database, except for auth)

#### Business Restrictions:

- **NO internal payments**: Only receipt management as documents
- **NO public registry**: Only admins create owners and professionals, owners creates organization members and change their roles
- **One active operation per user**: Strict locking system, one active operation for each unit, no matter what type of unit it is
- **NO data deletion**: Only corrections with history.
- **NO integrated digital signature**: Only external links to Abitab/Agesic
- **NO live chat or SMS**: Only email notifications

#### Users and Roles (RBAC):

- **Domera Admin**: Full management, onboarding, compliance
- **Organization Owner**: Developer management
- **Sales Manager**: Sales management
- **Finance**: Financial management
- **Site Manager**: Construction management
- **Professional**: Notary and accounting
- **User**: Buyer/Investor

## CRITICAL GUIDELINES

- avoid UseEffects as much as possible. Effects are an escape hatch from the React paradigm. Don't rush to add Effects.
- Prefer Interfaces over Classes as mmuch as possible, only use Classes when strict needed for functionallity.
- Ensure we use prisma and not bypass it with direct supabase connections in order to have accurate process.
- Clean Architecture:
  - Each DAL handles only its model.
  - Each server actions also handles only its model.
- No Cross-Access: Business logic properly separated

### Security

**Authentication**: Every action validates user session
**Authorization**: Role-based access control (RBAC)
**Input Validation**: Zod schemas for all inputs
**Multi-tenant**: Organization-based data isolation
**No Direct DB Access**: Always through DAL, and with proper validations
- do not open new terminals, if its not strict neccesary and or if i have other terminar running, i need to see the logs myself.
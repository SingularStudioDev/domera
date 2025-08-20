# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Architecture

This is a Next.js 15 real estate platform for Domera, a pre-construction property investment platform operating in Uruguay. The project uses the App Router with TypeScript, Tailwind CSS v4, and Supabase as backend.

### Stack Tecnológico Confirmado (Agosto 2025)

- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Autenticación**: NextAuth.js integrado con Supabase
- **Notificaciones**: Solo email con Resend
- **Real-time**: Supabase Real-time channels (no Socket.io)
- **Validación**: Múltiples capas (Middleware → API/Server Actions → Data Access Layer)

### Key Architecture Patterns

- **App Router Structure**: Uses Next.js 15 App Router with file-based routing
- **Component Architecture**: Modular components in `src/components/` with clear separation of concerns
- **Styling**: Tailwind CSS v4 with custom brand colors and responsive design
- **State Management**: React useState for local component state, Supabase for global state
- **Images**: Static assets in `public/` folder, uses Next.js Image component for optimization
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)

### Core Routes and Pages

- `/` - Homepage with Hero, Partners, Projects, Process sections
- `/projects` - Project listing page
- `/projects/[id]` - Dynamic project detail page with gallery, description, amenities
- `/projects/[id]/units/[unitId]` - Individual unit detail page
- `/dashboard` - Organization dashboard
- `/userDashboard` - User dashboard for active operations

### Component Structure

**Layout Components:**

- `Header.tsx` - Navigation with responsive menu
- `Footer.tsx` - Contact information and links
- `Hero.tsx` - Main hero section with statistics

**Feature Components:**

- `ProjectCard.tsx` - Reusable project card with hover effects and custom SVG styling
- `Projects.tsx` - Project grid container
- `Partners.tsx` - Partner logos section
- `Process.tsx` - Investment process steps

### Business Model y Restricciones Importantes

#### Restricciones de Negocio:

- **NO pagos internos**: Solo gestión de comprobantes como documentos
- **NO registro público**: Solo admins crean usuarios, owners agregan roles
- **Una operación activa por usuario**: Sistema de bloqueo estricto
- **NO eliminación de datos**: Solo correcciones con historial
- **NO firma digital integrada**: Solo enlaces externos a Abitab/Agesic
- **NO chat en vivo ni SMS**: Solo notificaciones email

#### Usuarios y Roles (RBAC):

- **Admin Domera**: Gestión completa, onboarding, compliance
- **Organization Owner**: Gestión de desarrolladora
- **Sales Manager**: Gestión de ventas
- **Finance**: Gestión financiera
- **Site Manager**: Gestión de obra
- **Professional**: Escribanía y Contaduría (externos)
- **User**: Comprador/Inversor

#### Flujo de Operaciones:

1. Usuario selecciona unidad (apartamento, cochera , bodega, etc)
2. Se genera una operación única (bloquea al usuario para otras)
3. Se asigna profesional y se generan documentos
4. Usuario descarga, firma externamente (Abitab/Agesic) y sube documentos
5. Profesional valida documentos y proceso
6. Operación se completa y usuario queda libre para nueva operación

### Data Access Layer y Validaciones

#### Sistema de Validaciones en 3 Capas:

```typescript
// 1. Middleware de rutas protegidas
// 2. Validaciones en Server Actions/API Routes
// 3. Validaciones finales en Data Access Layer
```

#### Principios de Datos:

- **Auditoría completa**: Cada acción queda registrada en audit_logs
- **Sin eliminaciones**: Sistema de correcciones con historial
- **Una operación por usuario**: Control estricto de estado
- **Documentos seguros**: Tipos diferenciados y acceso controlado

### Key Technical Details

- **TypeScript Configuration**: Strict mode enabled with path aliases `@/*` for `src/*`
- **Styling Approach**: Uses Tailwind utility classes with custom brand colors (domera-blue: #2563eb, domera-navy: #1e3a8a)
- **Image Handling**: regular img tags
- **Responsive Design**: Mobile-first approach with md: and lg: breakpoints
- **Animations**: CSS transitions and hover effects, uses Framer Motion library
- **Database Security**: Row Level Security (RLS) configurado por rol y organización

### React Patterns and Best Practices

#### 🚫 **AVOID useEffect - Critical Guidelines**

**Core Philosophy**: "Effects are an escape hatch from the React paradigm. Don't rush to add Effects."

**What NOT to use Effects for:**

- ❌ **Transforming data for rendering** - Calculate during render instead
- ❌ **Handling user events** - Use event handlers directly
- ❌ **Data fetching on component mount** - Use framework patterns (Server Components, etc.)
- ❌ **Synchronizing state between components** - Lift state up or use shared state

**Preferred Patterns for Domera Platform:**

```typescript
// ✅ GOOD: Calculate derived state during rendering
function ProjectList({ projects, selectedFilters }) {
  const filteredProjects = projects.filter(project =>
    matchesFilters(project, selectedFilters)
  );
  return <div>{/* render */}</div>;
}

// ✅ GOOD: Handle user interactions in event handlers
function FavoriteButton({ unitId }) {
  async function handleToggle() {
    const result = await toggleFavorite(unitId);
    if (result.success) {
      // Revalidate or redirect
    }
  }
  return <button onClick={handleToggle}>Toggle</button>;
}

// ✅ GOOD: Use useMemo for expensive calculations only
function ExpensiveCalculation({ largeDataSet }) {
  const expensiveValue = useMemo(() =>
    complexCalculation(largeDataSet), [largeDataSet]
  );
  return <div>{expensiveValue}</div>;
}

// ❌ AVOID: Chaining Effects or state synchronization
// Instead: lift state up or use derived state
```

**Data Fetching Strategy:**

- **Server Components**: Fetch data at page level
- **Server Actions**: Handle form submissions and mutations
- **Event Handlers**: Handle user-triggered data changes
- **Cache revalidation**: Use `revalidatePath()` after mutations

**State Management Principles:**

- Store minimal state (IDs instead of objects)
- Calculate derived state during rendering
- Use "key" prop to reset component state
- Lift state up for component synchronization

### Backend-First Development Strategy

#### 🎯 **CORE FOCUS: Backend Functionality**

**Development Priority:**

1. **Server Actions** - Core business logic and data mutations
2. **API Endpoints** - When needed for specific integrations
3. **Data Access Layer** - Secure CRUD operations with validation
4. **Frontend** - Will be implemented later by specialized frontend developers

**Backend Design Principles:**

- ✅ **Simplicity for Frontend**: Easy-to-use Server Actions with clear interfaces
- ✅ **Security First**: All operations properly authenticated and authorized
- ✅ **No Overcomplexity**: Straightforward data fetching and CRUD operations
- ✅ **Clear Documentation**: Well-defined interfaces and error handling
- ✅ **Type Safety**: Full TypeScript support for frontend integration

**What Backend Should Provide:**

```typescript
// ✅ GOOD: Simple, secure Server Actions
export async function getUserFavorites(): Promise<FavoriteResult>;
export async function addToFavorites(unitId: string): Promise<FavoriteResult>;
export async function getProjectsWithFeatures(): Promise<ProjectResult>;

// ✅ GOOD: Clear result types
interface FavoriteResult {
  success: boolean;
  data?: FavoriteUnit[];
  error?: string;
}
```

**Security Non-Negotiables:**

- 🔒 **Authentication**: Every action validates user session
- 🔐 **Authorization**: Role-based access control (RBAC)
- 🛡️ **Input Validation**: Zod schemas for all inputs
- 🏢 **Multi-tenant**: Organization-based data isolation
- 📝 **Audit Trail**: All changes logged to audit_logs
- 🚫 **No Direct DB Access**: Always through DAL with validations

### Esquema de Base de Datos

#### Tablas Principales:

```sql
-- Usuarios y organizaciones
users, organizations, user_roles

-- Proyectos y propiedades
projects, units, unit_types, amenities

-- Operaciones y documentos
operations, operation_steps, documents, document_types

-- Profesionales y validaciones
professionals, professional_assignments, validations

-- Notificaciones y auditoría
notifications, audit_logs, data_corrections
```

#### Tipos de Propiedades:

- Apartamentos, locales comerciales, cocheras, bodegas
- Sistema individual para operaciones (unidad, cochera, etc son 1 operación)
- Estados: disponible, reservado, vendido, en_proceso

### Data Patterns (Migración Planificada)

- **Actual**: Project data hardcoded in component files
- **Futuro**: Data completamente en Supabase con Server Actions
- Unit filtering implemented with React state for floor, typology, and orientation
- Project data structure includes: title, price, location, date, images, amenities, units

### Important Notes

- The brand is "Domera"
- Uses Inter font from Google Fonts
- Spanish language interface (lang="es")
- Has Projects that operates under "Ley de Vivienda Promovida N°18.795" (Uruguay)
- Currency: USD for all transactions
- Target market: Montevideo areas (Pocitos, Carrasco, La Blanqueada), Maldonado and Punta del Este for now.

### Timeline de Implementación

**Fase 1-3** (9-12 días): Setup Supabase, esquema DB, autenticación
**Fase 4-6** (9-12 días): Sistema de operaciones, documentos, dashboards
**Fase 7-9** (8-11 días): Real-time, migración de datos, seguridad

**Total Estimado**: 26-35 días

## ✅ ESTADO ACTUAL DE DESARROLLO (Agosto 17, 2025)

### 🔥 COMPLETADO - FASE 1: Infraestructura Base

#### ✅ 1. Configuración de Supabase

- **Archivos creados:**
  - `src/lib/supabase/client.ts` - Cliente browser
  - `src/lib/supabase/server.ts` - Cliente servidor
  - `src/lib/supabase/middleware.ts` - Manejo de sesiones
  - `.env.local.example` - Variables de entorno
- **Estado**: ✅ **COMPLETADO**

#### ✅ 2. Esquema de Base de Datos

- **Archivos creados:**
  - `supabase/schema.sql` - Esquema completo (35 tablas + triggers + indexes)
  - `supabase/rls-policies.sql` - Políticas de seguridad RLS por rol
  - `supabase/seed-data.sql` - Datos de prueba completos
- **Características implementadas:**
  - 🔒 Row Level Security (RLS) por rol y organización
  - 📊 Sistema de auditoría completo
  - 🚫 Sin eliminación física (solo correcciones)
  - 📋 Tipos de entidades: organizations, users, projects, units, operations, documents, professionals
- **Estado**: ✅ **COMPLETADO**

#### ✅ 3. Tipos TypeScript

- **Archivos creados:**
  - `src/types/database.ts` - Tipos completos para todas las entidades
  - `src/types/next-auth.d.ts` - Extensiones para NextAuth
- **Estado**: ✅ **COMPLETADO**

#### ✅ 4. Validaciones Zod

- **Archivos creados:**
  - `src/lib/validations/schemas.ts` - Esquemas Zod para todas las entidades
- **Características:**
  - ✅ Validación de entrada para CREATE/UPDATE
  - ✅ Esquemas de filtros y paginación
  - ✅ Validaciones de archivos y documentos
- **Estado**: ✅ **COMPLETADO**

#### ✅ 5. Data Access Layer (DAL)

- **Archivos creados:**
  - `src/lib/dal/base.ts` - Funciones base y utilities
  - `src/lib/dal/operations.ts` - CRUD de operaciones con validaciones
  - `src/lib/dal/projects.ts` - CRUD de proyectos y unidades
- **Características implementadas:**
  - 🛡️ **3 capas de validación**: Middleware → Server Actions → DAL
  - 📝 **Auditoría automática**: Todos los cambios quedan registrados
  - 🔄 **Sistema de correcciones**: Historial sin eliminación
  - ⚡ **Validaciones de negocio**: Una operación activa por usuario
  - 🏢 **Multi-tenant**: Validación por organización
- **Estado**: ✅ **COMPLETADO**

### 🔥 COMPLETADO - FASE 2: Autenticación y Autorización

#### ✅ 6. NextAuth.js + Supabase

- **Archivos creados:**
  - `src/lib/auth/config.ts` - Configuración NextAuth completa
  - `src/app/api/auth/[...nextauth]/route.ts` - API routes
  - `middleware.ts` - Protección de rutas por rol
- **Características implementadas:**
  - 🔐 **Autenticación por credenciales** (desarrollo)
  - 🎭 **7 roles de usuario**: admin, organization_owner, sales_manager, finance_manager, site_manager, professional, user
  - 🏢 **Multi-organización**: Usuarios pueden pertenecer a múltiples organizaciones
  - 🛡️ **Protección automática**: Middleware que valida roles por ruta
- **Estado**: ✅ **COMPLETADO**

#### ✅ 7. Hooks de Autenticación

- **Archivos creados:**
  - `src/hooks/useAuth.ts` - Hooks personalizados completos
  - `src/components/providers/SessionProvider.tsx` - Provider de sesión
- **Hooks disponibles:**
  - `useAuth()` - Estado de autenticación
  - `useHasRole(role, orgId?)` - Verificar rol específico
  - `useIsAdmin()` - Verificar si es admin
  - `useRequireAuth()` - Requerir autenticación
  - `useRequireRole(role, orgId?)` - Requerir rol específico
  - `useBelongsToOrganization(orgId)` - Verificar membresía
- **Estado**: ✅ **COMPLETADO**

#### ✅ 8. Página de Login Actualizada

- **Archivos modificados:**
  - `src/app/login/page.tsx` - Integrada con NextAuth
  - `src/app/layout.tsx` - SessionProvider incluido
- **Características:**
  - 🔄 **Auto-redirect**: Redirección basada en rol
  - ⚠️ **Manejo de errores**: Mensajes de error claros
  - 🔒 **Estados de carga**: UI disabled durante autenticación
  - 📱 **Responsive**: Mantiene diseño original
- **Estado**: ✅ **COMPLETADO**

#### ✅ 9. Corrección de Variables de Entorno

- **Archivos corregidos:**
  - `.env` → `.env.local` - Renombrado para Next.js
  - `NEXTAUTH_SECRET` - Configurado con valor válido
  - `NEXTAUTH_URL` - Actualizado a puerto 3000
- **Estado**: ✅ **COMPLETADO**

### ✅ COMPLETADO - FASE 3: Setup Base de Datos

#### ✅ 10. Integración Prisma y Migración

- **Archivos creados:**
  - `prisma/schema.prisma` - Esquema Prisma completo con modelos
  - `prisma/migrations/20250817195254_init/` - Migración inicial aplicada
  - `scripts/seed-database.js` - Script de siembra con datos completos
  - `scripts/test-db-connection.js` - Validación de conexión
- **Funcionalidades:**
  - 🗃️ **Prisma ORM**: Configurado y conectado a Supabase
  - 📦 **Migración exitosa**: Esquema aplicado con directUrl
  - 🌱 **Datos de prueba**: Base de datos poblada con:
    - Organización: Domera Development
    - Usuario admin: prueba@test.com (Password: Password.123)
    - 2 proyectos: Torres del Río + Urban Living Cordón
    - 5 unidades con diferentes tipos y estados
    - 1 profesional verificado (escribania)
  - ✅ **Prisma Client**: Listo
  - 🔒 **RoleType enum**: Listo
- **Estado**: ✅ **COMPLETADO**

#### ✅ 11. Sistema de Autenticación con Contraseñas Seguras

- **Archivos creados/modificados:**
  - `src/lib/auth/password.ts` - Utilidades de hashing con bcryptjs
  - `src/lib/validations/schemas.ts` - Validaciones de contraseñas y login
  - `src/lib/auth/config.ts` - NextAuth actualizado con verificación de BD
  - `scripts/seed-database.js` - Script actualizado con múltiples usuarios
  - `scripts/test-authentication.js` - Test de verificación del sistema
- **Funcionalidades:**
  - 🔐 **Hash seguro**: bcryptjs con salt rounds 12 (nivel producción)
  - 🎭 **Múltiples usuarios**: 4 usuarios de prueba con roles diferentes
  - ✅ **Validación robusta**: Zod schemas para contraseñas y login
  - 🔒 **Verificación completa**: NextAuth verifica contra BD hasheada
  - 🧪 **Testing**: Script de pruebas automáticas del sistema
- **Usuarios de prueba (Password: Password.123):**
  - `admin@domera.uy` - Super Admin
  - `owner@domera.uy` - Organization Owner
  - `prueba@test.com` - Admin (usuario original)
  - `user@domera.uy` - Cliente Regular
- **Estado**: ✅ **COMPLETADO - SIN SHORTCUTS DE DESARROLLO**

### ⏳ PENDIENTE - FASE 4: Sistema de Operaciones

#### 🔄 Próximo: Server Actions y API Routes

- **Pendiente**: Migrar datos hardcodeados a Server Actions
- **Pendiente**: Crear API routes para operaciones
- **Pendiente**: Implementar hooks para operaciones activas

### ⏳ PENDIENTE - FASES 4-9

#### Pendiente: Sistema de Documentos

#### Pendiente: Real-time con Supabase

#### Pendiente: Migración completa de datos

#### Pendiente: Dashboard funcional

#### Pendiente: Gestión de profesionales

- Ensure we use prisma and not bypass it with direct supabase connections in order to have accurate process.
- remember our dev server runs on port 3000

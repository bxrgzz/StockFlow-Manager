# StockTech - Inventory Management System

## Overview

StockTech is a professional inventory management system built with a modern full-stack architecture. The application provides real-time stock tracking, automated alerts for low inventory levels, movement history tracking, and comprehensive dashboard analytics. It's designed for businesses that need efficient inventory control with clear visibility into stock levels and movement patterns.

The system follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database, using Drizzle ORM for type-safe database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (SPA architecture)

**UI Component System**
- Shadcn/ui components (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design 3 principles adapted for enterprise dashboards
- Design system emphasizes data density, efficiency, and rapid information processing
- Custom color scheme using HSL variables for consistent theming with dark mode support
- Inter font family for excellent readability, JetBrains Mono for codes/SKUs

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form state and validation
- Local component state with React hooks for UI-specific state

**Key Design Decisions**
- Component-based architecture with reusable UI primitives
- Centralized API client in `lib/queryClient.ts` for consistent data fetching
- Form validation using Zod schemas shared between frontend and backend
- Toast notifications for user feedback on mutations
- Responsive design with mobile-first breakpoints

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and RESTful API endpoints
- ESM modules throughout for modern JavaScript features
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful endpoints following resource-oriented patterns:
  - `/api/products` - Product CRUD operations
  - `/api/movements` - Stock movement tracking
  - `/api/stats` - Dashboard statistics
- Request validation using Zod schemas from shared schema definitions
- Consistent error handling with appropriate HTTP status codes
- Response logging middleware for debugging and monitoring

**Storage Layer**
- Abstract storage interface (`IStorage`) for flexibility
- In-memory storage implementation (`MemStorage`) for development/testing
- Designed to support Drizzle ORM with PostgreSQL in production
- UUID-based primary keys for distributed system compatibility

**Key Design Decisions**
- Separation of concerns: routes, storage, and business logic are isolated
- Shared schema definitions between frontend and backend prevent drift
- Development-friendly logging with timestamp and request details
- Vite integration in development mode for seamless HMR

### Database Architecture

**ORM & Schema**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (configured via Neon serverless adapter)
- Schema-first design with TypeScript type inference

**Data Model**

Products table:
- Core inventory items with SKU, name, description
- Current stock level and minimum stock threshold for alerts
- Unit of measurement (e.g., "un", "kg", "box")
- UUID primary key with auto-generation

Movements table:
- Tracks all inventory changes (entries and exits)
- Links to products via foreign key relationship
- Records previous and new stock levels for audit trail
- Captures responsible person and optional notes
- Movement types: "entrada" (entry) or "saida" (exit)

**Key Design Decisions**
- Immutable movement history for complete audit trail
- Stock calculations stored in movements prevent data loss
- Timestamps on all records for temporal queries
- Drizzle-zod integration generates Zod schemas from database schema

### External Dependencies

**Database Services**
- Neon Serverless PostgreSQL for production database hosting
- Connection via `@neondatabase/serverless` package
- DATABASE_URL environment variable for connection configuration

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui as the component system built on Radix
- Lucide React for consistent iconography
- Embla Carousel for carousel/slider functionality

**Form & Validation**
- React Hook Form for performant form state management
- Zod for runtime type validation and schema definition
- @hookform/resolvers for Zod integration with React Hook Form
- Drizzle-zod for automatic schema generation from database tables

**Styling & Theming**
- Tailwind CSS for utility-first styling
- Class Variance Authority (CVA) for component variant management
- Tailwind Merge (via clsx) for conditional class merging
- PostCSS with autoprefixer for CSS processing

**Date Handling**
- date-fns for date formatting and manipulation
- Portuguese Brazil (pt-BR) locale for date formatting

**Development Tools**
- TypeScript for static type checking
- ESBuild for production bundling
- TSX for TypeScript execution in development
- Drizzle Kit for database migrations

**Session Management**
- Express session infrastructure ready (connect-pg-simple for PostgreSQL session storage)
- Currently not actively used but available for authentication features

**Key Integration Points**
- Shared TypeScript types between client and server prevent API contract drift
- Vite's alias configuration enables clean imports (@/, @shared, @assets)
- Environment-based configuration for development vs production builds
- Replit-specific plugins for development banner and error overlay in Replit environment
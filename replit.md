# Real-Time Presentation Sync

## Overview

This is a real-time presentation synchronization web application that enables presenters to share slides with participants who can view them in sync. The presenter uploads slides, generates a session code, and participants join using that code. As the presenter navigates through slides, all participants' views are synchronized in real-time via WebSocket connections.

The application uses a modern TypeScript stack with React on the frontend, Express on the backend, and WebSocket for real-time communication. It's designed as a utility-focused collaboration tool inspired by video conferencing platforms like Zoom and Google Meet, with distinct presenter and participant modes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing (no React Router dependency)
- **TanStack Query (React Query)** for server state management and data fetching

**UI Components:**
- **shadcn/ui** component library based on Radix UI primitives
- **Tailwind CSS** for styling with a custom design system
- Material Design-inspired aesthetic with distinct color schemes for presenter/participant modes
- Dark mode as the primary theme with light mode support via theme provider

**Design System:**
- Custom color palette differentiating presenter (green: `142 76% 45%`) and participant (blue: `210 90% 55%`) modes
- Typography using Inter for primary text and JetBrains Mono for code
- Responsive layout with mobile-first approach

**State Management:**
- React Query for server state (sessions, slides, participants)
- WebSocket connections managed in component state
- Context API for theme management

### Backend Architecture

**Server Framework:**
- **Express.js** with TypeScript for the REST API
- **WebSocket Server** (ws library) for real-time bidirectional communication
- HTTP and WebSocket servers share the same underlying HTTP server instance

**API Design:**
- RESTful endpoints for CRUD operations on sessions, slides, and participants
- WebSocket protocol for real-time slide synchronization and participant updates
- Endpoints prefixed with `/api` for API routes
- Static file serving for production builds

**Storage Layer:**
- **Abstracted storage interface** (`IStorage`) allowing multiple implementations
- Currently using **in-memory storage** (`MemStorage`) with Map-based data structures
- Designed for easy migration to database persistence (Drizzle ORM configured for PostgreSQL)
- Schema defined with Drizzle ORM and Zod for validation

**File Upload:**
- **Multer** middleware for handling multipart/form-data
- In-memory file storage with 10MB file size limit
- Image files only (validated client-side)

### Real-Time Communication

**WebSocket Protocol:**
- Bidirectional communication over `/ws` path
- Client types: `presenter` and `participant`
- Message types include `join`, `slideChange`, and `participantUpdate`
- Session-based room management with Map of session IDs to connected clients
- Automatic synchronization of slide state to all participants when presenter navigates

**Connection Management:**
- Clients join specific session rooms upon connection
- Session state broadcast to new clients on join
- Graceful handling of disconnections
- Connection state monitoring in UI

### Data Models

**Database Schema (Drizzle ORM):**

1. **Sessions Table:**
   - `id`: UUID primary key
   - `code`: 6-character unique session code
   - `presenterId`: Identifier for the presenter
   - `currentSlide`: Integer tracking active slide index
   - `createdAt`: Timestamp

2. **Slides Table:**
   - `id`: UUID primary key
   - `sessionId`: Foreign key to sessions
   - `imageUrl`: URL/path to slide image
   - `order`: Integer for slide ordering

3. **Participants Table:**
   - `id`: UUID primary key
   - `sessionId`: Foreign key to sessions
   - `name`: Participant display name
   - `joinedAt`: Timestamp

**Validation:**
- Zod schemas generated from Drizzle schema using `drizzle-zod`
- Type-safe insert operations with TypeScript inference
- Shared schema between client and server

### Routing & Navigation

**Client-Side Routes:**
- `/` - Home page with options to create or join session
- `/create` - Slide upload and session creation
- `/join` - Session code entry and participant name input
- `/presenter/:sessionId` - Presenter control view
- `/participant/:sessionId` - Participant synchronized view
- Catch-all 404 page for undefined routes

**API Routes (Server):**
- `POST /api/sessions` - Create new session with slides
- `GET /api/sessions/:id` - Fetch session details
- `POST /api/sessions/join` - Join session as participant
- `GET /api/sessions/:id/slides` - Get slides for session
- WebSocket endpoint: `ws://host/ws`

### Development & Production

**Development Mode:**
- Vite dev server with HMR
- Replit-specific plugins for cartographer and dev banner
- Runtime error overlay for debugging
- TypeScript strict mode enabled

**Production Build:**
- Vite builds client to `dist/public`
- esbuild bundles server to `dist/index.js`
- Static file serving from build directory
- Environment-based configuration

**Code Organization:**
- Monorepo structure with `client/`, `server/`, and `shared/` directories
- Path aliases: `@/` for client code, `@shared/` for shared types
- Strict TypeScript configuration with ESNext modules

## External Dependencies

### Database & ORM
- **Drizzle ORM** (`drizzle-orm`) - Type-safe ORM for database operations
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver
- **Drizzle Kit** (`drizzle-kit`) - Database migration toolkit
- Configuration set for PostgreSQL dialect with schema in `shared/schema.ts`

### UI Component Libraries
- **Radix UI** - Extensive collection of unstyled, accessible component primitives (@radix-ui/* packages)
- **shadcn/ui** - Pre-styled component system built on Radix (configured via `components.json`)
- **Tailwind CSS** - Utility-first CSS framework with custom configuration
- **Lucide React** - Icon library
- **class-variance-authority** - Utility for managing component variants
- **clsx** & **tailwind-merge** - Class name utilities

### Form Management
- **React Hook Form** - Form state management
- **@hookform/resolvers** - Validation resolvers for Zod integration
- **Zod** - Schema validation library

### Real-Time & Network
- **ws** - WebSocket server implementation
- **TanStack Query** - Server state management and caching
- Custom API request wrapper with credential support

### File Handling
- **Multer** - Multipart form data handling for file uploads
- **@types/multer** - TypeScript types

### Session Management
- **express-session** (implied by connect-pg-simple) - Session middleware
- **connect-pg-simple** - PostgreSQL session store

### Build Tools & Development
- **Vite** - Frontend build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **esbuild** - JavaScript bundler for server builds
- **TypeScript** - Type system
- **tsx** - TypeScript execution for development
- **@replit/vite-plugin-*** - Replit-specific development plugins

### Utilities
- **nanoid** - Unique ID generation
- **date-fns** - Date manipulation library
- **cmdk** - Command menu component

### Fonts
- **Google Fonts** - Inter, DM Sans, Fira Code, Geist Mono (loaded from CDN)
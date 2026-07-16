# TodoApp Frontend

A modern React frontend for the TodoApp, built with Vite, TypeScript, and Tailwind CSS.

## Features

- Todo CRUD with priorities, categories, and tags
- Dashboard with stats and recent activity
- Drag-and-drop reordering
- Dark/light mode with persistence
- Responsive design (mobile, tablet, desktop)
- Real-time search with debounce
- Filters by status, priority, category, and date range
- Toast notifications for user feedback

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite** for fast development and building
- **Tailwind CSS v3** for utility-first styling
- **React Query** (@tanstack/react-query) for server state
- **React Router v7** for client-side routing
- **Axios** for HTTP requests
- **@dnd-kit** for drag-and-drop
- **Lucide React** for icons
- **date-fns** for date formatting
- **react-hot-toast** for notifications

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- Backend API running at `http://localhost:3000/api`

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 5173) |
| `bun run build` | TypeScript check + production build |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run linter |
| `bun run type-check` | TypeScript type checking only |

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── api/            # API client and service functions
├── components/
│   ├── ui/         # Reusable UI primitives
│   ├── layout/     # Header, Sidebar, Layout
│   ├── todos/      # Todo-specific components
│   ├── categories/ # Category components
│   └── tags/       # Tag components
├── pages/          # Route pages
├── hooks/          # React Query hooks
├── types/          # TypeScript interfaces
├── lib/            # Utility functions
└── context/        # React contexts (Theme)
```

# Task Management Tool — Frontend

React + Vite SPA integrated with the ASP.NET Core API.

## Prerequisites

- Node.js 18+
- Backend API running (default `http://localhost:5079`)

## Setup

```bash
npm install
cp .env.example .env   # or create .env with VITE_API_URL
```

## Run (development)

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Screens

| Route | Screen |
|-------|--------|
| `/register` | Sign up |
| `/login` | Sign in |
| `/dashboard` | Pending / In progress / Completed counts |
| `/tasks` | Task list with search & filters |
| `/tasks/new` | Create task |
| `/tasks/:id` | Task detail |
| `/tasks/:id/edit` | Edit task |
| `/categories` | Admin — manage categories |
| `/profile` | User profile & logout |

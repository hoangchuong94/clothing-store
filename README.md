# Clothing Store

A modern e-commerce clothing store built with Next.js, featuring internationalization, authentication forms, and responsive design.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values.

4. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests (placeholder)

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Docker

Build and run with Docker:

```bash
docker build -t clothing-store .
docker run -p 3000:3000 clothing-store
```

### Other Platforms

This is a standard Next.js app that can be deployed to Netlify, Railway, or any Node.js hosting.

## Features

- Internationalization (English/Vietnamese)
- Authentication forms
- Responsive design with Tailwind CSS
- Dark/Light mode toggle
- Framer Motion animations

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Next Intl
- Radix UI
- Zod for validation

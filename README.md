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

3. Generate Prisma client code:

   ```bash
   pnpm generate
   ```

4. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values. At minimum, set `DATABASE_URL`, `AUTH_SECRET`, and `NEXT_PUBLIC_BASE_URL`.

5. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit tests
- `pnpm generate` - Generate Prisma client code

## Database and Prisma

- Copy environment variables from `.env.example` to `.env.local`
- Run `pnpm generate` after changing the Prisma schema or on a fresh clone
- Run migrations locally with `pnpm prisma migrate dev`
- Seed roles, catalog user, categories, and **13 canonical products** (`prod-001` … `prod-013`):

  ```bash
  pnpm prisma db seed
  ```

- Verify product identity before enabling Prisma repository mode:

  ```bash
  pnpm audit:products
  pnpm smoke:products
  pnpm smoke:products:static
  ```

See [docs/product-repository-rollout.md](docs/product-repository-rollout.md) for SQL audits, manual smoke, and `PRODUCT_REPOSITORY_MODE` rollout (STATIC / PRISMA / AUTO).

## Build

- Build the application for production:

  ```bash
  pnpm build
  ```

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

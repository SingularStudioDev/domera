# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Architecture

This is a Next.js 15 real estate landing page for Domera, a property investment platform. The project uses the App Router with TypeScript and Tailwind CSS v4.

### Key Architecture Patterns

- **App Router Structure**: Uses Next.js 15 App Router with file-based routing
- **Component Architecture**: Modular components in `src/components/` with clear separation of concerns
- **Styling**: Tailwind CSS v4 with custom brand colors and responsive design
- **State Management**: React useState for local component state, no global state management
- **Images**: Static assets in `public/` folder, uses Next.js Image component for optimization

### Core Routes and Pages

- `/` - Homepage with Hero, Partners, Projects, Process sections
- `/projects` - Project listing page
- `/projects/[id]` - Dynamic project detail page with gallery, description, amenities
- `/projects/[id]/units/[unitId]` - Individual unit detail page
- `/cart` - Shopping cart page

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

### Key Technical Details

- **TypeScript Configuration**: Strict mode enabled with path aliases `@/*` for `src/*`
- **Styling Approach**: Uses Tailwind utility classes with custom brand colors (domera-blue: #2563eb, domera-navy: #1e3a8a)
- **Image Handling**: Mix of Next.js Image component and regular img tags
- **Responsive Design**: Mobile-first approach with md: and lg: breakpoints
- **Animations**: CSS transitions and hover effects, uses Framer Motion library

### Data Patterns

- Project data is currently hardcoded in component files (see project detail page)
- Unit filtering implemented with React state for floor, typology, and orientation
- Project data structure includes: title, price, location, date, images, amenities, units

### Important Notes

- The project name in package.json is "pozo" but the brand is "Domera"
- Uses Inter font from Google Fonts
- Spanish language interface (lang="es")
- Includes admin editing functionality mentioned in README but components not visible in current structure
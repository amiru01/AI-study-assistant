# Technology Stack

## Build System
- **Bundler**: Vite 5.4.19
- **Package Manager**: npm
- **Node Environment**: ES Modules (type: module)

## Frontend Stack
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Fonts**: Google Fonts (Inter, Poppins)

## Key Libraries & Frameworks
- **Backend/Database**: Supabase (@supabase/supabase-js ^2.105.3)
  - Authentication (email/password, Google OAuth)
  - PostgreSQL database with RLS
  - File storage
- **Animation**: 
  - GSAP (^3.15.0) - Advanced animations
  - Motion (^12.38.0) - UI transitions
- **Document Processing**:
  - pdfjs-dist (^3.11.174) - PDF text extraction
  - mammoth (^1.6.0) - DOCX processing

## Environment Configuration
- Environment variables via Vite (`import.meta.env`)
- `.env` file for local development (gitignored)
- `.env.example` template provided
- Configuration files:
  - `src/config/env-config.js` - API keys (gitignored)
  - `src/config/env-config.example.js` - Template
  - `src/config/supabase.js` - Supabase client initialization
  - `src/config/api.js` - API endpoints

## Common Commands

### Development
```bash
npm run dev          # Start dev server on http://localhost:5173
```

### Build & Deploy
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

### Project Setup
```bash
npm install          # Install dependencies
```

## Development Notes
- Dev server runs on port 5173
- Multi-page application with separate HTML entry points
- Path alias `@` maps to `src/` directory
- Hot module replacement (HMR) enabled in development
- Production builds are optimized and minified

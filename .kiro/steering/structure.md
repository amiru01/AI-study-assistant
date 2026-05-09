# Project Structure & Architecture

## Directory Organization

```
ai-study-assistant/
├── index.html              # Landing page (marketing site)
├── styles.css              # Global styles
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment template
│
├── pages/                  # HTML page templates
│   ├── auth.html          # Login/register page
│   ├── dashboard.html     # User dashboard
│   ├── library.html       # Notes library view
│   ├── study.html         # Study interface (quiz/flashcards)
│   └── upload.html        # File upload interface
│
├── public/                 # Alternative HTML pages (legacy/refactored)
│   ├── auth-refactored.html
│   ├── dashboard.html
│   ├── library.html
│   ├── study.html
│   └── upload.html
│
└── src/                    # Application source code
    ├── main.js            # Entry point
    │
    ├── config/            # Configuration modules
    │   ├── api.js         # API endpoint configuration
    │   ├── supabase.js    # Supabase client initialization
    │   ├── env-config.js  # API keys (gitignored)
    │   └── env-config.example.js  # Template
    │
    ├── services/          # Business logic layer
    │   ├── supabaseAuthService.js      # Authentication
    │   ├── supabaseDatabaseService.js  # Database operations
    │   ├── supabaseStorageService.js   # File storage
    │   ├── aiService.js                # AI API integration
    │   ├── freeAiService.js            # Free AI alternatives
    │   └── textExtractionService.js    # PDF/image text extraction
    │
    ├── pages/             # Page-specific logic
    │   ├── auth-page.js       # Login/register handlers
    │   ├── dashboard-page.js  # Dashboard UI logic
    │   ├── library-page.js    # Library view logic
    │   ├── study-page.js      # Study interface logic
    │   └── upload-page.js     # Upload handlers
    │
    ├── components/        # Reusable UI components
    │   ├── loader.js      # Loading spinner
    │   └── toast.js       # Toast notifications
    │
    └── utils/             # Utility functions
        ├── dom.js         # DOM manipulation helpers
        ├── formatting.js  # Date/size formatting
        ├── motion.js      # Animation utilities
        └── validation.js  # Input validation
```

## Architecture Patterns

### Separation of Concerns
- **Pages** (`src/pages/`): UI logic and event handlers only
- **Services** (`src/services/`): All business logic, API calls, data operations
- **Components** (`src/components/`): Reusable UI elements
- **Utils** (`src/utils/`): Pure helper functions

### Service Layer Pattern
All external interactions (database, storage, AI APIs) are encapsulated in service modules:
- Services export functions, not classes
- Services handle errors and return consistent data shapes
- Pages import and call service functions, never access APIs directly

### Module System
- ES6 modules throughout (`import`/`export`)
- No default exports - use named exports
- Path alias `@` resolves to `src/` directory

### Authentication Flow
1. `supabase.js` initializes Supabase client
2. `supabaseAuthService.js` handles auth operations
3. Pages call `initAuthState()` on load
4. `getCurrentUser()` provides synchronous access to cached user
5. `onAuthStateChanged()` for reactive updates

### Data Flow
```
User Action → Page Handler → Service Function → Supabase API
                ↓                    ↓
            Update UI ← Return Data ←
```

## Naming Conventions

### Files
- **Pages**: `{feature}-page.js` (e.g., `dashboard-page.js`)
- **Services**: `{provider}{Feature}Service.js` (e.g., `supabaseAuthService.js`)
- **Components**: `{component}.js` (e.g., `toast.js`)
- **Utils**: `{purpose}.js` (e.g., `formatting.js`)

### Functions
- **Async operations**: Use `async/await`, not callbacks
- **Service functions**: Verb-first naming (e.g., `getNotes()`, `uploadFile()`)
- **UI handlers**: `init{Feature}()`, `handle{Action}()`, `display{Content}()`
- **Private helpers**: No special prefix, just descriptive names

### Variables
- **camelCase** for variables and functions
- **UPPER_SNAKE_CASE** for constants
- **Descriptive names**: `userEmail` not `ue`, `notesContainer` not `nc`

## Code Style

### JavaScript
- ES6+ features (arrow functions, destructuring, template literals)
- Async/await over promises
- Optional chaining (`?.`) and nullish coalescing (`??`)
- JSDoc comments for exported functions

### Error Handling
```javascript
try {
    const result = await serviceFunction();
    showToast('Success message', 'success');
} catch (error) {
    console.error('Context:', error);
    showToast('User-friendly error', 'error');
}
```

### Import Order
1. External libraries
2. Config/services
3. Components
4. Utils

## Key Conventions

### Page Initialization
Every page module exports an `init{PageName}()` function and auto-initializes:
```javascript
export async function initDashboard() {
    await initAuthState();
    if (!isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }
    // ... page logic
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
```

### Service Functions
- Always async when doing I/O
- Return data directly, throw errors
- Include JSDoc with parameter types
- Handle both Supabase and mock modes

### UI Feedback
- Show loader for async operations: `showLoader('message')`
- Hide loader when done: `hideLoader()`
- Toast for success/error: `showToast('message', 'success|error')`

### Authentication Guards
All protected pages must:
1. Call `await initAuthState()` first
2. Check `isAuthenticated()`
3. Redirect to `auth.html` if not authenticated

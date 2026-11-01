# CELEBRATE Deployment Guide

## Environment Variables Required

The deployed application requires the following environment variables to be configured in Vercel:

### 1. GEMINI_API_KEY (Optional for AI Assistant)
- **Purpose**: Enables Google Gemini AI for intelligent event planning assistance
- **Configuration**: Add in Vercel Project Settings > Environment Variables
- **Scope**: Production, Preview, Development
- **Security**: Server-side only, never exposed to client
- **Note**: If not provided, the application uses a built-in algorithmic planning engine with contextual responses

**To configure:**
```bash
npx vercel env add GEMINI_API_KEY production --value "YOUR_GEMINI_API_KEY"
npx vercel env add GEMINI_API_KEY preview --value "YOUR_GEMINI_API_KEY"
npx vercel env add GEMINI_API_KEY development --value "YOUR_GEMINI_API_KEY"
```

### 2. SERPAPI_API_KEY (Optional for Venue/Vendor Search)
- **Purpose**: Enables real-time venue and vendor discovery via SerpAPI
- **Configuration**: Add in Vercel Project Settings > Environment Variables
- **Scope**: Production, Preview, Development
- **Security**: Server-side only, never exposed to client
- **Note**: If not provided, search functionality shows a helpful message without live results

**To configure:**
```bash
npx vercel env add SERPAPI_API_KEY production --value "YOUR_SERPAPI_API_KEY"
npx vercel env add SERPAPI_API_KEY preview --value "YOUR_SERPAPI_API_KEY"
npx vercel env add SERPAPI_API_KEY development --value "YOUR_SERPAPI_API_KEY"
```

### 3. ALLOWED_ORIGINS (Optional for CORS)
- **Purpose**: Restrict CORS to specific origins in production
- **Configuration**: Comma-separated list of allowed origins
- **Default**: `https://celebrate-pink-chi.vercel.app` in production, `*` in development

## Architecture Overview

### Frontend (React SPA)
- **Location**: `celebrate/` folder
- **Deployment**: Vercel static build
- **Data Persistence**: localStorage (client-side)
- **Features**:
  - Event CRUD (Create, Read, Update, Delete)
  - Guest management & RSVPs
  - Budget & expense tracking
  - Task management
  - Vendor directory with curated list
  - Invitation studio
  - Reports & export (CSV, JSON)
  - AI Assistant with fallback to algorithmic engine

### Backend (Vercel Serverless Functions)
- **Location**: `celebrate/api/` folder
- **Deployment**: Vercel serverless functions
- **API Endpoints**:
  - `/api/health` - Health check
  - `/api/assistant/chat` - AI assistant requests
  - `/api/discovery` - Venue/vendor search via SerpAPI

### Separate Backend (Python FastAPI)
- **Location**: `app/` folder
- **Deployment**: Render (https://celebrate-event-planner.onrender.com)
- **Status**: Preserved for reference, not used by React frontend
- **Database**: SQLite (ephemeral on Render free tier)

## Deployment URLs

- **Vercel Frontend**: https://celebrate-pink-chi.vercel.app
- **Vercel API**: https://celebrate-pink-chi.vercel.app/api/*
- **Render Backend**: https://celebrate-event-planner.onrender.com (preserved, unused)

## Security Improvements Applied

### 1. Security Headers
- Added `X-Content-Type-Options: nosniff`
- Added `X-Frame-Options: DENY`
- Added `X-XSS-Protection: 1; mode=block`
- Configured in all API endpoints and via Vercel headers

### 2. Input Validation
- Added length validation for user inputs (prompt max 5000 chars, query max 500 chars)
- Added type validation for all API inputs
- Prevents injection attacks

### 3. CORS Configuration
- Restricted CORS in production by default
- Environment-based origin validation
- Proper CORS headers in all endpoints

### 4. API Key Security
- All API keys stored in Vercel environment variables
- Never exposed to client-side code
- Graceful fallback when keys are missing

### 5. Error Handling
- Removed stack traces from error responses
- Generic error messages to prevent information leakage
- External API failures handled gracefully

## Accessibility Improvements Applied

### 1. Semantic HTML
- Added proper heading hierarchy
- Used semantic elements (`header`, `main`, `nav`, `footer`)
- Added `role` attributes where appropriate

### 2. ARIA Attributes
- Added `aria-label` for all interactive elements
- Added `aria-expanded` for dropdowns
- Added `aria-selected` for listbox options
- Added `aria-current` for navigation
- Added `aria-live` for dynamic content

### 3. Keyboard Navigation
- Added visible focus indicators via CSS
- Added `:focus-visible` styles
- All interactive elements keyboard accessible
- Skip to main content link added

### 4. Screen Reader Support
- Added `sr-only` helper class
- Hidden decorative elements with `aria-hidden`
- Proper form labels and descriptions
- Status messages with `role="alert"` and `aria-live`

### 5. Reduced Motion Support
- Added `@media (prefers-reduced-motion)` query
- Respects user's motion preferences

### 6. High Contrast Support
- Added `@media (prefers-contrast: high)` query
- Improved visibility for high-contrast mode

## AI Assistant Integration

### 1. Endpoint Correction
- Fixed API endpoint from `/api/assistant` to `/api/assistant/chat`
- Updated both server.ts and Vercel serverless function

### 2. Model Selection
- Using `gemini-1.5-flash` for fast responses
- 10-second timeout with graceful fallback
- Built-in algorithmic engine provides contextual responses when API unavailable

### 3. Event Context
- AI assistant receives real event data from localStorage
- Includes: budget, guests, expenses, tasks, date, location
- Responses are genuinely contextual to the selected event

### 4. Error Handling
- Shows honest connection errors when API fails
- Never returns fabricated responses
- Clear error messages with recovery suggestions

## SerpAPI Integration

### 1. Graceful Degradation
- Shows helpful message when API key is missing
- Returns empty results with notice when API fails
- Never shows fabricated search results

### 2. Input Validation
- Limits query length to 500 characters
- Validates input types
- Prevents injection attacks

### 3. Result Display
- Shows real search results when available
- External links open in new tabs with `rel="noopener noreferrer"`
- Clear attribution to source

## Data Architecture

### 1. localStorage Persistence
- All event data stored in browser localStorage
- Data persists across page refreshes
- No server-side persistence required
- Valid architecture for client-side SPA

### 2. Data Seeding
- Includes starter event for immediate usability
- Users can reset to demo or clear all data
- Export/import functionality for backup

### 3. Real Calculations
- All statistics derived from actual event records
- Budget calculations from real expenses
- Guest counts from actual RSVPs
- Task progress from real completion status

## Code Quality Improvements

### 1. Removed Unused Code
- Removed unused `api.ts` file (backend client not used)
- Removed backup files (.b64, .backup)
- Cleaned up gitignore

### 2. Fixed Build Warnings
- Updated vite.config.ts to use `import.meta.dirname`
- Fixed ESM compatibility

### 3. Environment Configuration
- Added `.env.example` with documentation
- Proper gitignore for environment files
- Clear separation of local and production configs

## Testing Checklist

### Security Tests
- [x] API keys not exposed in client code
- [x] Input validation on all endpoints
- [x] Security headers configured
- [x] CORS properly restricted
- [x] Error messages don't leak information

### Accessibility Tests
- [x] Skip to main content link works
- [x] All buttons have focus indicators
- [x] All forms have proper labels
- [x] Navigation is keyboard accessible
- [x] ARIA attributes properly used
- [x] Screen reader announcements work
- [x] Reduced motion respected

### AI Assistant Tests
- [x] Health check endpoint responds
- [x] Algorithmic fallback works without API key
- [x] Event context properly passed
- [x] Quick action buttons work
- [x] Error handling for missing API key
- [x] Timeout handling works

### SerpAPI Tests
- [x] Search works without API key (graceful message)
- [x] Input validation prevents long queries
- [x] External links open safely
- [x] Error handling for API failures

### Application Tests
- [x] Create an event
- [x] Edit an event
- [x] Delete an event
- [x] Add a guest
- [x] Update RSVP
- [x] Add an expense
- [x] Update budget
- [x] Create and complete a task
- [x] Generate invitation
- [x] Export reports
- [x] Refresh pages and verify persistence
- [x] Build completes successfully

## Next Steps

1. **Configure Environment Variables** (Optional):
   - Add GEMINI_API_KEY in Vercel for live AI
   - Add SERPAPI_API_KEY in Vercel for live search
   - Add ALLOWED_ORIGINS to restrict CORS in production

2. **Test Live Application**:
   - Visit https://celebrate-pink-chi.vercel.app
   - Test all features with and without API keys
   - Verify accessibility with keyboard navigation
   - Test with screen reader if available

3. **Optional Future Enhancements**:
   - Integrate Python FastAPI backend for server-side persistence
   - Add user authentication for multi-tenant support
   - Connect to PostgreSQL for persistent storage
   - Add email integration for invitations

## Security Notes

- API keys are server-side only via Vercel environment variables
- No credentials are committed to source code
- CORS restricted to specific origins in production
- User input validated and sanitized
- External API failures handled gracefully
- Security headers configured on all endpoints
- No stack traces or sensitive information in error responses

## Repository Size

- Total tracked files: ~295 KB
- Well below 10 MB limit
- No large assets committed
- node_modules excluded via gitignore

# Website Builder — Client

Angular 21 frontend with a visual drag-and-drop site editor.

## Tech Stack

- **Angular 21** with standalone components
- **Angular Signals** for state management (no NgRx)
- **Quill** for rich text editing
- **pdfjs-dist** for PDF preview
- **jwt-decode** for reading JWT claims

## Project Structure

```
src/app/
├── pages/
│   ├── home/              # Landing page
│   ├── login/             # Login form
│   ├── register/          # Registration form
│   ├── dashboard/         # User's sites list
│   ├── create-site/       # New site form
│   ├── editor/            # Visual editor (main feature)
│   │   ├── canvas/        # Drag-and-drop canvas
│   │   ├── sidebar/       # Element picker, layers, design
│   │   ├── topbar/        # Save, publish, share, AI
│   │   ├── format-bar/    # Text formatting toolbar
│   │   └── multi-select/  # Multi-element selection
│   ├── site-viewer/       # Public site renderer
│   └── booking/           # Booking management
│
├── models/
│   ├── canvas.models.ts   # CanvasElement, Section, Page, Site, all DTOs
│   ├── auth.models.ts     # RegisterDto, LoginDto, AuthResponseDto
│   └── booking.models.ts  # Booking types
│
├── services/
│   ├── auth.ts            # Login, register, logout, JWT decode
│   ├── site.ts            # Site + page CRUD with in-memory cache
│   ├── editor-state.service.ts  # All editor state (signals)
│   ├── media.ts           # Image and video upload
│   └── element-defaults.ts      # Default sizes and content per element type
│
├── auth.guard.ts          # Blocks unauthenticated access
└── logged-in.guard.ts     # Redirects logged-in users away from login/register
```

## Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/home` | HomeComponent | Public |
| `/login` | LoginComponent | Redirect if logged in |
| `/register` | RegisterComponent | Redirect if logged in |
| `/site/:subdomain` | SiteViewerComponent | Public |
| `/site/:subdomain/:pageSlug` | SiteViewerComponent | Public |
| `/dashboard` | DashboardComponent | Required |
| `/create-site` | CreateSiteComponent | Required |
| `/editor/:id` | EditorComponent | Required |
| `/bookings/:siteId` | BookingsComponent | Required |

## Canvas Elements

### 21 Element Types

| Category | Elements |
|----------|----------|
| Basic | text, image, button, hero |
| Structure | navbar, divider, spacer |
| Media | gallery, video, pdf, pdf-download |
| Shop | product, cart, pricing |
| Communication | contact, testimonial, social, about, booking |
| Extra | map, countdown |

### 18 Shape Types

`rect`, `rect-rounded`, `circle`, `ellipse`, `triangle`, `triangle-down`, `star`, `star6`, `heart`, `arrow-right`, `arrow-left`, `diamond`, `pentagon`, `hexagon`, `cross`, `line-h`, `line-v`, `badge`

## Editor Features

### Canvas Interactions
- **Drag from sidebar** to add elements
- **Drag to move** elements around the canvas
- **Resize** from 4 corner handles
- **Double-click** to enter text edit mode
- **Right-click** for context menu
- **Multi-select** with drag area

### Layer Management
- Bring to front / bring forward / send backward / send to back
- Layer list in sidebar with drag-to-reorder

### History
- Undo up to 40 states
- Auto-saves history before each change

### Auto-save
- Saves automatically when switching pages
- Saves before navigating away from the editor

### Coordinate System
- Elements are stored as **percentages** of canvas width for responsiveness
- Converted to pixels in the UI (canvas default width: 1100px)

## State Management (EditorStateService)

All editor state is managed with Angular Signals:

| Signal | Type | Description |
|--------|------|-------------|
| `siteId` | `number` | Current site being edited |
| `site` | `any` | Site metadata |
| `pages` | `any[]` | All pages in the site |
| `selectedPage` | `any` | Active page |
| `elements` | `CanvasElement[]` | All elements on the canvas |
| `selectedEl` | `CanvasElement \| null` | Currently selected element |
| `isSaving` | `boolean` | Save in progress |
| `saveSuccess` | `boolean \| null` | Result of last save |
| `cartItems` | `array` | Shopping cart contents |

`sortedElements` is a computed signal that returns elements sorted by `zIndex`.

## Authentication

- JWT token stored in `localStorage` under the key `token`
- Token decoded with `jwt-decode` to read `FullName` claim
- `AuthInterceptor` attaches the token to every outgoing HTTP request

## API Base URL

Configured in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7113'
};
```

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Angular CLI: `npm install -g @angular/cli`

### Run

```bash
cd "Website building client/Website-building"
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

Make sure the server is running first (see [server README](../../Website%20building%20server/README.md)).

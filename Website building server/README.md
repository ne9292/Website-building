# Website Builder — Server

ASP.NET Core (.NET 8) REST API with SQL Server and JWT authentication.

## Project Structure

```
Website building/
├── Website building.Api/          # Entry point, controllers, configuration
│   ├── Controllers/
│   │   ├── AuthController.cs      # Register, login
│   │   ├── SitesController.cs     # Site CRUD + publish
│   │   └── PagesController.cs     # Page CRUD + section save
│   ├── Program.cs
│   └── appsettings.json
│
├── Website building.Core/         # Domain layer (no dependencies)
│   ├── Entities/                  # ApplicationUser, Site, Page, Section, Media
│   ├── Interfaces/                # IAuthService, ISiteService, IPageService, IApplicationDbContext
│   └── Resources/                 # DTOs (AuthDtos, SiteDto, PageDto)
│
├── Website_building.Data/         # Infrastructure layer
│   ├── Persistence/
│   │   └── ApplicationDbContext.cs
│   ├── Migrations/
│   └── DependencyInjection.cs     # Registers EF Core + DbContext
│
└── Website_building.Service/      # Business logic
    ├── AuthService.cs
    ├── SiteService.cs
    ├── PageService.cs
    └── ServiceExtensions.cs       # Registers services
```

## API Endpoints

### Auth — no authentication required

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | `{ fullName, email, password }` | Register a new user |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT token |

### Sites — JWT required (except public)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/sites` | Get all sites belonging to the logged-in user |
| GET | `/api/sites/{id}` | Get a single site (owner only) |
| GET | `/api/sites/public/{subdomain}` | Get a published site by subdomain (public) |
| POST | `/api/sites` | Create a site |
| PUT | `/api/sites/{id}` | Update site name, color, font, or logo |
| DELETE | `/api/sites/{id}` | Delete a site |
| POST | `/api/sites/{id}/publish` | Set publish status `{ isPublished: bool }` |

### Pages — JWT required

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/sites/{siteId}/pages` | Get all pages in a site |
| POST | `/api/sites/{siteId}/pages` | Create a page `{ title, slug, isHome }` |
| PUT | `/api/sites/{siteId}/pages/{pageId}` | Update page + save all sections |
| DELETE | `/api/sites/{siteId}/pages/{pageId}` | Delete a page |

**Limit:** A site can have at most 6 pages.

## Data Model

```
ApplicationUser (ASP.NET Identity)
  └── has many Sites

Site
  ├── SiteName, Subdomain (unique), PrimaryColor, FontFamily, LogoUrl
  ├── IsPublished (default: false)
  └── has many Pages

Page
  ├── Title, Slug, IsHome
  └── has many Sections

Section
  ├── Type (string, e.g. "hero", "gallery")
  ├── ContentJson (element positions and data as JSON)
  ├── StylesJson  (styles as JSON)
  └── OrderIndex

Media
  ├── UserId, FileName, FileUrl, FileType
  └── UploadedAt
```

## Authentication Details

- Provider: ASP.NET Identity + JWT Bearer
- Token expiry: 24 hours
- Claims included: `sub` (email), `jti` (unique ID), `NameIdentifier` (userId), `FullName`
- CORS is configured to allow requests from `http://localhost:4200`

## Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (local or remote)

### Configuration

Create `appsettings.Development.json` in the `Website building.Api` folder (this file is gitignored):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=WebsiteBuilder;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "your-secret-key-must-be-at-least-32-characters-long",
    "Issuer": "WebsiteBuilding",
    "Audience": "WebsiteBuildingClient"
  }
}
```

### Run

```bash
cd "Website building server/Website building"

# Apply migrations
dotnet ef database update --project Website_building.Data --startup-project "Website building.Api"

# Start the server
dotnet run --project "Website building.Api"
```

The API will be available at `https://localhost:7259` with Swagger UI at `/swagger`.

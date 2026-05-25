# Website Builder

A full-stack website builder application that lets users create, edit, and publish websites through a drag-and-drop canvas editor.

## Features

- **Authentication** — Register and login with JWT-based authentication
- **Site management** — Create, edit, and delete multiple websites per user
- **Drag-and-drop editor** — Place and resize elements (text, images, buttons, shapes) on a canvas
- **Multi-page support** — Add multiple pages to each site with custom slugs
- **Publish & share** — Publish sites with a public URL accessible to anyone
- **AI generator** — Generate content with AI assistance
- **Booking system** — Built-in booking component for service-based sites

## Tech Stack

**Frontend**
- Angular 19
- TypeScript

**Backend**
- ASP.NET Core 9
- Entity Framework Core
- ASP.NET Identity
- JWT Authentication
- SQL Server

## Project Structure

```
├── Website building client/
│   └── Website-building/        # Angular application
│       └── src/app/
│           ├── components/      # Editor, canvas, sidebar, toolbar
│           ├── models/          # TypeScript interfaces
│           └── services/        # API services
│
└── Website building server/
    └── Website building/
        ├── Website building.Api/        # Controllers, configuration
        ├── Website building.Core/       # Entities, interfaces, DTOs
        ├── Website_building.Data/       # DbContext, migrations
        └── Website_building.Service/   # Business logic
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- SQL Server

### Backend Setup

1. Navigate to the API project:
   ```bash
   cd "Website building server/Website building"
   ```

2. Create `appsettings.Development.json` with your configuration:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "your-connection-string"
     },
     "Jwt": {
       "Key": "your-secret-key-min-32-characters",
       "Issuer": "WebsiteBuilding",
       "Audience": "WebsiteBuildingClient"
     }
   }
   ```

3. Apply migrations and run:
   ```bash
   dotnet ef database update
   dotnet run --project "Website building.Api"
   ```

   The API will be available at `https://localhost:7259`.

### Frontend Setup

1. Navigate to the Angular project:
   ```bash
   cd "Website building client/Website-building"
   ```

2. Install dependencies and run:
   ```bash
   npm install
   ng serve
   ```

   The app will be available at `http://localhost:4200`.

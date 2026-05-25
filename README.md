# Website Builder

A full-stack website builder that lets users create, design, and publish websites through a visual drag-and-drop editor.

## Architecture

```
├── Website building client/   # Angular 21 frontend
└── Website building server/   # ASP.NET Core (.NET 8) backend
```

The client communicates with the server via a REST API secured with JWT authentication. Sites are stored in SQL Server and served publicly by subdomain.

## How It Works

1. A user registers and logs in — receives a JWT token
2. They create a site (name + subdomain)
3. They open the visual editor and build pages by dragging elements onto a canvas
4. Each page is made of sections, and each section stores its layout as JSON
5. When ready, they publish the site — it becomes publicly accessible at `/site/{subdomain}`

## Key Features

- Visual drag-and-drop canvas editor with 21 element types and 18 geometric shapes
- Multi-page sites (up to 6 pages per site)
- Publish / draft toggle with public URL
- Shopping cart, booking forms, contact forms, galleries, maps, countdowns, and more
- Undo/redo history (40 states)
- JWT authentication

## Setup

See the README in each subfolder:

- [Server setup](Website%20building%20server/README.md)
- [Client setup](Website%20building%20client/Website-building/README.md)

# Item Selector

An Angular 20 application for item selection with folder/file tree structure.

## Prerequisites

- **Node.js**: v22.14.0 or higher
- **npm**: Latest version (comes with Node.js)
- **Angular CLI**: v20.1.4 or higher (optional, for direct ng commands)

## Quick Start

1. **Clone and navigate to the project:**

   ```bash
   cd item-selector
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4200/`

## Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm start`     | Start development server |
| `npm run build` | Build for production     |
| `npm test`      | Run unit tests           |
| `npm run watch` | Build in watch mode      |

## Angular CLI Options

If you have Angular CLI installed globally (`npm install -g @angular/cli`), you can use these commands directly:

| Command | Description |
|---------|-------------|
| `ng serve` | Start development server |
| `ng build` | Build for production |
| `ng test` | Run unit tests |
| `ng generate component <name>` | Generate new component |
| `ng generate service <name>` | Generate new service |
| `ng lint` | Run linting |
| `ng serve --open` | Start server and open browser |
| `ng build --watch` | Build in watch mode |

## Technology Stack

- **Angular**: 20.1.0
- **TypeScript**: 5.8.2
- **Tailwind CSS**: 4.1.11
- **RxJS**: 7.8.0

## Project Structure

```
src/
├── app/
│   ├── core/           # Core services and utilities
│   ├── features/       # Feature modules
│   ├── shared/         # Shared components and models
│   └── app.ts
├── styles.css          # Global styles
└── main.ts            # Application bootstrap
```

## Build

Run `npm run build` to build the project. Build artifacts are stored in the `dist/` directory.

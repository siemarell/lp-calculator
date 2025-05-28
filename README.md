# Options Payoff Calculator

A React application for calculating and visualizing options payoff strategies.

## Technologies Used

- React
- TypeScript (latest version)
- Vite (as bundler)
- Tailwind CSS for styling
- ESLint for code linting
- Prettier for code formatting
- TypeScript checker plugin for real-time type checking

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd options-payoff
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

### Development

To start the development server:

```
npm run dev
# or
yarn dev
```

This will start the Vite development server and open the application in your default browser. The app will automatically reload if you change any of the source files.

### Building for Production

To build the application for production:

```
npm run build
# or
yarn build
```

This will create a `dist` directory with the compiled assets.

### Preview Production Build

To preview the production build locally:

```
npm run preview
# or
yarn preview
```

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling. Tailwind is a utility-first CSS framework that allows for rapid UI development.

### Key files:

- `tailwind.config.js` - Configuration for Tailwind CSS
- `postcss.config.js` - PostCSS configuration for processing Tailwind
- `src/index.css` - Contains Tailwind directives and global styles
- `src/components/Button.css` - Contains additional button variants using Tailwind

### Usage:

You can use Tailwind's utility classes directly in your JSX:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-800">Example</h2>
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```

Or use the `@apply` directive in your CSS files to create reusable components:

```css
.card {
  @apply p-6 bg-white rounded-lg shadow-md;
}
```

## Code Quality Tools

This project uses several tools to ensure code quality and consistency:

### ESLint

ESLint is configured for TypeScript and React to catch common errors and enforce best practices.

```bash
# Run ESLint to check for issues
npm run lint

# Run ESLint with automatic fixing
npm run lint:fix
```

### Prettier

Prettier is used for consistent code formatting across the project.

```bash
# Format all files
npm run format
```

### TypeScript Checker

The TypeScript checker plugin provides real-time type checking during development.

```bash
# Run type checking manually
npm run type-check
```

TypeScript errors will also be displayed in the terminal and browser console during development.

### Configuration Files

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `vite.config.ts` - Includes TypeScript checker plugin configuration

## Archive Folder

The `_archive` folder contains the original Python implementation of the options payoff calculator. These files are kept for reference purposes but are not used in the current React implementation.

Files in the archive:
- `main.py` - Original Python entry point
- `src/options.py` - Options classes and calculations
- `src/strategy.py` - Strategy implementation
- `src/ticks_between.py` - Helper functions
- `src/uniswap_v3.py` - Uniswap V3 related calculations
- `pyproject.toml` - Python project configuration
- `.python-version` - Python version specification

## Project Structure

```
/
├── _archive/          # Archived Python files (for reference)
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable React components
│   ├── App.tsx        # Main application component
│   ├── App.css        # Styles for App component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles with Tailwind directives
├── .eslintrc.cjs      # ESLint configuration
├── .prettierrc        # Prettier configuration
├── index.html         # HTML template
├── package.json       # Project dependencies and scripts
├── postcss.config.js  # PostCSS configuration for Tailwind
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
├── tsconfig.node.json # TypeScript configuration for Node.js
├── vite.config.ts     # Vite configuration with TypeScript checker
└── README.md          # Project documentation
```

## License

[MIT](LICENSE)

# Options Payoff Calculator

A React application for calculating and visualizing options payoff strategies.

## Technologies Used

- React
- TypeScript
- Vite (as bundler)
- CSS for styling

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

## Project Structure

```
/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable React components
│   ├── App.tsx        # Main application component
│   ├── App.css        # Styles for App component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── README.md          # Project documentation
```

## License

[MIT](LICENSE)

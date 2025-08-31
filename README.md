# Interactive Algorithm Education Platform

A modern web application that teaches data structures, algorithms, and Big-O notation through interactive visualizations and hands-on coding. Built with Next.js 14, TypeScript, and Framer Motion.

## 🚀 Features

- **Dual-Pane Learning Interface**: Code editor synchronized with real-time visualizations
- **Progressive Learning Modes**: Beginner, Curious About Code, and Show Me Details
- **Interactive Algorithm Visualizations**: Step-by-step algorithm execution with animations
- **Multi-Language Support**: JavaScript and Python code execution in the browser
- **Real-Time Big-O Analysis**: Live complexity analysis and performance metrics
- **Mobile-Responsive Design**: Optimized for all devices with 30+ FPS animations
- **Accessibility First**: Screen reader support, keyboard navigation, and reduced motion options

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for educational visualizations
- **Code Editor**: Monaco Editor (VS Code in the browser)
- **Python Execution**: Pyodide for browser-based Python
- **State Management**: Zustand for predictable state updates
- **Testing**: Jest with React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── editor/            # Code editor components
│   ├── visualization/     # Animation components
│   ├── controls/          # Interactive controls
│   └── modes/             # Learning mode components
├── lib/                   # Core logic and utilities
│   ├── algorithms/        # Algorithm implementations
│   ├── state/             # Zustand stores
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript definitions
│   └── constants/         # App constants
├── hooks/                 # Custom React hooks
└── __tests__/             # Test files
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd algorithm-education-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🎨 Design System

The platform uses a custom design system built on Tailwind CSS:

- **Colors**: Educational-focused color palette with accessibility compliance
- **Typography**: Clear hierarchy optimized for learning content
- **Components**: Reusable UI components with consistent styling
- **Animations**: Performance-optimized animations with reduced motion support

## 📱 Performance

- **Target**: 30+ FPS on mid-tier mobile devices
- **Bundle Size**: Optimized with dynamic imports and tree-shaking
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Modern browsers with WebAssembly support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Monaco Editor team for the excellent code editor
- Framer Motion for smooth animations
- Pyodide team for Python in the browser
- Next.js team for the amazing framework
# EduOrbit

**Orbital Knowledge System // V1.0**

EduOrbit is a production-grade React/TypeScript application that visualizes study topics as 3D satellites. It features a deterministic study path computer, interactive dependency graph editor, and a launch-style progress timeline.

## Features

- **3D Visualization**: Real-time orbital mechanics using Three.js.
- **Syllabus Parser**: Convert text-based syllabi into 3D graphs.
- **Pathfinding**: A* algorithm to compute optimal study paths.
- **Interactive Editor**: Drag-and-drop (click-to-link) dependency management.
- **Telemetry**: Detailed topic analysis and status tracking.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Tech Stack

- **Core**: React 19, TypeScript, Vite
- **3D**: @react-three/fiber, @react-three/drei, Three.js
- **State**: Zustand
- **Styling**: TailwindCSS 4, Framer Motion, Lucide React

## License

MIT

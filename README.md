# EduOrbit 🚀

**Orbital Knowledge System // V2.0**

<div align="center">

![EduOrbit Banner](https://img.shields.io/badge/EduOrbit-V2.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js)

*Transform your learning journey into an interactive 3D orbital experience*

</div>

---

## 🌟 Overview

EduOrbit is a revolutionary learning management system that visualizes your study topics as an interactive 3D solar system. Each topic orbits based on its dependencies, creating an intuitive and beautiful representation of your learning path. Track your progress, manage study sessions, and navigate complex learning hierarchies with ease.

## ✨ Features

### 📊 Study Statistics Dashboard
- **Real-time Progress Tracking**: Visual progress bar with completion percentage
- **Total Study Time**: Accumulated minutes across all topics
- **Study Streak**: Consecutive days with completed topics
- **Topic Analytics**: Complete overview of your learning journey

### 🎯 Smart Recommendations
- **Intelligent Suggestions**: Automatically recommends topics ready to study
- **Prerequisite Tracking**: Only shows topics where all dependencies are completed
- **Priority Ordering**: Topics sorted by depth and estimated time
- **One-Click Navigation**: Jump directly to recommended topics

### ⏱️ Study Session Timer
- **Pomodoro-Style Timer**: Focus on one topic at a time
- **Automatic Time Tracking**: Sessions auto-save to your topic progress
- **Header Display**: Timer visible while studying
- **Session History**: View total time spent on each topic

### 🗺️ 3D Visualization
- **Interactive Orbital Graph**: Topics orbit a central planet based on dependencies
- **Real-time Physics**: Smooth animations powered by Three.js
- **Beautiful Aesthetics**: Glassmorphism UI with bloom effects
- **Intuitive Navigation**: Drag to rotate, scroll to zoom

### 📝 Learning Tools
- **Study Notes**: Add and save notes for each topic
- **Resource Management**: Attach links to helpful learning materials
- **Dependency Linking**: Visually connect topics with prerequisites
- **Path Computation**: Find optimal learning paths using A* algorithm

### 💾 Data Portability
- **Export**: Download complete study data as JSON
- **Import**: Restore previous sessions or share with others
- **Local Storage**: Automatic saving to prevent data loss
- **Version Control**: Timestamped exports for backup

## 🎬 Demo Videos

Quick demonstrations of EduOrbit's key features:

- **[Complete Feature Demo](./demos/EduOrbit_Complete_Feature_Demo.webp)** - Full walkthrough (3-4 min)
- **[Quick Demo](./demos/EduOrbit_Quick_Demo.webp)** - Essential features (~30 sec)

*View the WebP files in your browser or media player*

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhi3114-glitch/EduOrbit.git
   cd EduOrbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## 📖 How to Use

### 1️⃣ Create Your Syllabus

Use the built-in templates or write your own:

```
React Basics
Components: React Basics
Props: Components
State: Components
Hooks: State
```

**Format**: `Topic Name: Dependency1, Dependency2`

### 2️⃣ Initialize Orbits

Click **"INITIALIZE ORBITS"** to generate your 3D learning galaxy. Topics will automatically position based on their dependency depth.

### 3️⃣ Interact with Topics

- **Click a node** to view details
- **Start study sessions** to track your time
- **Mark complete** when you finish a topic
- **Add notes** and resources for future reference

### 4️⃣ Track Your Progress

- Open **STATS** to view your learning analytics
- Check **NEXT** for recommended topics
- Use **COMPUTE PATH** to find optimal learning routes
- **EXPORT** your data for backup

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Core** | React 19, TypeScript, Vite |
| **3D Graphics** | Three.js, @react-three/fiber, @react-three/drei |
| **State Management** | Zustand |
| **Styling** | TailwindCSS 4, Framer Motion |
| **Icons** | Lucide React |
| **Effects** | @react-three/postprocessing |

## 📁 Project Structure

```
EduOrbit/
├── src/
│   ├── components/      # React components
│   │   ├── OrbitEngine.tsx    # 3D visualization
│   │   └── UIOverlay.tsx      # UI controls & panels
│   ├── lib/            # Core logic
│   │   ├── GraphLogic.ts      # Orbit calculations
│   │   └── SyllabusParser.ts  # Text parsing
│   ├── store/          # State management
│   │   └── store.ts
│   ├── types/          # TypeScript definitions
│   └── main.tsx        # App entry point
├── demos/              # Demo videos
├── public/             # Static assets
└── package.json
```

## 🎨 Key Features Explained

### Orbit Mechanics
Topics are positioned in orbits based on their **depth** (number of prerequisite layers). The deeper a topic, the farther it orbits from the center planet.

### Pathfinding Algorithm
Uses **A\* search** to find the optimal learning path between any two topics, considering all dependencies.

### Auto-Save System
All progress, notes, and resources are automatically saved to **localStorage** and can be exported as JSON for backup.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🙏 Acknowledgments

- Three.js community for amazing 3D capabilities
- React Three Fiber for seamless React integration
- All contributors and users of EduOrbit

---

<div align="center">

**Built with ❤️ for learners everywhere**

⭐ Star this repo if you find it helpful!

</div>

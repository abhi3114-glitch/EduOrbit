import { OrbitEngine } from './components/OrbitEngine';
import { UIOverlay } from './components/UIOverlay';

function App() {
  return (
    <div className="w-screen h-screen text-orbit-text overflow-hidden">
      <OrbitEngine />
      <UIOverlay />
    </div>
  );
}

export default App;

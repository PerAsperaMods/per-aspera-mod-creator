import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Resources } from './pages/Resources';
import { Placeholder } from './pages/Placeholder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900 text-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/buildings" element={<Placeholder title="Buildings" icon="🏭" />} />
              <Route path="/technologies" element={<Placeholder title="Technologies" icon="🔬" />} />
              <Route path="/categories" element={<Placeholder title="Categories" icon="📂" />} />
              <Route path="/knowledge" element={<Placeholder title="Knowledge" icon="📚" />} />
              <Route path="/mods" element={<Placeholder title="Mods" icon="🎮" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

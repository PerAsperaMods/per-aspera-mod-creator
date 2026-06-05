import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>🚀 Per Aspera Mod Creator</h1>
          <ul>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/buildings">Buildings</Link></li>
            <li><Link to="/technologies">Technologies</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/knowledge">Knowledge</Link></li>
            <li><Link to="/mods">Mods</Link></li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Placeholder title="Resources" />} />
            <Route path="/buildings" element={<Placeholder title="Buildings" />} />
            <Route path="/technologies" element={<Placeholder title="Technologies" />} />
            <Route path="/categories" element={<Placeholder title="Categories" />} />
            <Route path="/knowledge" element={<Placeholder title="Knowledge" />} />
            <Route path="/mods" element={<Placeholder title="Mods" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="page">
      <h2>Welcome to Per Aspera Mod Creator</h2>
      <p>Create mods visually without writing YAML</p>
      <div className="features">
        <div className="feature">📦 Resources</div>
        <div className="feature">🏭 Buildings</div>
        <div className="feature">🔬 Technologies</div>
        <div className="feature">📂 Categories</div>
        <div className="feature">📚 Knowledge</div>
        <div className="feature">🎮 Mods</div>
      </div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="page">
      <h2>{title}</h2>
      <p>Coming soon...</p>
    </div>
  );
}

export default App;

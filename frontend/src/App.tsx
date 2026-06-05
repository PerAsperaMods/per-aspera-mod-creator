import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Resources } from './pages/Resources';
import { Buildings } from './pages/Buildings';
import { Technologies } from './pages/Technologies';
import { Categories } from './pages/Categories';
import { Knowledge } from './pages/Knowledge';
import { Mods } from './pages/Mods';
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
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/technologies" element={<Technologies />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/mods" element={<Mods />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

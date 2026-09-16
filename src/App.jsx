import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Workout from './pages/Workout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout" element={<Workout />} />
    </Routes>
  );
}

export default App;
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Support from "./pages/Support";
import CookieConsent from "./components/CookieConsent";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/support" element={<Support />} />
      </Routes>

      {/* Cookie / Privacy Consent */}
      <CookieConsent />
    </>
  );
}

export default App;
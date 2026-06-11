import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PillNav from './components/PillNav/PillNav.jsx';
import Login from './screens/Login.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Settings from './screens/Settings.jsx';
import MyCountry from './screens/MyCountry.jsx';
import Predictions from './screens/Predictions.jsx';
import Highlights from './screens/Highlights.jsx';
import Admin from './screens/Admin.jsx';
import { DEFAULT_PALETTE } from './config/teamPalettes.js';
import { useAuth } from './state/AuthProvider.jsx';
import { getSettings } from './utils/storage.js';

function ProtectedShell() {
  const { profile, isOnboarded } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const palette = profile?.palette ?? DEFAULT_PALETTE;
    const settings = getSettings();
    document.documentElement.style.setProperty('--color-primary', palette.primary);
    document.documentElement.style.setProperty('--color-secondary', palette.secondary);
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
    document.documentElement.style.setProperty('--font-ui', settings.font ?? "'Space Grotesk', system-ui, sans-serif");
  }, [profile]);

  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      {isOnboarded && <PillNav />}
      <main className="app-shell">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-country" element={<MyCountry />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const { loading, isLoggedIn } = useAuth();

  if (loading) {
    return <div className="center-stage">Loading the tournament tunnel…</div>;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return <ProtectedShell />;
}

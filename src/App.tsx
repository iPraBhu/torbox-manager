import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import SearchPage from './pages/SearchPage';
import TorrentSearchPage from './pages/TorrentSearchPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { initialize: initSettings } = useSettingsStore();

  useEffect(() => {
    initAuth();
    initSettings();
  }, [initAuth, initSettings]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {isAuthenticated ? (
        <Route element={<Layout />}>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/torrent-search" element={<TorrentSearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/library" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;

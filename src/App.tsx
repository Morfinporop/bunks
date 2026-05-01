/**
 * Bunker Online - Main App
 * React Router SPA with game screens
 */
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './GameContext';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/Footer';
import ConnectionBanner from './components/ConnectionBanner';

function AppRoutes() {
  const { room, sessionRoomCode, sessionPlayerId, reconnectRoom } = useGame();
  const [reconnecting, setReconnecting] = useState(false);

  // Try to reconnect to session on page reload
  useEffect(() => {
    if (!room && sessionRoomCode && sessionPlayerId) {
      setReconnecting(true);
      reconnectRoom(sessionRoomCode, sessionPlayerId).finally(() => {
        setReconnecting(false);
      });
    }
  }, []);

  if (reconnecting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-400 text-lg font-mono">Переподключение...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/lobby" element={room ? <LobbyPage /> : <Navigate to="/" />} />
      <Route path="/game" element={room ? <GamePage /> : <Navigate to="/" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white flex flex-col">
          <ConnectionBanner />
          <div className="flex-1">
            <AppRoutes />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

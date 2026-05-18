import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';

import LoginPage        from './pages/auth/LoginPage';
import RegisterPage     from './pages/auth/RegisterPage';
import HomePage         from './pages/home/HomePage';
import ProfilePage      from './pages/profile/ProfilePage';
import GameSetupPage    from './pages/game/GameSetupPage';
import GameBoardPage    from './pages/game/GameBoardPage';
import GameHistoryPage  from './pages/game/GameHistoryPage';
import GameReplayPage   from './pages/game/GameReplayPage';
import AdminPlayersPage  from './pages/admin/AdminPlayersPage';
import AdminGamesPage    from './pages/admin/AdminGamesPage';
import OnlineArenaPage   from './pages/game/OnlineArenaPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/" element={
            <ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
          }/>
          <Route path="/game/setup" element={
            <ProtectedRoute><Layout><GameSetupPage /></Layout></ProtectedRoute>
          }/>
          <Route path="/game/:id" element={
            <ProtectedRoute><Layout><GameBoardPage /></Layout></ProtectedRoute>
          }/>
          <Route path="/game/:id/replay" element={
            <ProtectedRoute><Layout><GameReplayPage /></Layout></ProtectedRoute>
          }/>
          <Route path="/history" element={
            <ProtectedRoute><Layout><GameHistoryPage /></Layout></ProtectedRoute>
          }/>
          <Route path="/arena" element={
            <ProtectedRoute><Layout><OnlineArenaPage /></Layout></ProtectedRoute>
          }/>

          {/* Admin only */}
          <Route path="/admin/players" element={
            <ProtectedRoute requireAdmin><Layout><AdminPlayersPage /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/games" element={
            <ProtectedRoute requireAdmin><Layout><AdminGamesPage /></Layout></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

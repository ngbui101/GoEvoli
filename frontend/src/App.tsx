import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { Navbar } from './components/Navbar';
import { Board } from './pages/Board';
import { CreateProject } from './pages/CreateProject';
import { CreateStory } from './pages/CreateStory';
import { Profile } from './pages/Profile';
import { TaskDetail } from './pages/TaskDetail';
import { ProjectSettings } from './pages/ProjectSettings';
import { DesignSystem } from './pages/DesignSystem';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:projectId/board" element={<Board />} />
            <Route path="/projects/:projectId/stories/new" element={<CreateStory />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/design-system" element={<DesignSystem />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ className: '!bg-evoli-secondary !text-evoli-text !border !border-evoli-primary/20' }} />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

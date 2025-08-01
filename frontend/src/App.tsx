import { Navigate, Route, Routes } from 'react-router-dom';
import styles from './App.module.scss';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import AudioEdit from './pages/audio/AudioEdit';
import AudioList from './pages/audio/AudioList';
import AudioPlayer from './pages/audio/AudioPlayer';
import AudioUpload from './pages/audio/AudioUpload';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import Profile from './pages/profile/Profile';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner only when we're actually checking auth
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path='/login'
        element={!user ? <Login /> : <Navigate to='/dashboard' />}
      />
      <Route
        path='/register'
        element={!user ? <Register /> : <Navigate to='/login' />}
      />

      {/* Protected routes */}
      <Route path='/' element={user ? <Layout /> : <Navigate to='/login' />}>
        <Route index element={<Navigate to='/dashboard' />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='upload' element={<AudioUpload />} />
        <Route path='files' element={<AudioList />} />
        <Route path='player/:id' element={<AudioPlayer />} />
        <Route path='edit/:id' element={<AudioEdit />} />
        <Route path='profile' element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route
        path='*'
        element={<Navigate to={user ? '/dashboard' : '/login'} />}
      />
    </Routes>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store/store';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Parties from './pages/Parties';
import Inventory from './pages/Inventory';
import Fleet from './pages/Fleet';
import Documents from './pages/Documents';
import Trips from './pages/Trips';
import Transactions from './pages/Transactions';
import EnterpriseChat from './pages/EnterpriseChat';

import { useEffect } from 'react';

function AppContent() {
  useEffect(() => {
    document.title = import.meta.env.VITE_APP_TITLE || 'BLUE STAR | Trading & Co.';
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div className="scroll-progress fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50" style={{ scaleX }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/chat" element={<EnterpriseChat />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App

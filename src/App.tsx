import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reports from './pages/Reports';
import Donors from './pages/Donors';
import Emergency from './pages/Emergency';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="reports" element={<Reports />} />
        <Route path="donors" element={<Donors />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

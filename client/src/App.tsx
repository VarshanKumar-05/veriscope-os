import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Dashboard from './pages/Dashboard.tsx';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/research/:id" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;

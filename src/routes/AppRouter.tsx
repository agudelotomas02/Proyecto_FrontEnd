import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Productos from '../pages/Productos';
import PosRestaurantes from '../pages/PosRestaurantes';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/pos/restaurantes" element={<PosRestaurantes />} />
      <Route path="/pos/:restaurante/inventario" element={<div>Inventario (próximamente)</div>} />

    </Routes>
  </BrowserRouter>
);

export default AppRouter;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Inventario from '../pages/Inventario';
import PosRestaurantes from '../pages/PosRestaurantes';
import Update from '../pages/Update';
import Orders from '../pages/Orders';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pos/restaurantes" element={<PosRestaurantes />} />
      <Route path="/pos/:restaurante/inventario" element={<Inventario />} />
      <Route path="/pos/:restaurante/update" element={<Update />} />
      <Route path="/pos/:restaurante/orders" element={<Orders />} />

    </Routes>
  </BrowserRouter>
);

export default AppRouter;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Inventario from '../pages/Inventario';
import PosRestaurantes from '../pages/PosRestaurantes';
import Update from '../pages/Update';
import Orders from '../pages/Orders';
import RestaurantesCliente from '../pages/RestaurantesCliente';
import ProductosCliente from '../pages/ProductosCliente';
import PedidosCliente from '../pages/PedidosCliente';
import BuscarComida from '../pages/BuscarComida';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cliente/restaurantes" element={<RestaurantesCliente />} />
      <Route path="/pos/restaurantes" element={<PosRestaurantes />} />
      <Route path="/pos/:restaurante/inventario" element={<Inventario />} />
      <Route path="/pos/:restaurante/update" element={<Update />} />
      <Route path="/pos/:restaurante/orders" element={<Orders />} />
      <Route path="/cliente/restaurantes/:restauranteId/productos" element={<ProductosCliente />} />
      <Route path="/cliente/pedidos" element={<PedidosCliente />} />
      <Route path="/cliente/buscar" element={<BuscarComida />} />

    </Routes>
  </BrowserRouter>
);

export default AppRouter;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BuscarComida.css';

interface Producto {
  id: string;
  name: string;
  price: number;
  stock: number;
  restaurante: string;
}

const BuscarComida = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProductos = async () => {
    try {
      const res = await fetch('https://proyecto-backend-zeta.vercel.app/api/inventory/cliente');
      if (!res.ok) throw new Error('Error al cargar los productos');
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const productosFiltrados = productos.filter(p =>
    p.name.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleSeleccionarProducto = (producto: Producto) => {
    navigate(`/cliente/restaurantes/${producto.restaurante}/productos`, {
      state: { productoId: producto.id }
    });
  };

  const handleVolver = () => {
    navigate('/cliente/restaurantes');
  };

  return (
    <div className="buscar-container">
      <button onClick={handleVolver} className="btn-volver">⬅ Volver a restaurantes</button>
      <h2 className="buscar-titulo">🔍 Buscar comida</h2>
      <input
        type="text"
        placeholder="Escribe el nombre del producto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="buscar-input"
      />

      {loading ? (
        <p className="buscar-cargando">Cargando comidas...</p>
      ) : productosFiltrados.length === 0 ? (
        <p className="buscar-vacio">No se encontraron productos</p>
      ) : (
        <div className="buscar-grid">
          {productosFiltrados.map((p, index) => (
            <div
              key={`${p.id}-${p.restaurante}-${index}`}
              className="producto-card"
              onClick={() => handleSeleccionarProducto(p)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{p.name}</h3>
              <p>💲 <strong>${p.price.toLocaleString()}</strong></p>
              <p>🏪 Restaurante: <strong>{p.restaurante}</strong></p>
              <p>📦 Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuscarComida;

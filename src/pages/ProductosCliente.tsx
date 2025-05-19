import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductosCliente.css';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// 🧠 MAPA DE ALIAS → CLAVE REAL EN BACKEND (en minúsculas)
const RESTAURANTE_MAP: Record<string, string> = {
  terraza: 'terrazaLiving',
  terrazaliving: 'terrazaLiving',
  embarcadero: 'embarcadero',
  meson: 'meson',
  banderitas: 'banderitas',
  arcos: 'arcos',
  cafebolsa: 'cafeBolsa',
  terrazaescuela: 'terrazaEscuela',
  puntowok: 'puntoWok',
  puntocrepes: 'puntoCrepes',
  puntosandwich: 'puntoSandwich',
  embarcaderocarta: 'embarcaderoCarta',
  restauranteescuela: 'restauranteEscuela'
};

const ProductosCliente = () => {
  const { restauranteId } = useParams<{ restauranteId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorRestaurante, setErrorRestaurante] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const rawId = restauranteId?.toLowerCase();
      const realRestauranteId = rawId ? RESTAURANTE_MAP[rawId] || rawId : '';

      try {
        const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${realRestauranteId}`);
        if (!res.ok) throw new Error('Restaurante no encontrado');

        const data = await res.json();

        const productosTransformados = Array.isArray(data)
          ? data
          : Object.entries(data).map(([id, prod]) => ({
              id,
              ...(prod as Omit<Product, 'id'>),
            }));

        setProducts(productosTransformados);
        setErrorRestaurante(false);

        const incoming = location.state?.productoId;
        if (incoming && productosTransformados.some(p => p.id === incoming)) {
          setSelectedQuantities({ [incoming]: 1 });
          navigate(location.pathname, { replace: true });
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
        setMensaje('❌ No se pudieron cargar los productos del restaurante');
        setErrorRestaurante(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (restauranteId) {
      fetchProducts();
    }
  }, [restauranteId]);

  const handleQuantityChange = (id: string, delta: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleAddToCart = (id: string) => {
    const qtyToAdd = selectedQuantities[id] || 0;
    if (qtyToAdd > 0) {
      setCart(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + qtyToAdd
      }));
      setSelectedQuantities(prev => ({
        ...prev,
        [id]: 0
      }));
    }
  };

  const handlePay = async () => {
    if (!user?.id || !restauranteId) {
      setMensaje('❌ No se pudo identificar el usuario o el restaurante.');
      return;
    }

    try {
      for (const [id, cantidad] of Object.entries(cart)) {
        await fetch(`https://proyecto-backend-zeta.vercel.app/api/cart/${user.id}/${restauranteId}/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cantidad })
        });
      }

      const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/orders/${user.id}/${restauranteId}`, {
        method: 'POST'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar el pedido');

      setProducts(prev =>
        prev.map(p => ({
          ...p,
          stock: p.id in cart ? p.stock - cart[p.id] : p.stock
        }))
      );

      setMensaje(`✅ ¡Pedido realizado exitosamente! Pedido #${data.numeroPedido}`);
      setCart({});
      setTimeout(() => navigate('/cliente/restaurantes'), 2000);
    } catch (err) {
      console.error(err);
      setMensaje('❌ Hubo un problema al procesar tu pago');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const prod = products.find(p => p.id === id);
    return prod ? acc + prod.price * qty : acc;
  }, 0);

  return (
    <div className="cliente-container">
      <div className="cliente-header">
        <h2 className="cliente-titulo">{restauranteId?.toUpperCase()}</h2>
        <button onClick={() => navigate('/cliente/restaurantes')} className="cliente-volver">← Volver</button>
      </div>

      <input
        className="cliente-busqueda"
        placeholder="Buscar producto..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {mensaje && (
        <div className={`cliente-mensaje ${mensaje.startsWith('✅') ? 'cliente-exito' : 'cliente-error'}`}>
          {mensaje}
        </div>
      )}

      {loading ? (
        <p className="cliente-cargando">Cargando productos...</p>
      ) : errorRestaurante ? (
        <p className="cliente-error">Este restaurante no tiene productos registrados.</p>
      ) : (
        <div className="cliente-productos">
          {filteredProducts.length === 0 ? (
            <p>No hay productos disponibles</p>
          ) : (
            filteredProducts.map(p => (
              <div key={p.id} className="cliente-producto">
                <p className="cliente-producto-nombre">{p.name}</p>
                <p>ID: {p.id}</p>
                <p>Stock: {p.stock}</p>
                <p>Precio: ${p.price.toLocaleString()}</p>

                <div className="cliente-cantidad">
                  <button onClick={() => handleQuantityChange(p.id, -1)} className="cliente-boton-rojo">-</button>
                  <span>{selectedQuantities[p.id] || 0}</span>
                  <button onClick={() => handleQuantityChange(p.id, 1)} className="cliente-boton-verde">+</button>
                </div>

                <button
                  className="cliente-boton-azul"
                  onClick={() => handleAddToCart(p.id)}
                  disabled={p.stock <= 0}
                  style={p.stock <= 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  🛒 Añadir al carrito
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="cliente-carrito">
        <h3 className="cliente-subtitulo">Carrito</h3>
        {Object.keys(cart).length === 0 ? (
          <p>No hay productos</p>
        ) : (
          <>
            <ul className="cliente-lista">
              {Object.entries(cart).map(([id, qty]) => {
                const producto = products.find(p => p.id === id);
                return producto ? (
                  <li key={id}>{producto.name} x{qty}</li>
                ) : null;
              })}
            </ul>
            <p className="cliente-total">Total: ${total.toLocaleString()}</p>
            <button onClick={handlePay} className="cliente-boton-pagar">
              Pagar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductosCliente;

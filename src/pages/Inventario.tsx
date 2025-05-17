import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const Inventory = () => {
  const { restaurante } = useParams<{ restaurante: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
  }, [restaurante]);

const fetchProducts = async () => {
  const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}`);
  const data = await res.json();

  const productosTransformados = Object.entries(data).map(([id, prod]) => ({
    id,
    ...(prod as Omit<Product, 'id'>),
  }));

  setProducts(productosTransformados);
};


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

  const handleSell = async () => {
    for (const id in cart) {
      const product = products.find(p => p.id === id);
      if (!product) continue;

      const newStock = product.stock - cart[id];

      await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
    }

    alert('Venta realizada');
    setCart({});
    fetchProducts();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const prod = products.find(p => p.id === id);
    return prod ? acc + prod.price * qty : acc;
  }, 0);

  return (
    <div style={{ padding: '1rem' }}>
      {/* Barra superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)}>←</button>
        <h2>{restaurante}</h2>
        <button onClick={() => alert('Cerrar sesión')}>⏻</button>
      </div>

      {/* Navegación */}
      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <button onClick={() => navigate(`/pos/${restaurante}/inventario`)}>Inventario</button>
        <button onClick={() => navigate(`/pos/${restaurante}/update`)}>Actualizar</button>
        <button onClick={() => navigate(`/pos/${restaurante}/orders`)}>Pedidos</button>
        <input
          placeholder="Buscar producto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex' }}>
        {/* Listado de productos */}
        <div style={{ flex: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {filteredProducts.map(p => (
            <div key={p.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div>ID: {p.id}</div>
              <div>Stock: {p.stock}</div>
              <div>Precio: ${p.price.toLocaleString()}</div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                <button onClick={() => handleQuantityChange(p.id, -1)}>-</button>
                <span style={{ margin: '0 1rem' }}>{selectedQuantities[p.id] || 0}</span>
                <button onClick={() => handleQuantityChange(p.id, 1)}>+</button>
              </div>

              <button style={{ marginTop: '0.5rem' }} onClick={() => handleAddToCart(p.id)}>
                🛒 Añadir al carrito
              </button>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div style={{ flex: 1, marginLeft: '2rem' }}>
          <h3>Carrito</h3>
          {Object.keys(cart).length === 0 ? (
            <p>No hay productos</p>
          ) : (
            <>
              <ul>
                {Object.entries(cart).map(([id, qty]) => {
                  const product = products.find(p => p.id === id);
                  return product ? (
                    <li key={id} style={{ marginBottom: '0.5rem' }}>
                      {product.name} x{qty}
                    </li>
                  ) : null;
                })}
              </ul>
              <p><strong>Total:</strong> ${total.toLocaleString()}</p>
              <button onClick={handleSell}>Vender</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;

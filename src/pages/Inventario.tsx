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
    <div className="inventory-page">
      {/* Header superior */}
      <div className="inventory-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h2>{restaurante}</h2>
        <button
          title="Cerrar sesión"
          onClick={() => navigate('/login')}
          style={{
            fontSize: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🚪
        </button>
      </div>

      {/* Barra de navegación */}
      <div className="inventory-controls">
        <button className="active">Inventario</button>
        <button onClick={() => navigate(`/pos/${restaurante}/update`)}>Actualizar</button>
        <button onClick={() => navigate(`/pos/${restaurante}/orders`)}>Pedidos</button>
        <input
          placeholder="Buscar producto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="inventory-body">
        {/* Grid de productos */}
        <div className="products-grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-header">
                <span className="product-name">{p.name}</span>
                <span className="product-id">#{p.id}</span>
              </div>

              <div className="stock-row">
                <div className="stock-box">
                  <div className="label">📦</div>
                  <div className="value">{p.stock}</div>
                </div>
                <div className="quantity-selector">
                  <button className="decrease" onClick={() => handleQuantityChange(p.id, -1)}>-</button>
                  <span>{selectedQuantities[p.id] || 0}</span>
                  <button className="increase" onClick={() => handleQuantityChange(p.id, 1)}>+</button>
                </div>
              </div>

              <div className="card-footer">
                <div className="price-box">${p.price.toLocaleString()}</div>
                <button className="cart-button" onClick={() => handleAddToCart(p.id)}>🛒</button>
              </div>
            </div>
          ))}
        </div>

        {/* Carrito */}
        <div className="cart-sidebar">
          <h3>Carrito</h3>
          {Object.keys(cart).length === 0 ? (
            <p>No hay productos</p>
          ) : (
            <>
              <div className="cart-items">
                {Object.entries(cart).map(([id, qty]) => {
                  const product = products.find(p => p.id === id);
                  return product ? (
                    <div key={id} className="cart-item-card">
                      <div className="cart-item-header">
                        <span>{product.name}</span>
                        <button onClick={() => {
                          const updatedCart = { ...cart };
                          delete updatedCart[id];
                          setCart(updatedCart);
                        }}>❌</button>
                      </div>
                      <div className="cart-item-qty">Cantidad: {qty}</div>
                    </div>
                  ) : null;
                })}
              </div>
              <p><strong>Total:</strong> ${total.toLocaleString()}</p>
              <button className="cart-button full" onClick={handleSell}>Vender</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
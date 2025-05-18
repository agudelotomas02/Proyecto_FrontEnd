import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const Update = () => {
  const { restaurante } = useParams<{ restaurante: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');

  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    price: '',
    stock: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [restaurante]);

  const fetchProducts = async () => {
    const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}`);
    const data = await res.json();

    const transformed = Object.entries(data).map(([id, prod]) => ({
      id,
      ...(prod as Omit<Product, 'id'>),
    }));

    setProducts(transformed);
  };

  const handlePriceChange = (id: string, value: string) => {
    const price = parseInt(value, 10);
    if (!isNaN(price)) {
      setPriceUpdates(prev => ({ ...prev, [id]: price }));
    }
  };

  const handleStockDelta = (id: string, delta: number) => {
    setStockChanges(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + delta,
    }));
  };

  const handleUpdate = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const updatedPrice = priceUpdates[id] ?? product.price;
    const updatedStock = product.stock + (stockChanges[id] || 0);

    await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name,
        price: updatedPrice,
        stock: updatedStock,
        category: product.category,
      }),
    });

    alert('Producto actualizado');
    setPriceUpdates(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setStockChanges(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}/${id}`, {
      method: 'DELETE',
    });
    alert('Producto eliminado');
    fetchProducts();
  };

  const handleCreateProduct = async () => {
    const { name, price, stock, category } = newProduct;
    const id = Date.now().toString();
    await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        price: parseInt(price),
        stock: parseInt(stock),
        category,
      }),
    });

    alert('Producto creado');
    setNewProduct({ id: '', name: '', price: '', stock: '', category: '' });
    fetchProducts();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

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
        <button onClick={() => navigate(`/pos/${restaurante}/inventario`)}>Inventario</button>
        <button className="active">Actualizar</button>
        <button onClick={() => navigate(`/pos/${restaurante}/orders`)}>Pedidos</button>
        <input
          placeholder="Buscar producto..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Productos + Nuevo producto */}
      <div className="inventory-body">
        {/* Lista de productos */}
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
                  <button className="decrease" onClick={() => handleStockDelta(p.id, -1)}>-</button>
                  <span>{stockChanges[p.id] || 0}</span>
                  <button className="increase" onClick={() => handleStockDelta(p.id, 1)}>+</button>
                </div>
              </div>

              <div className="card-footer">
                <input
                  className="price-display editable"
                  type="number"
                  value={priceUpdates[p.id] ?? p.price}
                  onChange={(e) => handlePriceChange(p.id, e.target.value)}
                />
                <div className="action-buttons">
                  <button className="confirm" onClick={() => handleUpdate(p.id)}>✅</button>
                  <button className="delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panel lateral: nuevo producto */}
        <div className="cart-sidebar">
          <h3>Nuevo producto</h3>
          <input
            className="input-field"
            placeholder="Nombre"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Categoría"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <button className="create-button" onClick={handleCreateProduct}>➕ Crear</button>
        </div>
      </div>
    </div>
  );
};

export default Update;

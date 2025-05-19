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
  const [priceUpdates, setPriceUpdates] = useState<Record<string, string>>({});
  const [stockBase, setStockBase] = useState<Record<string, number>>({});
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
    // Guardar stock base por producto
    const stockBaseMap: Record<string, number> = {};
    transformed.forEach(p => { stockBaseMap[p.id] = p.stock });
    setStockBase(stockBaseMap);
  };

  const handlePriceChange = (id: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setPriceUpdates(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleStockDelta = (id: string, delta: number) => {
    setStockChanges(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + delta,
    }));
  };

  const handleStockEdit = (id: string, value: string) => {
    if (/^\d*$/.test(value)) {
      const newBase = parseInt(value || '0', 10);
      setStockBase(prev => ({ ...prev, [id]: newBase }));
    }
  };

  const handleUpdate = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const updatedPriceRaw = priceUpdates[id];
    const updatedPrice = updatedPriceRaw !== undefined
      ? parseInt(updatedPriceRaw)
      : product.price;

    if (isNaN(updatedPrice) || updatedPrice <= 0) {
      alert('El precio debe ser un número mayor a cero.');
      return;
    }

    const updatedStock = stockBase[id] + (stockChanges[id] || 0);
    if (updatedStock < 0) {
      alert('El stock final no puede ser negativo.');
      return;
    }

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

    if (!name.trim() || !price.trim() || !stock.trim() || !category.trim()) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const parsedPrice = parseInt(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('El precio debe ser un número mayor a cero.');
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      alert('El stock debe ser un número entero positivo o cero.');
      return;
    }

    const id = Date.now().toString();
    await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restaurante}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        price: parsedPrice,
        stock: parsedStock,
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

      <div className="inventory-body">
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
                  <input
                    className="value"
                    type="text"
                    inputMode="numeric"
                    value={stockBase[p.id]?.toString() ?? p.stock.toString()}
                    onChange={(e) => handleStockEdit(p.id, e.target.value)}
                    style={{
                      width: '50px',
                      textAlign: 'center',
                      border: 'none',
                      outline: 'none',
                      background: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                    }}
                  />
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
                  type="text"
                  inputMode="numeric"
                  value={priceUpdates[p.id] ?? p.price.toString()}
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
            inputMode="numeric"
            value={newProduct.price}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                setNewProduct({ ...newProduct, price: e.target.value });
              }
            }}
          />
          <input
            className="input-field"
            placeholder="Stock"
            inputMode="numeric"
            value={newProduct.stock}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                setNewProduct({ ...newProduct, stock: e.target.value });
              }
            }}
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

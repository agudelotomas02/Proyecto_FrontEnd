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

  // Form state for new product
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

    alert('Product updated');
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

    alert('Product deleted');
    fetchProducts();
  };

  const handleCreateProduct = async () => {
    const { name, price, stock, category } = newProduct;
    const id = Date.now().toString(); // simple unique ID
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

    alert('Product created');
    setNewProduct({ id: '', name: '', price: '', stock: '', category: '' });
    fetchProducts();
  };

  return (
    <div>
      <div>
        <button onClick={() => navigate(-1)}>←</button>
        <h2>{restaurante}</h2>
        <button onClick={() => alert('Logout')}>⏻</button>
      </div>

      {/* Navigation */}
      <div>
        <button onClick={() => navigate(`/pos/${restaurante}/inventario`)}>Inventory</button>
        <button onClick={() => navigate(`/pos/${restaurante}/update`)}>Update</button>
        <button onClick={() => navigate(`/pos/${restaurante}/orders`)}>Orders</button>
      </div>

      {/* Products */}
      <div>
        <h3>Products</h3>
        {products.map(p => (
          <div key={p.id}>
            <strong>{p.name}</strong> (ID: {p.id})
            <div>
              Stock: {p.stock} ➕ {stockChanges[p.id] || 0}
              <button onClick={() => handleStockDelta(p.id, -1)}>-</button>
              <button onClick={() => handleStockDelta(p.id, 1)}>+</button>
            </div>
            <div>
              Price:
              <input
                type="number"
                value={priceUpdates[p.id] ?? p.price}
                onChange={(e) => handlePriceChange(p.id, e.target.value)}
              />
            </div>
            <button onClick={() => handleUpdate(p.id)}>✅ Confirm</button>
            <button onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
          </div>
        ))}
      </div>

      {/* New Product Form */}
      <div>
        <h3>New product</h3>
        <input
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
        />
        <input
          placeholder="Category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <button onClick={handleCreateProduct}>Create</button>
      </div>
    </div>
  );
};

export default Update;

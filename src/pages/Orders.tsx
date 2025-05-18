import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Order {
  id: string;
  status: 'created' | 'preparing' | 'ready';
}

const Orders = () => {
  const { restaurante } = useParams<{ restaurante: string }>();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCreated, setSelectedCreated] = useState<string | null>(null);
  const [selectedPreparing, setSelectedPreparing] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [restaurante]);

  const fetchOrders = async () => {
    const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/orders/restaurante/${restaurante}`);
    const data = await res.json();


    //AQUI LA EMBARRÉ Y TOCA TRADUCIR POR NO PRGRAMAR EN INGLES
//_____________________________________________________________________
    const formatted = Object.entries(data).map(([id, value]) => {
    const estado = (value as any).estado;
    let status: Order['status'];

    switch (estado) {
        case 'creado':
        status = 'created';
        break;
        case 'preparando':
        status = 'preparing';
        break;
        case 'listo':
        status = 'ready';
        break;
        default:
        status = 'created';
    }

//_______________________________________________________________________

  return { id, status };
});

    setOrders(formatted);
  };

const changeStatus = async (id: string, newStatus: Order['status']) => {
  // Traducción al formato esperado por el backend, La volvi a embarrar por la traducción
  let estadoTraducido;
  switch (newStatus) {
    case 'created':
      estadoTraducido = 'creado';
      break;
    case 'preparing':
      estadoTraducido = 'preparando';
      break;
    case 'ready':
      estadoTraducido = 'listo';
      break;
    default:
      return; // evita hacer fetch con estado inválido
  }

  await fetch(`https://proyecto-backend-zeta.vercel.app/api/orders/${restaurante}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: estadoTraducido })
  });

  fetchOrders();
};


  const filteredOrders = search.trim()
    ? orders.filter(o => o.id.includes(search.trim()))
    : orders;

  const createdOrders = filteredOrders.filter(o => o.status === 'created');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');

  return (
    <div style={{ padding: '1rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)}>←</button>
        <h2>{restaurante}</h2>
        <button onClick={() => alert('Logout')}>⏻</button>
      </div>

      {/* Navigation bar and search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
        <button onClick={() => navigate(`/pos/${restaurante}/inventario`)}>Inventory</button>
        <button onClick={() => navigate(`/pos/${restaurante}/update`)}>Update</button>
        <button disabled>Orders</button>
        <input
          type="text"
          placeholder="Search by order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders layout */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Created */}
        <div style={{ flex: 1 }}>
          <h3>Created</h3>
          <ul>
            {createdOrders.map(o => (
              <li
                key={o.id}
                onClick={() => setSelectedCreated(o.id)}
                style={{
                  backgroundColor: selectedCreated === o.id ? 'blue' : 'white',
                  color: selectedCreated === o.id ? 'white' : 'black',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                {o.id}
              </li>
            ))}
          </ul>
          <button
            disabled={!selectedCreated}
            onClick={() => {
              if (selectedCreated) {
                changeStatus(selectedCreated, 'preparing');
                setSelectedCreated(null);
              }
            }}
          >
            Prepare
          </button>
        </div>

        {/* Preparing */}
        <div style={{ flex: 1 }}>
          <h3>Preparing</h3>
          <ul>
            {preparingOrders.map(o => (
              <li
                key={o.id}
                onClick={() => setSelectedPreparing(o.id)}
                style={{
                  backgroundColor: selectedPreparing === o.id ? 'blue' : 'white',
                  color: selectedPreparing === o.id ? 'white' : 'black',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                {o.id}
              </li>
            ))}
          </ul>
          <button
            disabled={!selectedPreparing}
            onClick={() => {
              if (selectedPreparing) {
                changeStatus(selectedPreparing, 'ready');
                setSelectedPreparing(null);
              }
            }}
          >
            Finish
          </button>
        </div>

        {/* Ready */}
        <div style={{ flex: 1 }}>
          <h3>Ready</h3>
          <ul>
            {readyOrders.map(o => (
              <li
                key={o.id}
                style={{
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                {o.id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Orders;

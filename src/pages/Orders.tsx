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

    if (!res.ok || !data || typeof data !== 'object' || 'mensaje' in data) {
      setOrders([]);
      return;
    }

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

      return { id, status };
    });

    setOrders(formatted);
  };

  const changeStatus = async (id: string, newStatus: Order['status']) => {
    let estadoTraducido;
    switch (newStatus) {
      case 'created': estadoTraducido = 'creado'; break;
      case 'preparing': estadoTraducido = 'preparando'; break;
      case 'ready': estadoTraducido = 'listo'; break;
      default: return;
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
        <button onClick={() => navigate(`/pos/${restaurante}/update`)}>Actualizar</button>
        <button className="active">Pedidos</button>
        <input
          placeholder="Buscar pedido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Secciones de pedidos */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Creados */}
        <div style={{
          flex: 1,
          backgroundColor: '#dcdcdc',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.5rem'
        }}>
          <div>
            <div style={{
              backgroundColor: '#0000aa',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              padding: '0.5rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>Creados</div>
            <ul style={{ padding: 0, marginTop: '0.5rem', listStyle: 'none' }}>
              {createdOrders.map(o => (
                <li
                  key={o.id}
                  onClick={() => setSelectedCreated(o.id)}
                  style={{
                    backgroundColor: selectedCreated === o.id ? '#0000aa' : 'white',
                    color: selectedCreated === o.id ? 'white' : 'black',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  {o.id}
                </li>
              ))}
            </ul>
          </div>
          <button
            disabled={!selectedCreated}
            onClick={() => {
              if (selectedCreated) {
                changeStatus(selectedCreated, 'preparing');
                setSelectedCreated(null);
              }
            }}
            style={{
              backgroundColor: selectedCreated ? '#00ff66' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: selectedCreated ? 'pointer' : 'default',
              marginTop: 'auto'
            }}
          >
            Preparar
          </button>
        </div>

        {/* Preparando */}
        <div style={{
          flex: 1,
          backgroundColor: '#dcdcdc',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0.5rem'
        }}>
          <div>
            <div style={{
              backgroundColor: '#0000aa',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              padding: '0.5rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>Preparando</div>
            <ul style={{ padding: 0, marginTop: '0.5rem', listStyle: 'none' }}>
              {preparingOrders.map(o => (
                <li
                  key={o.id}
                  onClick={() => setSelectedPreparing(o.id)}
                  style={{
                    backgroundColor: selectedPreparing === o.id ? '#0000aa' : 'white',
                    color: selectedPreparing === o.id ? 'white' : 'black',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  {o.id}
                </li>
              ))}
            </ul>
          </div>
          <button
            disabled={!selectedPreparing}
            onClick={() => {
              if (selectedPreparing) {
                changeStatus(selectedPreparing, 'ready');
                setSelectedPreparing(null);
              }
            }}
            style={{
              backgroundColor: selectedPreparing ? '#999' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: selectedPreparing ? 'pointer' : 'default',
              marginTop: 'auto'
            }}
          >
            Terminar
          </button>
        </div>

        {/* Listos */}
        <div style={{
          flex: 1,
          backgroundColor: '#dcdcdc',
          borderRadius: '12px',
          padding: '0.5rem'
        }}>
          <div style={{
            backgroundColor: '#0000aa',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            padding: '0.5rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>Listos</div>
          <ul style={{ padding: 0, marginTop: '0.5rem', listStyle: 'none' }}>
            {readyOrders.map(o => (
              <li
                key={o.id}
                style={{
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textAlign: 'center'
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

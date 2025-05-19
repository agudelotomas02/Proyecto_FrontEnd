import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/PedidosCliente.css';

interface Pedido {
  restauranteId: string;
  pedidoId: string;
  productos: Record<string, { cantidad: number; total: number }>;
  estado: 'creado' | 'preparando' | 'listo';
}

const PedidosCliente = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/orders/${user.id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'No se pudieron obtener los pedidos');
        setPedidos(data);
      } catch (err) {
        console.error(err);
        setMensaje('❌ No se pudieron cargar los pedidos');
      }
    };

    fetchPedidos();
  }, [user]);

  const traducirEstado = (estado: string) => {
    switch (estado) {
      case 'creado': return '🟡 Creado';
      case 'preparando': return '🟠 Preparando';
      case 'listo': return '🟢 Listo';
      default: return estado;
    }
  };

  const cerrarPedido = (pedidoId: string) => {
    setPedidos(prev => prev.filter(p => p.pedidoId !== pedidoId));
  };

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <button onClick={() => navigate('/cliente/restaurantes')} className="btn-volver">
          ← Volver
        </button>
        <h2>📋 Mis pedidos</h2>
        <div></div>
      </div>

      {mensaje && <p className="mensaje-error">{mensaje}</p>}

      {pedidos.length === 0 ? (
        <p className="mensaje-vacio">No has realizado pedidos aún.</p>
      ) : (
        <div className="pedidos-lista">
          {pedidos.map((pedido) => (
            <div key={pedido.pedidoId} className="pedido-card">
              <h3>📍 {pedido.restauranteId}</h3>
              <p><strong>ID:</strong> {pedido.pedidoId}</p>
              <p><strong>Estado:</strong> {traducirEstado(pedido.estado)}</p>
              <ul>
                {Object.entries(pedido.productos).map(([prodId, prod]) => (
                  <li key={prodId}>
                    Producto #{prodId} – x{prod.cantidad} – ${prod.total.toLocaleString()}
                  </li>
                ))}
              </ul>
              {pedido.estado === 'listo' && (
                <button
                  className="btn-cerrar"
                  onClick={() => cerrarPedido(pedido.pedidoId)}
                >
                  ✅ Cerrar pedido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosCliente;

import { useNavigate } from 'react-router-dom';

const RestaurantesCliente = () => {
  const navigate = useNavigate();

  // Restaurantes visuales (nombre) + sus IDs reales del backend
  const restaurantes = [
    { nombre: 'Embarcadero', id: 'embarcadero' },
    { nombre: 'Embarcadero – Carta', id: 'embarcadero' },
    { nombre: 'Mesón', id: 'meson' },
    { nombre: 'Mesón – Carta', id: 'meson' },
    { nombre: 'Mesón – Banderitas', id: 'meson' },
    { nombre: 'Terraza Living Lab', id: 'terraza' },
    { nombre: 'Punto Sandwich', id: 'puntosandwich' },
    { nombre: 'Punto Wok', id: 'puntowok' }
  ];

  const manejarClick = (id: string) => {
    navigate(`/cliente/restaurantes/${id}/productos`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Realizar pedido</h2>
      <div className="space-y-4">
        {restaurantes.map((rest) => (
          <button
            key={rest.nombre}
            onClick={() => manejarClick(rest.id)}
            className="w-full bg-gray-200 rounded-xl py-3 text-black shadow hover:bg-gray-300 transition"
          >
            {rest.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RestaurantesCliente;

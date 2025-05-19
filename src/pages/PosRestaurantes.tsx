import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../PosRestaurantes.css';

const imageMap: Record<string, string> = {
  embarcadero: '/images/embarcadero.jpeg',
  meson: '/images/meson.jpeg',
  banderitas: '/images/meson-banderitas.jpg',
  arcos: '/images/arcos.jpeg',
  terrazaLiving: '/images/terraza-living.jpg',
  cafeBolsa: '/images/cafe-bolsa.jpg',
  restauranteEscuela: '/images/escuela.jpg',
  terrazaEscuela: '/images/escuela-terraza.jpg',
  puntoWok: '/images/wok.png',
  puntoCrepes: '/images/punto-crepes.jpg',
  puntoSandwich: '/images/sandwich.jpg',
  embarcaderoCarta: '/images/embarcadero-carta.jpg',
};

const PosRestaurantes = () => {
  const navigate = useNavigate();
  const [restaurantes, setRestaurantes] = useState<string[]>([]);

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const res = await fetch('https://proyecto-backend-zeta.vercel.app/api/inventory');
        const data = await res.json();
        setRestaurantes(data);
      } catch (err) {
        console.error('Error al cargar restaurantes', err);
      }
    };

    fetchRestaurantes();
  }, []);

  const seleccionar = (id: string) => {
    navigate(`/pos/${id}/inventario`);
  };

  return (
    <div className="restaurantes-page">
      <div className="top-header">
        <h2>Puntos de venta</h2>
        <button className="logout-button" onClick={() => navigate('/login')}>🚪</button>
      </div>
      <div className="restaurantes-grid">
        {restaurantes.map((id) => (
          <div className="restaurante-card" key={id} onClick={() => seleccionar(id)}>
            <div className="image-section">
              <img
                src={imageMap[id] || '/images/default.jpg'}
                alt={id}
              />
            </div>
            <div className="name-section">{formatearNombre(id)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatearNombre(id: string) {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/([A-Z][a-z]+)/g, (w) => w[0].toUpperCase() + w.slice(1))
    .trim();
}

export default PosRestaurantes;
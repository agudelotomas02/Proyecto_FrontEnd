import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <h2>Selecciona un restaurante</h2>
      <ul>
        {restaurantes.map((r) => (
          <li key={r}>
            <button onClick={() => seleccionar(r)}>{formatearNombre(r)}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Opcional: función para mostrar nombres más bonitos
function formatearNombre(id: string) {
  return id
    .replace(/([A-Z])/g, ' $1')   // puntoSandwich → punto Sandwich
    .replace(/^./, (c) => c.toUpperCase()) // primera en mayúscula
    .replace(/([A-Z][a-z]+)/g, (w) => w[0].toUpperCase() + w.slice(1)); // mejor capitalización
}

export default PosRestaurantes;

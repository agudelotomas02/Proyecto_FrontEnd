import { useNavigate } from 'react-router-dom';

const restaurantes = [
  { id: 'embarcadero', nombre: 'El Embarcadero' },
  { id: 'puntoSandwich', nombre: 'Punto Sandwich' },
  { id: 'puntoWok', nombre: 'Punto Wok' }
];

const PosRestaurantes = () => {
  const navigate = useNavigate();

  const seleccionar = (id: string) => {
    navigate(`/pos/${id}/inventario`);
  };

  return (
    <div>
      <h2>Selecciona un restaurante</h2>
      <ul>
        {restaurantes.map(r => (
          <li key={r.id}>
            <button onClick={() => seleccionar(r.id)}>{r.nombre}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PosRestaurantes;

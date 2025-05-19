import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import '../styles/RestaurantesCliente.css';

const RestaurantesCliente = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const restaurantes = [
    { nombre: 'Embarcadero', id: 'embarcadero' },
    { nombre: 'Embarcadero – Carta', id: 'embarcadero' },
    { nombre: 'Mesón', id: 'meson' },
    { nombre: 'Mesón – Carta', id: 'meson' },
    { nombre: 'Mesón – Banderitas', id: 'meson' },
    { nombre: 'Terraza Living Lab', id: 'terraza' },
    { nombre: 'Punto Sandwich', id: 'puntosandwich' },
    { nombre: 'Punto Wok', id: 'puntowok' },
  ];

  const manejarClick = (id: string) => {
    navigate(`/cliente/restaurantes/${id}/productos`);
  };

  const toggleMenu = () => {
    setMenuAbierto((prev) => !prev);
  };

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  // Cierra el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto]);

  return (
    <div className="contenedor">
      <div className="encabezado azul-institucional">
        <h2 className="titulo centrado">Realizar pedido – Selecciona un punto</h2>
        <div className="menu-contenedor" ref={menuRef}>
          <button onClick={toggleMenu} className="boton-menu">
            ☰
          </button>
          {menuAbierto && (
            <div className="menu-dropdown">
              <button onClick={cerrarSesion} className="menu-item cerrar">
                🔒 Cerrar sesión
              </button>
              <button onClick={() => navigate('/cliente/pedidos')} className="menu-item pedidos">
                📦 Pedidos realizados
              </button>
              <button onClick={() => navigate('/cliente/buscar')} className="menu-item buscar">
                🔍 Buscar comida
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lista-restaurantes">
        {restaurantes.map((rest) => (
          <button
            key={rest.nombre}
            onClick={() => manejarClick(rest.id)}
            className="boton-restaurante"
          >
            {rest.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RestaurantesCliente;

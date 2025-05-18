import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Producto {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const ProductosCliente = () => {
  const { restauranteId } = useParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        const res = await fetch(`https://proyecto-backend-zeta.vercel.app/api/inventory/${restauranteId}`);
        if (!res.ok) throw new Error('No se pudo obtener el inventario');
        const data = await res.json();
        setProductos(Object.values(data)); // Asegúrate que es un objeto de productos
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido');
        }
      } finally {
        setCargando(false);
      }
    };

    if (restauranteId) fetchProductos();
  }, [restauranteId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Productos de {restauranteId?.toUpperCase()}
      </h2>

      {cargando && <p>Cargando productos...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {productos.length === 0 && !cargando && !error ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="space-y-4">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="flex justify-between items-center bg-blue-800 text-white p-4 rounded-xl shadow"
            >
              <div>
                <p className="text-lg font-semibold">{producto.name}</p>
                <p className="text-sm">Categoría: {producto.category}</p>
                <p className="text-sm">Stock: {producto.stock}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ${producto.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductosCliente;

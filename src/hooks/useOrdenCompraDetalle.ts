import { useEffect, useState } from "react";
import axios from "axios";

// Ajustá esta interfaz según tu modelo real
interface OrdenCompraDetalle {
  id: number;
  cantidad: number;
  detalle: {
    producto: {
      id: number;
      denominacion: string;
      // otros campos si los necesitás
    };
  };
}

export const useOrdenesCompraDetalle = () => {
  const [ordenesCompraDetalle, setOrdenesCompraDetalle] = useState<OrdenCompraDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdenesCompraDetalle = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/ordenes-compra-detalle");
        setOrdenesCompraDetalle(response.data);
      } catch (err: any) {
        setError(err.message || "Error al obtener los detalles");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenesCompraDetalle();
  }, []);

  return { ordenesCompraDetalle, loading, error };
};

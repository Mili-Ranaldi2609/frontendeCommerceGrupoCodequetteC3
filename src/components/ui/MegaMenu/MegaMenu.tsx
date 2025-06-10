import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import styles from "./megaMenu.module.css";

interface Subcategoria {
  id: number;
  denominacion: string;
}

interface CategoriaMenu {
  categoria: string;
  subcategorias: Subcategoria[];
}

interface MegaMenuProps {
  sexo: string; // 'FEMENINO', 'MASCULINO', 'UNISEX', 'UNISEX_CHILD'
}

export const MegaMenu = ({ sexo }: MegaMenuProps) => {
  const [categorias, setCategorias] = useState<CategoriaMenu[]>([]);

  useEffect(() => {
    if (!sexo) return;

    axios
      .get(`http://localhost:8080/menu?sexo=${sexo}`)
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error al cargar menú", err));
  }, [sexo]);

  return (
    <div className={styles.megaMenu}>
      {categorias.map((cat) => (
        <div key={cat.categoria} className={styles.col}>
          {/* Link para la categoría principal */}
          <Link
            // Genera la URL con el parámetro 'sexo' y 'categoria'
            to={`/catalogo?sexo=${encodeURIComponent(sexo)}&tipoProducto=${encodeURIComponent(cat.categoria)}`}
            className={styles.categoryLink} // Agrega una clase para estilos
          >
            <h4>{cat.categoria}</h4>
          </Link>
          <ul>
            {cat.subcategorias.map((sub) => (
              <li key={sub.id}>
                {/* Link para cada subcategoría */}
                <Link
                  // Genera la URL con 'sexo', 'categoria' y 'subcategoria'
                  to={`/catalogo?sexo=${encodeURIComponent(sexo)}&tipoProducto=${encodeURIComponent(cat.categoria)}&categoria=${encodeURIComponent(sub.denominacion)}`}
                  className={styles.subCategoryLink} // Agrega una clase para estilos
                >
                  {sub.denominacion}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
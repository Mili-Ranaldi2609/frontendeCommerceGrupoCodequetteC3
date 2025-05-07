import axios from "axios";
import { useEffect, useState } from "react";
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
  sexo: string; // "MASCULINO", "FEMENINO", etc.
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
          <h4>{cat.categoria}</h4>
          <ul>
            {cat.subcategorias.map((sub) => (
              <li key={sub.id}>{sub.denominacion}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

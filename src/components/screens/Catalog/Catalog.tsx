import React from "react";
import { useProducto } from "../../../hooks/useProduct";
import {ProductoCard} from "../../ProductCard/ProductCard";
import styles from "./Catalog.module.css"
import { NavBar } from "../Navbar/NavBar";
import { Footer } from "../Footer/Footer";
const Catalogo = () => {
  const { productos, loading, error } = useProducto();

  return (
    <>
    <NavBar/>
    <div className={styles.catalogoContainer}>
      <h1 className={styles.titulo}>Catálogo de Productos</h1>

      {loading && <p className={styles.loading}>Cargando productos...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.catalogo}>
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Catalogo;

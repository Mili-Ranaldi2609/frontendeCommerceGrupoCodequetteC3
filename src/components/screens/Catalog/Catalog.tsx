import React, { useState } from "react";
import { useProducto } from "../../../hooks/useProduct";
import { ProductoCard } from "../../ProductCard/ProductCard";
import styles from "./Catalog.module.css";
import { NavBar } from "../Navbar/NavBar";
import { Footer } from "../Footer/Footer";
import { IoFilter } from "react-icons/io5";

const Catalogo = () => {
  const { productos, loading, error } = useProducto();
  const [mostrarFiltro, setMostrarFiltro] = useState(true);

  const toggleFiltro = () => {
    setMostrarFiltro(!mostrarFiltro);
  };

  return (
    <div className="appContainer">
      <NavBar />
      <div className={styles.catalogoContainer}>
        <div className={styles.tituloyfiltro}>
        <h1 className={styles.titulo}>Catálogo de Productos</h1>

        <a className={styles.filtro} onClick={toggleFiltro}>
          {mostrarFiltro ? "Ocultar Filtros" : "Mostrar Filtros"} <IoFilter/>
        </a>
        </div>

        <div className={styles.catalogoLayout}>
          {mostrarFiltro && (
            <aside className={styles.filtroSidebar}>
              <h3>Filtros</h3>
            </aside>
          )}

          <div
            className={`${styles.catalogo} ${mostrarFiltro ? styles.conFiltro : styles.sinFiltro
              }`}
          >
            {loading && <p className={styles.loading}>Cargando productos...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

};

export default Catalogo;

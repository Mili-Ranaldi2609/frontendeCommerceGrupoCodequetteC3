import React, { useState } from "react";
import { useProducto } from "../../../hooks/useProduct";
import { ProductoCard } from "../../ProductCard/ProductCard";
import styles from "./Catalog.module.css";
import { NavBar } from "../Navbar/NavBar";
import { Footer } from "../Footer/Footer";
import { IoFilter } from "react-icons/io5";
import classNames from "classnames";

const Catalogo = () => {
  const { productos, loading, error } = useProducto();

  const [mostrarFiltro, setMostrarFiltro] = useState(true);
  const [filtroColor, setFiltroColor] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("");
  const [filtroTalle, setFiltroTalle] = useState("");

  const toggleFiltro = () => setMostrarFiltro(!mostrarFiltro);

  const productosFiltrados = productos.filter((producto) => {
    const cumpleColor = !filtroColor || producto.detalle.color === filtroColor;
    const cumpleTalle = !filtroTalle || producto.detalle.talle?.includes(filtroTalle);
    return cumpleColor && cumpleTalle;
  });

  const talles = ["XS", "S", "S/M", "M", "M/L", "L", "L/XL", "XL", "2XL"];
  const generos = ["Hombre", "Mujer", "Niño/a"];
  const colores = [
    { nombre: "Negro", color: "#000000" },
    { nombre: "Blanco", color: "#ffffff" },
    { nombre: "Amarillo", color: "#ffff00" },
    { nombre: "Azul", color: "#0000ff" },
    { nombre: "Rojo", color: "#ff0000" },
    { nombre: "Gris", color: "#808080" },
    { nombre: "Marron", color: "#8B4513" },
    { nombre: "Naranja", color: "#FFA500" },
    { nombre: "Violeta", color: "#800080" },
    { nombre: "Rosa", color: "#FFC0CB" },
    { nombre: "Celeste", color: "#87CEEB" },
    { nombre: "Verde", color: "#008000" },
    { nombre: "Beige", color: "#F5F5DC" },
    { nombre: "Morado", color: "#9370DB" },
    { nombre: "Multicolor", color: "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)" }
  ];

  return (
    <div className="appContainer">
      <div className={styles.catalogoContainer}>
        <div className={styles.tituloyfiltro}>
          <h1 className={styles.titulo}>Catálogo de Productos</h1>
          <a className={styles.filtro} onClick={toggleFiltro}>
            {mostrarFiltro ? "Ocultar Filtros" : "Mostrar Filtros"} <IoFilter />
          </a>
        </div>

        <div className={styles.catalogoLayout}>
          {mostrarFiltro && (
            <aside className={styles.filtroSidebar}>
              <div className={styles.filtroSeccion}>
                <h4>Categorías</h4>
                <p>Calzado</p>
                <p>Ropa</p>
              </div>

              <div className={styles.filtroSeccion}>
                <h4>Talle</h4>
                <div className={styles.gridBotones}>
                  {talles.map((talle) => (
                    <button
                      key={talle}
                      className={classNames(styles.botonFiltro, {
                        [styles.botonActivoTalle]: filtroTalle === talle,
                      })}
                      onClick={() =>
                        setFiltroTalle(filtroTalle === talle ? "" : talle)
                      }
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filtroSeccion}>
                <h4>Género</h4>
                <div className={styles.listaGenero}>
                  {generos.map((g) => (
                    <button
                      key={g}
                      className={classNames(styles.botonTexto, {
                        [styles.botonActivoGenero]: filtroGenero === g,
                      })}
                      onClick={() =>
                        setFiltroGenero(filtroGenero === g ? "" : g)
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filtroSeccion}>
                <h4>Color</h4>
                <div className={styles.gridColores}>
                  {colores.map(({ nombre, color }) => (
                    <div
                      key={nombre}
                      className={styles.colorItem}
                      onClick={() =>
                        setFiltroColor(filtroColor === nombre ? "" : nombre)
                      }
                    >
                      <div
                        className={classNames(styles.colorCirculo, {
                          [styles.colorActivo]: filtroColor === nombre,
                        })}
                        style={{
                          background: nombre === "Multicolor" ? "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)" : color,
                          border: filtroColor === nombre ? "2px solid #000" : "1px solid #ccc",
                        }}
                      ></div>
                      <span>{nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          )}

          <div
            className={`${styles.catalogo} ${mostrarFiltro ? styles.conFiltro : styles.sinFiltro
              }`}
          >
            {loading && <p className={styles.loading}>Cargando productos...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))
            ) : (
              <p className={styles.error}>No se encontraron productos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;



import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProducto } from "../../../hooks/useProduct";
import { ProductoCard } from "../../ProductCard/ProductCard";
import styles from "./Catalog.module.css";
import { IoFilter } from "react-icons/io5";
import classNames from "classnames";

const generoMap: Record<string, string> = {
  MUJER: "FEMENINO",
  HOMBRE: "MASCULINO",
  NIÑO: "UNISEX_CHILD",
  NIÑA: "UNISEX_CHILD",
  UNISEX: "UNISEX",
};

const talles = ["XS", "S", "S/M", "M", "M/L", "L", "L/XL", "XL", "2XL"];
const generos = ["FEMENINO", "MASCULINO", "UNISEX", "UNISEX_CHILD"];
const colores = [
  { nombre: "NEGRO", color: "#000000" },
  { nombre: "BLANCO", color: "#ffffff" },
  { nombre: "AMARILLO", color: "#ffff00" },
  { nombre: "AZUL", color: "#0000ff" },
  { nombre: "ROJO", color: "#ff0000" },
  { nombre: "GRIS", color: "#808080" },
  { nombre: "MARRON", color: "#8B4513" },
  { nombre: "NARANJA", color: "#FFA500" },
  { nombre: "VIOLETA", color: "#800080" },
  { nombre: "ROSA", color: "#FFC0CB" },
  { nombre: "CELESTE", color: "#87CEEB" },
  { nombre: "VERDE", color: "#008000" },
  { nombre: "BEIGE", color: "#F5F5DC" },
  { nombre: "MORADO", color: "#9370DB" },
  {
    nombre: "MULTICOLOR",
    color: "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
  },
];

const Catalogo = () => {
  const { genero } = useParams();
  const generoNormalizado = genero?.toUpperCase() || "";

  const { productos, loading, error } = useProducto();

  const [mostrarFiltro, setMostrarFiltro] = useState(true);
  const [filtros, setFiltros] = useState({ color: "", genero: "", talle: "" });

  useEffect(() => {
    setFiltros((prev) => ({
      ...prev,
      genero: generoMap[generoNormalizado] || "",
    }));
  }, [generoNormalizado]);

  const toggleFiltro = () => setMostrarFiltro((prev) => !prev);

  const toggleFiltroIndividual = (key: keyof typeof filtros, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: prev[key] === valor ? "" : valor,
    }));
  };

  const productosFiltrados = useMemo(() => {

    return productos.filter((producto) => {
      const cumpleColor = !filtros.color || producto.detalle?.some(d => d.color === filtros.color);
      const cumpleTalle = !filtros.talle || producto.detalle?.some(d => d.talle === filtros.talle);
      const cumpleGenero = !filtros.genero || producto.sexo === filtros.genero;
      return cumpleColor && cumpleTalle && cumpleGenero;
    });
  }, [productos, filtros]);

  return (
    <div className="appContainer">
      <div className={styles.catalogoContainer}>
        <div className={styles.tituloyfiltro}>
          <h1 className={styles.titulo}>Catálogo de Productos</h1>
          <button
            className={styles.filtro}
            onClick={toggleFiltro}
            aria-pressed={mostrarFiltro}
            aria-label="Mostrar u ocultar filtros"
            type="button"
          >
            {mostrarFiltro ? "Ocultar Filtros" : "Mostrar Filtros"} <IoFilter />
          </button>
        </div>

        <div className={styles.catalogoLayout}>
          {mostrarFiltro && (
            <aside className={styles.filtroSidebar}>
              {/* Filtro por talle */}
              <section className={styles.filtroSeccion}>
                <h4>Talle</h4>
                <div className={styles.gridBotones}>
                  {talles.map((talle) => (
                    <button
                      key={talle}
                      type="button"
                      className={classNames(styles.botonFiltro, {
                        [styles.botonActivoTalle]: filtros.talle === talle,
                      })}
                      onClick={() => toggleFiltroIndividual("talle", talle)}
                      aria-pressed={filtros.talle === talle}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </section>

              {/* Filtro por género */}
              <section className={styles.filtroSeccion}>
                <h4>Género</h4>
                <div className={styles.listaGenero}>
                  {generos.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={classNames(styles.botonTexto, {
                        [styles.botonActivoGenero]: filtros.genero === g,
                      })}
                      onClick={() => toggleFiltroIndividual("genero", g)}
                      aria-pressed={filtros.genero === g}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              {/* Filtro por color */}
              <div className={styles.Colorestitulo}>
                <h4>Colores</h4>
              </div>
              <section className={styles.filtrosColores} role="list">
                {colores.map(({ nombre, color }) => (
                  <div key={nombre} className={styles.colorFiltroWrapper}>
                    <div
                      className="checkbox-wrapper-12"
                      role="listitem"
                      onClick={() => toggleFiltroIndividual("color", nombre)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (["Enter", " "].includes(e.key)) {
                          e.preventDefault();
                          toggleFiltroIndividual("color", nombre);
                        }
                      }}
                      aria-pressed={filtros.color === nombre}
                      aria-label={`Filtrar por color ${nombre}`}
                      style={
                        {
                          "--circle-color": color,
                          "--splash-color": color,
                        } as React.CSSProperties
                      }
                    >
                      <div className="cbx">
                        <input
                          type="checkbox"
                          checked={filtros.color === nombre}
                          readOnly
                          tabIndex={-1}
                        />
                        <label />
                        {filtros.color === nombre && (
                          <svg viewBox="0 0 12 10" stroke="#fff" strokeWidth="1.5" fill="none">
                            <polyline points="1.5 6 4.5 9 10.5 1" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={styles.colorNombre}>{nombre}</span>
                  </div>

                ))}
              </section>
            </aside>
          )}

          <main
            className={classNames(styles.catalogo, {
              [styles.conFiltro]: mostrarFiltro,
              [styles.sinFiltro]: !mostrarFiltro,
            })}
          >
            {loading && <p className={styles.loading}>Cargando productos...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && productosFiltrados.length === 0 && (
              <p className={styles.error}>No se encontraron productos.</p>
            )}
            {!loading && !error &&
              productosFiltrados.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Catalogo;

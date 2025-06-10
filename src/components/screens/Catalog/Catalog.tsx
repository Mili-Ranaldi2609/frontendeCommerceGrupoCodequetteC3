import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducto } from "../../../hooks/useProduct";
import { ProductoCard } from "../../ui/ProductCard/ProductCard";
import styles from "./Catalog.module.css";
import { IoFilter } from "react-icons/io5";
import classNames from "classnames";
import { useOrdenesCompraDetalle } from "../../../hooks/useOrdenCompraDetalle";
import { MdOutlineFilterListOff } from "react-icons/md";
import type { IDetalle} from '../../../types/IDetalle';
import type { ICategoria } from '../../../types/ICategoria';

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
  { nombre: "NARANJA", "color": "#FFA500" },
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

type Filtros = {
  color: string;
  genero: string;
  talle: string;
  tipoProducto: string;
  precioMin: number;
  precioMax: number;
  categoria: string;
  subcategoria: string;
};

const Catalogo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { productos, loading, error } = useProducto();
  const { ordenesCompraDetalle } = useOrdenesCompraDetalle();

  const [mostrarFiltro, setMostrarFiltro] = useState(true);

  const [filtros, setFiltros] = useState<Filtros>(() => {
    const queryParams = new URLSearchParams(location.search);
    return {
      color: queryParams.get("color") || "",
      genero: queryParams.get("sexo") || "", 
      talle: queryParams.get("talle") || "",
      tipoProducto: queryParams.get("tipoProducto") || "",
      precioMin: queryParams.get("precioMin") ? Number(queryParams.get("precioMin")) : 0,
      precioMax: queryParams.get("precioMax") ? Number(queryParams.get("precioMax")) : 999999,
      categoria: queryParams.get("categoria") || "",
      subcategoria: queryParams.get("subcategoria") || "",
    };
  });

  const [orden, setOrden] = useState<"precioDesc" | "masVendidos" | "masNuevos" | "">(() => {
  const params = new URLSearchParams(location.search);
  const ordenFromUrl = params.get("orden");
  if (ordenFromUrl === "precioDesc" || ordenFromUrl === "masVendidos" || ordenFromUrl === "masNuevos") {
    return ordenFromUrl;
  }
  return "";
});

 useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  setFiltros({
    color: queryParams.get("color") || "",
    genero: queryParams.get("sexo") || "",
    talle: queryParams.get("talle") || "",
    tipoProducto: queryParams.get("tipoProducto") || "",
    precioMin: queryParams.get("precioMin") ? Number(queryParams.get("precioMin")) : 0,
    precioMax: queryParams.get("precioMax") ? Number(queryParams.get("precioMax")) : 999999,
    categoria: queryParams.get("categoria") || "",
    subcategoria: queryParams.get("subcategoria") || "",
  });

  const ordenFromUrl = queryParams.get("orden");
  if (ordenFromUrl === "precioDesc" || ordenFromUrl === "masVendidos" || ordenFromUrl === "masNuevos") {
    setOrden(ordenFromUrl);
  } else {
    setOrden("");
  }
}, [location.search]);


  const categoriasUnicas = useMemo(() => {
    const uniqueCategoriesMap = new Map<number, ICategoria>();

    productos.forEach(producto => {
      if (!producto.categorias || producto.categorias.length === 0) return;

      producto.categorias.forEach(prodCat => {
        if (typeof prodCat.id === 'undefined' || !prodCat.descripcion) {
          console.warn("Product category missing ID or description:", prodCat);
          return;
        }

        let existingCategory = uniqueCategoriesMap.get(prodCat.id);

        if (!existingCategory) {
          existingCategory = { ...prodCat, subcategorias: prodCat.subcategorias || [] };
          uniqueCategoriesMap.set(prodCat.id, existingCategory);
        }

        prodCat.subcategorias?.forEach(sub => {
          if (typeof sub.id === 'undefined' || !sub.descripcion) {
            console.warn("Product subcategory missing ID or description:", sub);
            return;
          }
          if (!existingCategory!.subcategorias) {
            existingCategory!.subcategorias = [];
          }
          if (!existingCategory!.subcategorias!.some(s => s.id === sub.id)) {
            existingCategory!.subcategorias!.push(sub);
          }
        });
      });
    });

    const sortedCategories = Array.from(uniqueCategoriesMap.values()).sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion)
    );

    sortedCategories.forEach(cat => {
      if (cat.subcategorias) {
        cat.subcategorias.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
      }
    });

    return sortedCategories;
  }, [productos]);

  const tiposUnicos = useMemo(() => {
    return Array.from(new Set(productos.map(p => p.tipoProducto).filter(Boolean)));
  }, [productos]);

  const conteoVentas = useMemo(() => {
    const map = new Map<number, number>();
    ordenesCompraDetalle.forEach((detalle) => {
      const productoId = detalle.detalle?.producto?.id;
      const cantidad = detalle.cantidad || 0;
      if (typeof productoId === 'number' && productoId > 0) {
        map.set(productoId, (map.get(productoId) || 0) + cantidad);
      }
    });
    return map;
  }, [ordenesCompraDetalle]);

  const toggleFiltro = useCallback(() => setMostrarFiltro((prev) => !prev), []);

  const toggleFiltroIndividual = useCallback(
    (key: keyof Filtros, valor: string) => {
      setFiltros((prev) => ({
        ...prev,
        [key]: prev[key] === valor ? "" : valor,
      }));
    },
    []
  );

  const handlePrecioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "precioMin" ? 0 : 999999) : Number(value),
    }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      color: "",
      genero: "",
      talle: "",
      tipoProducto: "",
      precioMin: 0,
      precioMax: 999999,
      categoria: "",
      subcategoria: "",
    });
    setOrden("");
    navigate("/catalogo", { replace: true });
  }, [navigate]);

  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((producto) => {
      if (producto.active === false) {
        return false;
      }
      const precioProducto = producto.detalle?.[0]?.precioVenta || 0;

      const hasMatchingDetail = (
        predicate: (detail: IDetalle) => boolean
      ) => producto.detalle?.some(predicate) ?? false;

      const cumpleColor = !filtros.color || hasMatchingDetail(d => d.color?.toLowerCase() === filtros.color.toLowerCase());
      const cumpleTalle = !filtros.talle || hasMatchingDetail(d => d.talle?.toLowerCase() === filtros.talle.toLowerCase());

      const generoProductoNormalizado = generoMap[producto.sexo.toUpperCase()] || producto.sexo.toUpperCase();
      const cumpleGenero = !filtros.genero || generoProductoNormalizado === filtros.genero.toUpperCase();

      const cumpleTipo = !filtros.tipoProducto || producto.tipoProducto?.toLowerCase() === filtros.tipoProducto.toLowerCase();
      const cumplePrecioMin = filtros.precioMin === 0 || precioProducto >= filtros.precioMin;
      const cumplePrecioMax = filtros.precioMax === 999999 || precioProducto <= filtros.precioMax;

      const cumpleCategoria = !filtros.categoria ||
        producto.categorias?.some(cat => 
          cat.descripcion?.toLowerCase().trim() === filtros.categoria.toLowerCase().trim()
        );

      const cumpleSubcategoria = !filtros.subcategoria ||
        producto.categorias?.some(cat => 
          cat.subcategorias?.some(sub =>
            sub.descripcion?.toLowerCase().trim() === filtros.subcategoria.toLowerCase().trim()
          )
        );

      return (
        cumpleColor &&
        cumpleTalle &&
        cumpleGenero &&
        cumpleTipo &&
        cumplePrecioMin &&
        cumplePrecioMax &&
        cumpleCategoria &&
        cumpleSubcategoria
      );
    });

    switch (orden) {
      case "precioDesc":
        resultado.sort((a, b) => {
          const precioA = a.detalle?.[0]?.precioVenta || 0;
          const precioB = b.detalle?.[0]?.precioVenta || 0;
          return precioB - precioA;
        });
        break;
      case "masVendidos":
        resultado.sort((a, b) => {
          const vendidosA = conteoVentas.get(a.id) || 0;
          const vendidosB = conteoVentas.get(b.id) || 0;
          return vendidosB - vendidosA;
        });
        break;
      case "masNuevos":
        resultado.sort((a, b) => {
          return (b.id || 0) - (a.id || 0);
        });
        break;
      default:
        break;
    }

    return resultado;
  }, [productos, filtros, orden, conteoVentas, generoMap]);

  return (
    <div className="appContainer">
      <div className={styles.catalogoContainer}>
        <div className={styles.tituloyfiltro}>
          <h1 className={styles.titulo}>Catálogo de Productos</h1>
          <div className={styles.currentUrlFilters}>
            {Object.entries(filtros).map(([key, value]) => {
              if (value && key !== "precioMin" && key !== "precioMax") {
                const displayKey = key === "genero" ? "Género" : key.charAt(0).toUpperCase() + key.slice(1);
                return <span key={key} className={styles.filterTag}>{displayKey}: {value}</span>;
              }
              return null;
            })}
            {(filtros.precioMin > 0 || filtros.precioMax < 999999) && (
              <span className={styles.filterTag}>Precio: ${filtros.precioMin} - ${filtros.precioMax === 999999 ? 'Max' : filtros.precioMax}</span>
            )}
            {orden && <span className={styles.filterTag}>Orden: {orden === "precioDesc" ? "Precio: Mayor a Menor" : orden === "masVendidos" ? "Más Vendidos" : orden === "masNuevos" ? "Más Nuevos" : orden}</span>}
          </div>

          <div className={styles.topControls}>
            <button
              className={styles.filtroButton}
              onClick={toggleFiltro}
              aria-pressed={mostrarFiltro}
              aria-label={mostrarFiltro ? "Ocultar filtros" : "Mostrar filtros"}
              type="button"
            >
              {mostrarFiltro ? "Ocultar Filtros" : "Mostrar Filtros"} <IoFilter />
            </button>
            <button onClick={limpiarFiltros} className={styles.limpiarFiltrosBtn}>
              Limpiar Filtros <MdOutlineFilterListOff />
            </button>
            <div className={styles.ordenamiento}>
              <label htmlFor="ordenarPor">Ordenar por:</label>
              <select
                id="ordenarPor"
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className={styles.selectOrden}
              >
                <option value="">Relevancia</option>
                <option value="precioDesc">Precio: Mayor a Menor</option>
                <option value="masVendidos">Más Vendidos</option>
                <option value="masNuevos">Más Nuevos</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.catalogoLayout}>
          {mostrarFiltro && (
            <aside className={styles.filtroSidebar} aria-label="Filtros de productos">
              <section className={styles.filtroSeccion}>
                <h4>Precio</h4>
                <div className={styles.precioInputGroup}>
                  <label htmlFor="precioMin">Mínimo:</label>
                  <input
                    type="number"
                    id="precioMin"
                    name="precioMin"
                    value={filtros.precioMin === 0 ? "" : filtros.precioMin}
                    onChange={handlePrecioChange}
                    className={styles.precioInput}
                    min="0"
                    placeholder="0"
                    aria-label="Precio mínimo"
                  />
                </div>
                <div className={styles.precioInputGroup}>
                  <label htmlFor="precioMax">Máximo:</label>
                  <input
                    type="number"
                    id="precioMax"
                    name="precioMax"
                    value={filtros.precioMax === 999999 ? "" : filtros.precioMax}
                    onChange={handlePrecioChange}
                    className={styles.precioInput}
                    min="0"
                    placeholder="999999"
                    aria-label="Precio máximo"
                  />
                </div>
              </section>

              <section className={styles.filtroSeccion}>
                <h4>Tipo de Producto</h4>
                <div className={styles.listaTipoProducto} role="group" aria-label="Filtrar por tipo de producto">
                  {tiposUnicos.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      className={classNames(styles.botonTexto, {
                        [styles.botonActivoGenero]: filtros.tipoProducto === tipo,
                      })}
                      onClick={() => toggleFiltroIndividual("tipoProducto", tipo)}
                      aria-pressed={filtros.tipoProducto === tipo}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.filtroSeccion}>
                <h4>Talle</h4>
                <div className={styles.gridBotones} role="group" aria-label="Filtrar por talle">
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

              <section className={styles.filtroSeccion}>
                <h4>Género</h4>
                <div className={styles.listaGenero} role="group" aria-label="Filtrar por género">
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

              <section className={styles.filtroSeccion}>
                <h4>Colores</h4>
                <div className={styles.filtrosColores} role="list">
                  {colores.map(({ nombre, color }) => (
                    <div key={nombre} className={styles.colorFiltroWrapper}>
                      <div
                        className="checkbox-wrapper-12"
                        role="listitem"
                        onClick={() => toggleFiltroIndividual("color", nombre)}
                        onKeyDown={(e) => {
                          if (["Enter", " "].includes(e.key)) {
                            e.preventDefault();
                            toggleFiltroIndividual("color", nombre);
                          }
                        }}
                        tabIndex={0}
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
                </div>
              </section>

              {/* Categoría y Subcategoría */}
              {categoriasUnicas.length > 0 && (
                <section className={styles.filtroSeccion}>
                  <h4>Categorías</h4>
                  <div className={styles.categoryList} role="group" aria-label="Filtrar por categoría">
                    {categoriasUnicas.map(cat => (
                      <div key={cat.id} className={styles.categoryFilterGroup}>
                        <button
                          type="button"
                          className={classNames(styles.botonTexto, {
                            [styles.botonActivoGenero]: filtros.categoria === cat.descripcion,
                          })}
                          onClick={() => toggleFiltroIndividual("categoria", cat.descripcion)}
                          aria-pressed={filtros.categoria === cat.descripcion}
                        >
                          {cat.descripcion}
                        </button>
                        {filtros.categoria === cat.descripcion && cat.subcategorias && cat.subcategorias.length > 0 && (
                          <div className={styles.subCategoryList} role="group" aria-label={`Subcategorías de ${cat.descripcion}`}>
                            {cat.subcategorias.map(sub => (
                              <button
                                key={sub.id}
                                type="button"
                                className={classNames(styles.botonSubCategoria, {
                                  [styles.botonActivoSubCategoria]: filtros.subcategoria === sub.descripcion,
                                })}
                                onClick={() => toggleFiltroIndividual("subcategoria", sub.descripcion)}
                                aria-pressed={filtros.subcategoria === sub.descripcion}
                              >
                                {sub.descripcion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          )}

          <main
            className={classNames(styles.catalogo, {
              [styles.conFiltro]: mostrarFiltro,
              [styles.sinFiltro]: !mostrarFiltro,
            })}
            aria-live="polite"
          >
            {loading && <p className={styles.loading}>Cargando productos...</p>}
            {error && <p className={styles.error}>{error.message}</p>}
            {!loading && !error && productosFiltrados.length === 0 && (
              <p className={styles.noResults}>No se encontraron productos que coincidan con los filtros aplicados.</p>
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
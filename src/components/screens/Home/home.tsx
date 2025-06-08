import React, { useCallback } from "react"; // Importa React y useCallback
import { Carousel } from "../../ui/Carousel/Carousel";
import style from "./home.module.css";
import { ProductoCard } from "../../ui/ProductCard/ProductCard";
import { useProducto } from "../../../hooks/useProduct"; // Asegúrate de que useProducto sea un hook robusto
import hombre from "../../../assets/hombre.png";
import mujer from "../../../assets/mujer.jpg";
import niño from "../../../assets/niños.png";
import futbol from "../../../assets/futbol.png";
import basquet from "../../../assets/basquet.png";
import training from "../../../assets/trainig.png";
import diario from "../../../assets/diario.png";
import ropa from "../../../assets/ropa.png";
import imagePrincipal from "../../../assets/imagePrincipal.jpeg";
import { useNavigate } from "react-router-dom";
import type { Producto } from "../../../types/IProduct";
// --- Definiciones de Tipos (Recomendado para TypeScript) ---
interface SportCategory {
  title: string;
  image: string;
}

interface CategoryCardProps {
  title: string;
  image: string;
  path: string;
  onNavigate: (path: string) => void;
}

// --- Datos de Categorías Deportivas ---
const sportsCategories: SportCategory[] = [
  { title: "Fútbol", image: futbol },
  { title: "Diario", image: diario },
  { title: "Básquet", image: basquet },
  { title: "Training", image: training },
  { title: "Ropa", image: ropa },
];

// --- Componente CategoryCard ---
// Usamos React.FC para tipar el componente funcional
const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  image,
  path,
  onNavigate,
}) => (
  <div
    className={style.categoryCard}
    onClick={() => onNavigate(path)}
    style={{ cursor: "pointer" }}
  >
    <button className={style.categoryButton}>{`Para ${title}`}</button>
    <img src={image} alt={title} />
  </div>
);

// --- Componente Home Principal ---
export const Home: React.FC = () => {
  const { productos, loading, error } = useProducto();
  console.log("Productos en Home:", productos)
  const navigate = useNavigate();

  // Optimizamos handleNavigate con useCallback para evitar re-creación innecesaria
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  // Filtramos y ordenamos los productos solo si 'productos' es un array
  const productosMasNuevos: Producto[] = Array.isArray(productos)
    ? [...productos].sort((a, b) => b.id - a.id).slice(0, 12)
    : [];

  return (
    <>
      <div className={style.homeMainContainer}>
        <div className={style.homeImagePrincipal}>
          <img src={imagePrincipal} alt="Imagen principal tienda" />
        </div>

        {/* Sección de Catálogo */}
        <div
          className={style.homeDiscountContainer}
          onClick={() => handleNavigate("/catalogo")}
          style={{ cursor: "pointer" }}
        >
          <h3>Ver catálogo</h3>
        </div>

        {/* Manejo de estados de carga y error para productos */}
        {loading && <div className={style.loading}>Cargando productos...</div>}
        {error && (
          <div className={style.error}>
            Error al cargar productos: {error.message || "Error desconocido"}
          </div>
        )}

        {/* Carrusel de productos más nuevos */}
{!loading && !error && productosMasNuevos.length > 0 && (
  <>
    <h2 className={style.carouselTitle}>Novedades</h2>
    <Carousel<Producto>
      toList={productosMasNuevos}
      renderItem={(producto) => (
        <div className={style.carouselCard} key={producto.id}>
          <ProductoCard producto={producto} />
        </div>
      )}
    />
  </>
)}
        {/* Carrusel de categorías deportivas */}
        <h2 className={style.carouselTitle}>Explora por Deporte</h2>
        <Carousel<SportCategory>
          toList={sportsCategories}
          renderItem={(item) => (
            <div className={style.carouselCard} key={item.title}>
              <img src={item.image} alt={item.title} />
              <p>{item.title}</p>
            </div>
          )}
        />
      </div>

      {/* Tarjetas de categorías principales (Hombre, Mujer, Niños) */}
      <div className={style.categoryCardsContainer}>
        <CategoryCard
          title="Hombre"
          image={hombre}
          path="/catalogo/hombre"
          onNavigate={handleNavigate}
        />
        <CategoryCard
          title="Mujer"
          image={mujer}
          path="/catalogo/mujer"
          onNavigate={handleNavigate}
        />
        <CategoryCard
          title="Niños"
          image={niño}
          path="/catalogo/ninos"
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
};
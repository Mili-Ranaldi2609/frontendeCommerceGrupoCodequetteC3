import React, { useCallback, useEffect, useState } from "react";
import { Carousel } from "../../ui/Carousel/Carousel";
import style from "./home.module.css";
import { ProductoCard } from "../../ui/ProductCard/ProductCard";
import { useProducto } from "../../../hooks/useProduct";
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

// --- Type Definitions ---
interface SportCategory {
  title: string;
  image: string;
  path: string;
}

interface CategoryCardProps {
  title: string;
  image: string;
  path: string;
  onNavigate: (path: string) => void;
  // Añadimos una prop className opcional para estilos adicionales
  className?: string;
}

// --- Sport Categories Data ---
const sportsCategories: SportCategory[] = [
  { title: "Fútbol", image: futbol, path: "/catalogo?categoria=Futbol" },
  { title: "Diario", image: diario, path: "/catalogo?categoria=diario" },
  { title: "Básquet", image: basquet, path: "/catalogo?categoria=basquet" },
  { title: "Running", image: training, path: "/catalogo?categoria=running" },
  { title: "Ropa", image: ropa, path: "/catalogo?tipoProducto=ropa" }, 
];

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  image,
  path,
  onNavigate,
  className, // Recibimos la prop className
}) => (
  <div
    // Usamos la prop className junto con la clase existente
    className={`${style.categoryCard} ${className || ''}`}
    onClick={() => onNavigate(path)}
    style={{ cursor: "pointer" }}
  >
    <button className={style.categoryButton}>{title}</button>
    <img src={image} alt={title} />
  </div>
);

// --- Main Home Component ---
export const Home: React.FC = () => {
  const { productos, loading, error } = useProducto();
  console.log("Productos en Home:", productos);
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const productosMasNuevos: Producto[] = Array.isArray(productos)
    ? [...productos].sort((a, b) => b.id - a.id).slice(0, 12)
    : [];

  return (
    <>
      <div className={style.homeMainContainer}>
        <div className={style.homeImagePrincipal}>
          <img src={imagePrincipal} alt="Main store image" />
        </div>

        <div
          className={style.homeDiscountContainer}
          onClick={() => handleNavigate("/catalogo")}
          style={{ cursor: "pointer" }}
        >
          <h3>Ver catálogo</h3>
        </div>

        {loading && <div className={style.loading}>Cargando productos...</div>}
        {error && (
          <div className={style.error}>
            Error al cargar productos: {error.message || "Error desconocido"}
          </div>
        )}

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

        {/* Carousel of sport categories */}
        <h2 className={style.carouselTitle}>Explora por Deporte</h2>
        <Carousel<SportCategory>
          toList={sportsCategories}
          renderItem={(item) => (
            <div className={style.carouselCard} key={item.title}>
              <CategoryCard
                title={item.title}
                image={item.image}
                path={item.path}
                onNavigate={handleNavigate}
                // Pasamos la nueva clase específica para las tarjetas de deporte en el carrusel
                className={style.sportCategoryCarouselCard}
              />
            </div>
          )}
        />
      </div>

      {/* Main category cards (Hombre, Mujer, Niños) - Estos usan solo .categoryCard */}
      <div className={style.categoryCardsContainer}>
        <CategoryCard
          title="Hombre"
          image={hombre}
          path="/catalogo?sexo=MASCULINO"
          onNavigate={handleNavigate}
        />
        <CategoryCard
          title="Mujer"
          image={mujer}
          path="/catalogo?sexo=FEMENINO"
          onNavigate={handleNavigate}
        />
        <CategoryCard
          title="Niños"
          image={niño}
          path="/catalogo?sexo=UNISEX_CHILD"
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
};
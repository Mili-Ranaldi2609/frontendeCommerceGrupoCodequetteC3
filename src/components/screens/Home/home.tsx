import { Carousel } from "../Carousel/Carousel";
import style from "./home.module.css";
import { ProductoCard } from "../../ProductCard/ProductCard";
import { useProducto } from "../../../hooks/useProduct";
import zapatillasejemplo1 from "../../../assets/zapatillasejemplo1.jpeg";
import zapatillasejemplo2 from "../../../assets/zapatillasejemplo2.jpeg";
import zapatillasejemplo3 from "../../../assets/zapatillasejemplo3.jpeg";
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

const sportsCategories = [
  { title: "Fútbol", image: futbol },
  { title: "Diario", image: diario },
  { title: "Básquet", image: basquet },
  { title: "Training", image: training },
  { title: "Ropa", image: ropa }
];

export const Home = () => {
  const { productos, loading, error } = useProducto();
  const navigate = useNavigate();

  const irAlCatalogo = () => {
    navigate("/catalogo"); // Ruta que apunta al catálogo
  };
  return (
    <>
      <div className={style.homeMainContainer}>
        <div className={style.homeImagePrincipal}>
          <img src={imagePrincipal} alt="Imagen principal tienda" />
        </div>
        <div onClick={irAlCatalogo} className={style.homeDiscountContainer} style={{ cursor: "pointer" }}>
          <h3>Ver catalogo</h3>
        </div>

        <div className={style.homeMainImageContainer}>
          {loading && <div className={style.loading}>Cargando productos...</div>}
          {error && <div className={style.error}>Error al cargar productos: {error}</div>}
          {Array.isArray(productos) && productos.map((producto) => (
            <div key={producto.id} className={style.homeImageContainer}>
              <ProductoCard
                producto={{
                  id: producto.id,
                  denominacion: producto.denominacion,
                  precioOriginal: producto.precioOriginal,
                  precioFinal: producto.precioFinal,
                  imagenes: [producto.imagenes?.[0]],
                  sexo: producto.sexo,
                  tienePromocion: producto.tienePromocion,
                  categorias: producto.categorias,
                  detalle: producto.detalle,
                }}
              />
            </div>
          ))}
        </div>
        <Carousel
          toList={sportsCategories}
          renderItem={(item) => (
            <div className={style.carouselCard}>
              <img src={item.image} alt={item.title} />
              <p>{item.title}</p>
            </div>
          )}
        />
      </div>
      <div className={style.categoryCardsContainer}>
        {/* Hombre */}
        <div className={style.categoryCard} onClick={() => navigate("/catalogo/hombre")}>
          <button className={style.categoryButton}>Para Hombre</button>
          <img src={hombre} alt="Hombre" />
        </div>

        {/* Mujer */}
        <div className={style.categoryCard} onClick={() => navigate("/catalogo/mujer")}>
          <button className={style.categoryButton}>Para Mujer</button>
          <img src={mujer} alt="Mujer" />
        </div>

        {/* Niños */}
        <div className={style.categoryCard} onClick={() => navigate("/catalogo/ninos")}>
          <button className={style.categoryButton}>Para Niños</button>
          <img src={niño} alt="Niños" />
        </div>
      </div>
    </>
  );
};


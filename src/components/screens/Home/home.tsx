import { Carousel } from "../Carousel/Carousel";
import { Footer } from "../Footer/Footer";
import { NavBar } from "../Navbar/NavBar";
import style from "./home.module.css";
import { ProductoCard } from "../../ProductCard/ProductCard";
import { useProducto } from "../../../hooks/useProduct";
import zapatillasejemplo1 from "../../../assets/zapatillasejemplo1.jpeg";
import zapatillasejemplo2 from "../../../assets/zapatillasejemplo2.jpeg";
import zapatillasejemplo3 from "../../../assets/zapatillasejemplo3.jpeg";

import imagePrincipal from "../../../assets/imagePrincipal.jpeg";
import { useNavigate } from "react-router-dom";
// Lista de ejemplo para productos que aparecerán en el carousel
const exampleList = [
  {
    image: zapatillasejemplo1,
    // Ruta de la imagen del producto
    title: "Nike Dunk Low",
    description: "Zapatillas de moda para mujeres",
    price: "$199.999"
  },
  {
    image: zapatillasejemplo2, // Ruta de la imagen del producto
    title: "Nike Air Force 1",
    description: "Zapatillas de moda para hombres",
    price: "$199.999"
  },
  {
    image: zapatillasejemplo3, // Ruta de la imagen del producto
    title: "Air Jordan 1",
    description: "Zapatillas Jordan para hombres",
    price: "$229.999"
  }
];

export const Home = () => {
  const { productos, loading, error } = useProducto();
  const navigate = useNavigate();

  const irAlCatalogo = () => {
    navigate("/catalogo"); // Ruta que apunta al catálogo
  };
  return (
    <>
      <NavBar />
      <div className={style.homeMainContainer}>
        <div className={style.homeImagePrincipal}>
          <img src={imagePrincipal} alt="Imagen principal tienda" />
        </div>
        <div onClick={irAlCatalogo} className={style.homeDiscountContainer} style={{ cursor: "pointer" }}>
          <h3>Descuentos Especiales</h3>
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
                  precioVenta: producto.precioVenta,
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

        <h2 style={{ paddingLeft: "1rem" }}>Descubrí lo nuevo</h2>
        <Carousel toList={exampleList} />
      </div>
      <Footer />
    </>
  );
};


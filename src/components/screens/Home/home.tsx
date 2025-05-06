
import { Carousel } from "../Carousel/Carousel";
import { Footer } from "../Footer/Footer";
import { NavBar } from "../Navbar/NavBar";
import style from "./home.module.css";
import zapatillasejemplo1 from "../../../assets/zapatillasejemplo1.jpeg";
import zapatillasejemplo2 from "../../../assets/zapatillasejemplo2.jpeg";
import zapatillasejemplo3 from "../../../assets/zapatillasejemplo3.jpeg";

import imagePrincipal from "../../../assets/imagePrincipal.jpeg";
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
  return (
    <div className={style.homeMainContainer}>
      <NavBar />
      <div className={style.homeImagePrincipal}>
          <img src={imagePrincipal} alt="Imagen principal tienda" />
        </div>
      <div className={style.homeDiscountContainer}>
        <h3>Descuentos Especiales</h3>
      </div>

      <div className={style.homeMainImageContainer}>
        <div className={style.homeImageContainer}><img src="path_to_image1.jpg" alt="Product 1" /></div>
        <div className={style.homeImageContainer}><img src="path_to_image2.jpg" alt="Product 2" /></div>
      </div>


      <h2 style={{ paddingLeft: "1rem" }}>Descubri lo nuevo</h2>
      <Carousel  toList={exampleList} />
      <Footer />
    </div>
  );
};

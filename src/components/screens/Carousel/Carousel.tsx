import { useState } from "react";
import style from "./carousel.module.css";

interface Product {
  image: string;
  title: string;
  description: string;
  price: string;
}

interface CarouselProps {
  toList: Product[];
}

export const Carousel = ({ toList }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const nextIndex = currentIndex + 4;
    setCurrentIndex(nextIndex >= toList.length ? 0 : nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentIndex - 4;
    setCurrentIndex(prevIndex < 0 ? Math.max(toList.length - 4, 0) : prevIndex);
  };

  const visibleProducts = toList.slice(currentIndex, currentIndex + 4);

  return (
    <div className={style.carouselContainer}>
      <div className={style.carouselContent}>
        {visibleProducts.map((product, index) => (
          <div key={index} className={style.carouselItem}>
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>{product.price}</p>
          </div>
        ))}
      </div>

      <button className={style.prevBtn} onClick={prevSlide}>{"<"}</button>
      <button className={style.nextBtn} onClick={nextSlide}>{">"}</button>
    </div>
  );
};


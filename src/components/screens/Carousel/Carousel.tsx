import { useEffect, useState } from "react";
import styles from "./carousel.module.css";

interface CarouselProps<T> {
  toList: T[];
  renderItem: (item: T) => React.ReactNode;
}

export const Carousel = <T,>({ toList, renderItem }: CarouselProps<T>) => {
  const visibleCount = 4;
  const totalItems = toList.length;

  const [currentIndex, setCurrentIndex] = useState(visibleCount);
  const [isTransitioning, setIsTransitioning] = useState(false); // Estado para controlar la transición

  // Crear lista con clones (últimos y primeros ítems)
  const extendedList = [
    ...toList.slice(-visibleCount),
    ...toList,
    ...toList.slice(0, visibleCount),
  ];

  const nextSlide = () => {
    setIsTransitioning(true); // Habilitar la transición
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true); // Habilitar la transición
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (currentIndex === totalItems + visibleCount) {
      // Fin falso, ir al inicio real
      setTimeout(() => {
        setCurrentIndex(visibleCount); // Salta al índice real
        setIsTransitioning(false); // Deshabilitar la transición
      }, 500); // Duración de la transición (tiempo suficiente para que la animación se complete)
    }

    if (currentIndex === 0) {
      // Inicio falso, ir al final real
      setTimeout(() => {
        setCurrentIndex(totalItems);
        setIsTransitioning(false); // Deshabilitar la transición
      }, 100); // Duración de la transición (tiempo suficiente para que la animación se complete)
    }
  }, [currentIndex, totalItems, visibleCount]);

  const trackStyle = {
    transform: `translateX(-${(100 / visibleCount) * currentIndex}%)`,
    transition: isTransitioning ? "transform 0.5s ease" : "none", // Aplicar la transición solo cuando estamos cambiando
  };

  return (
    <div className={styles.carouselContainer}>
      <button className={styles.prevBtn} onClick={prevSlide}>{"<"}</button>

      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={trackStyle}
        >
          {extendedList.map((item, index) => (
            <div key={index} className={styles.carouselItem}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      <button className={styles.nextBtn} onClick={nextSlide}>{">"}</button>
    </div>
  );
};

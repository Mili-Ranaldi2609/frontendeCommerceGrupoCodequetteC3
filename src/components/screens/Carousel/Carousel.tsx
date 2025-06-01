import { useEffect, useState } from "react";
import styles from "./carousel.module.css";

interface CarouselProps<T> {
  toList: T[];
  renderItem: (item: T) => React.ReactNode;
}

export const Carousel = <T,>({ toList, renderItem }: CarouselProps<T>) => {
  const defaultVisibleCount = 4;
  const visibleCount = Math.min(defaultVisibleCount, toList.length);
  const totalItems = toList.length;

  const [currentIndex, setCurrentIndex] = useState(visibleCount);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const hasScroll = totalItems > visibleCount;

  // Extiende la lista solo si hay suficientes elementos
  const extendedList = hasScroll
    ? [
        ...toList.slice(-visibleCount),
        ...toList,
        ...toList.slice(0, visibleCount),
      ]
    : toList;

  const nextSlide = () => {
    if (!hasScroll) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (!hasScroll) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (!hasScroll) return;

    if (currentIndex === totalItems + visibleCount) {
      setTimeout(() => {
        setCurrentIndex(visibleCount);
        setIsTransitioning(false);
      }, 500);
    }

    if (currentIndex === 0) {
      setTimeout(() => {
        setCurrentIndex(totalItems);
        setIsTransitioning(false);
      }, 10);
    }
  }, [currentIndex, totalItems, visibleCount, hasScroll]);

  const trackStyle = {
    transform: `translateX(-${(100 / visibleCount) * currentIndex}%)`,
    transition: isTransitioning ? "transform 0.5s ease" : "none",
    width: hasScroll ? "auto" : "100%",
  };

  return (
    <div className={styles.carouselContainer}>
      {hasScroll && (
        <button className={styles.prevBtn} onClick={prevSlide}>
          {"<"}
        </button>
      )}

      <div className={styles.carouselViewport}>
        <div className={styles.carouselTrack} style={trackStyle}>
          {extendedList.map((item, index) => (
            <div key={index} className={styles.carouselItem}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      {hasScroll && (
        <button className={styles.nextBtn} onClick={nextSlide}>
          {">"}
        </button>
      )}
    </div>
  );
};

import { useEffect, useState, useRef } from "react";
import styles from "./carousel.module.css";

interface CarouselProps<T> {
  toList: T[];
  renderItem: (item: T) => React.ReactNode;
}

export const Carousel = <T,>({ toList, renderItem }: CarouselProps<T>) => {
  const defaultVisibleCount = 4;
  const visibleCount = Math.min(defaultVisibleCount, toList.length);
  const totalItems = toList.length;

  // KEY CHANGE 1: Initialize currentIndex differently based on hasScroll
  const hasScroll = totalItems > visibleCount;
  const [currentIndex, setCurrentIndex] = useState(hasScroll ? visibleCount : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTimeoutRef = useRef<number | null>(null);

  const extendedList = hasScroll
    ? [
        ...toList.slice(-visibleCount),
        ...toList,
        ...toList.slice(0, visibleCount),
      ]
    : toList; // If no scroll, extendedList is just the original list

  const nextSlide = () => {
    if (!hasScroll || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (!hasScroll || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasScroll) return; // This useEffect only applies if scrolling is enabled

    const handleTransitionEnd = () => {
      setIsTransitioning(false);
      // Only adjust currentIndex for looping if we're at the ends of the extended list
      if (currentIndex >= totalItems + visibleCount) {
        setCurrentIndex(visibleCount);
      } else if (currentIndex <= 0) {
        setCurrentIndex(totalItems);
      }
    };

    const carouselTrack = document.querySelector(`.${styles.carouselTrack}`);
    if (carouselTrack) {
      carouselTrack.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (carouselTrack) {
        carouselTrack.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [currentIndex, totalItems, visibleCount, hasScroll]);

  // KEY CHANGE 2: Conditionally apply transform based on hasScroll
  const trackStyle = {
    transform: hasScroll
      ? `translateX(-${(100 / visibleCount) * currentIndex}%)`
      : `translateX(0%)`, // No translation if no scroll
    transition: isTransitioning ? "transform 0.5s ease" : "none",
    width: hasScroll ? "auto" : "100%", // Maintain 100% width for non-scrolling carousels
  };

  return (
    <div className={styles.carouselContainer}>
      {/* Buttons only appear if hasScroll is true */}
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
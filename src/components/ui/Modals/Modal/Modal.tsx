import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode; 
}

export const Modal = ({ show, onClose, title, children, actions }: ModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
        <div className={styles.modalActions}>
          {actions} 
          <button onClick={onClose} className={styles.secondaryButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};


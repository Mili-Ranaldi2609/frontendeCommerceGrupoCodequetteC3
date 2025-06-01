import styles from './Modal.module.css';

interface ModalProps {
  show: boolean;
  title?: string;
  children?: React.ReactNode;
  content?: React.ReactNode | string;
  onClose: () => void;
}

export const Modal = ({ show, title, children, content, onClose }: ModalProps) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {title && <h2>{title}</h2>}
        {children ? children : <p>{content}</p>}
        <div className={styles.actions}>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};


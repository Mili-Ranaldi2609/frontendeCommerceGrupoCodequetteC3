import styles from "./Modal.module.css";

interface ModalProps {
  show: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export const Modal = ({ show, title, content, onClose }: ModalProps) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{content}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

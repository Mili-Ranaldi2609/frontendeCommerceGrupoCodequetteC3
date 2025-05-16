import { Modal } from "./Modal";

export const EnviosModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Envíos y entregas"
      content="Información sobre tiempos y métodos de entrega."
      onClose={onClose}
    />
  );
};

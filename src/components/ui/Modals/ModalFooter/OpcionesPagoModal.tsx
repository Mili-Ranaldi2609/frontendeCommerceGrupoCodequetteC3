import { Modal } from "../Modal/Modal";

export const OpcionesPagoModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Opciones de pago"
      onClose={onClose}
    >
      <p>Aceptamos tarjetas de crédito, débito y otros métodos de pago online </p>
    </Modal>
  );
};
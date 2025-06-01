import { Modal } from "../Modal/Modal";

export const OpcionesPagoModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Opciones de pago"
      content="Aceptamos tarjetas de crédito, débito y otros métodos de pago online"
      onClose={onClose}
    />
  );
};

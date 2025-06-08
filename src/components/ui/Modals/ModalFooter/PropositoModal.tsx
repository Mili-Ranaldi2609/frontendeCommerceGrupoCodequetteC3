import { Modal } from "../Modal/Modal";

export const PropositoModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Propósito"
      onClose={onClose}
    >
      <p>Urban Vibes busca conectar a las personas con la moda urbana más auténtica y responsable.</p>
    </Modal>
  );
};

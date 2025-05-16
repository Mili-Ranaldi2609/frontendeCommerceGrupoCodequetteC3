import { Modal } from "./Modal";

export const PropositoModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Propósito"
      content="Urban Vibes busca conectar a las personas con la moda urbana más auténtica y responsable."
      onClose={onClose}
    />
  );
};

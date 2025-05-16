import { Modal } from "./Modal";

export const ContactoModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <Modal
      show={show}
      title="Contacto"
      content={<div>
      <h3>¿EN QUÉ PODEMOS AYUDARTE?</h3>
      <p>Te podés comunicar con nosotros de Lunes a Domingo de 9 a 21hrs</p>
      <p>Escribinos por Whatsapp al +54 9 11 2799-6935.</p>
      <p>También podés llamarnos al +541151686098.</p>
      <p>Si querés mandar un mail hacé click acá.</p>
      </div> }
      onClose={onClose}
    />
  );
};

import { Modal } from "./Modal";

export const PromocionesModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
    return (
        <Modal
            show={show}
            title="Promociones"
            content={
                <div>
                  <h4>ENVÍO GRATIS</h4>
                  <p>Hacemos envíos a todo el país, excepto a las provincias de Misiones y Tierra del Fuego.</p>
                  <p>¡Si tu compra es mayor a $255.000 el envío es Gratis! (Aplica para los envíos Estándar)</p>
              
                  <h4>PROMOCIONES BANCARIAS</h4>
                  <ul>
                    <li>2, 3 y 6 cuotas sin interés con todas las tarjetas de crédito bancarias.</li>
                    <li>1 y 3 cuotas sin interés con Mercado Pago sin tarjeta con 25% de descuento y tope de reintegro $8.000.</li>
                    <li>2, 3, 4, 5 y 6 cuotas sin interés con Banco Macro Visa o MasterCard.</li>
                    <li>2, 3, 4, 6 y 9 cuotas sin interés con Banco ICBC Visa o MasterCard.</li>
                    <li>3, 6, 9 y 12 cuotas sin interés con Banco Nación Visa o MasterCard Gold, Platinum, Standart y Black.</li>
                    <li>3, 6 y 9 cuotas sin interés con Banco Santander Amex y Visa Women.</li>
                    <li>2, 3 y 6 cuotas sin interés con Banco Galicia Visa o MasterCard.</li>
                  </ul>
              
                  <h4>PROMOCIÓN 12 CUOTAS SIN INTERÉS</h4>
                  <p>Promoción válida a partir del 24-04-2025 a las 00 hasta las 23.59 del mismo día.</p>
                  <p>12 Cuotas sin interés con todos los bancos.</p>
                  <p>Aplica únicamente para compras superiores a $200.000</p>
                  <p>El envío gratis aplica únicamente para envíos Estándar y en nuestras tiendas Nike habilitadas para retiro.</p>
                </div>
              }
              
            onClose={onClose}
        />
    );
};

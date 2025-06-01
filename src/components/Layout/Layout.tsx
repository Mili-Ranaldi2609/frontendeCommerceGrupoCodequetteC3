// Layout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NavBar } from "../screens/Navbar/NavBar";
import { Footer } from "../screens/Footer/Footer";
import { EnviosModal } from "../ui/Modals/ModalFooter/ModalEnvios";
import { OpcionesPagoModal } from "../ui/Modals/ModalFooter/OpcionesPagoModal";
import { ContactoModal } from "../ui/Modals/ModalFooter/ContactoModal";
import { PropositoModal } from "../ui/Modals/ModalFooter/PropositoModal";
import { PromocionesModal } from "../ui/Modals/ModalFooter/PromocionesModal";
// Agregá más modales si querés

const Layout = () => {
    const [showEnvios, setShowEnvios] = useState(false);
    const [showPagos, setShowPagos] = useState(false);
    const [showContacto, setShowContacto] = useState(false);
    const [showProposito, setShowProposito] = useState(false);
    const [showPromociones, setShowPromociones] = useState(false);

    return (
        <>
            <NavBar />
            <main>
                <Outlet />
            </main>
            <Footer
                onEnviosClick={() => setShowEnvios(true)}
                onPagosClick={() => setShowPagos(true)}
                onContactoClick={() => setShowContacto(true)}
                onPropositoClick={() => setShowProposito(true)}
                onPromocionesClick={() => setShowPromociones(true)}
            />

            <EnviosModal show={showEnvios} onClose={() => setShowEnvios(false)} />
            <OpcionesPagoModal show={showPagos} onClose={() => setShowPagos(false)} />
            <ContactoModal show={showContacto} onClose={() => setShowContacto(false)} />
            <PropositoModal show={showProposito} onClose={() => setShowProposito(false)} />
            <PromocionesModal show={showPromociones} onClose={() => setShowPromociones(false)} />
        </>
    );
};
    export default Layout;


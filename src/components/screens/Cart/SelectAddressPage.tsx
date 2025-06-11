// src/components/checkout/SelectAddressPage/SelectAddressPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUserAddresses,
    createMercadoPagoPreference,
    createCashOrder,
    type DireccionResponseFrontend
} from '../../../services/ConectionApi';
import { useCartStore } from '../../../store/useCartStore';
import styles from './SelectAddressPage.module.css';

interface CartItemFrontend {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    color: string;
    talle: string;
    category: string;
}

export const SelectAddressPage = () => {
    const navigate = useNavigate();
    const { items, clearCart } = useCartStore();
    const [direcciones, setDirecciones] = useState<DireccionResponseFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await getUserAddresses();
                setDirecciones(response.data);
                if (response.data.length === 1) {
                    setSelectedAddressId(response.data[0].id);
                } else if (response.data.length > 0 && selectedAddressId === null) {
                    setSelectedAddressId(response.data[0].id);
                }
            } catch (err: any) {
                console.error("Error al cargar direcciones:", err);
                if (err.response && err.response.status === 401) {
                    setError("Necesitas iniciar sesión para ver tus direcciones.");
                    navigate('/login');
                } else {
                    setError(err.response?.data?.message || "Error al cargar tus direcciones.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, [navigate, selectedAddressId]);
    const handleMercadoPagoPayment = async () => {
        if (!selectedAddressId) {
            alert('Por favor, selecciona una dirección de envío.');
            return;
        }
        if (items.length === 0) {
            alert('Tu carrito está vacío. No se puede procesar el pago.');
            navigate('/cart');
            return;
        }

        setIsProcessingPayment(true);
        setError(null);

        const cartItemsForApi: CartItemFrontend[] = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            color: item.color,
            talle: item.talle,
            category: item.category,
        }));

        try {
            const axiosResponse = await createMercadoPagoPreference(cartItemsForApi, selectedAddressId);
            const { preferenceId } = axiosResponse.data; // <--- ¡CAMBIO AQUÍ!
            window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;

        } catch (err: any) {
            console.error("Error al crear preferencia de Mercado Pago:", err);
            setError(err.response?.data?.message || "Error al procesar pago con Mercado Pago.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCashPayment = async () => {
        if (!selectedAddressId) {
            alert('Por favor, selecciona una dirección de envío.');
            return;
        }
        if (items.length === 0) {
            alert('Tu carrito está vacío. No se puede crear una orden en efectivo.');
            navigate('/cart');
            return;
        }

        setIsProcessingPayment(true);
        setError(null);

        const cartItemsForApi: CartItemFrontend[] = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            color: item.color,
            talle: item.talle,
            category: item.category,
        }));

        try {
            const axiosResponse = await createCashOrder(cartItemsForApi, selectedAddressId);
            // Accede a la data de la respuesta de Axios
            const orderResponse = axiosResponse.data;

            // Agrega un console.log para VERIFICAR que orderResponse.id no es undefined
            console.log("Respuesta completa del backend recibida en frontend:", orderResponse);
            console.log("ID de la orden recibido:", orderResponse.id); // Debería mostrar el ID ahora

            alert(`Orden en efectivo creada con éxito. ID de Orden: ${orderResponse.id}`);
            clearCart();
            navigate('/order-confirmation', { state: { order: orderResponse } });
        } catch (err: any) {
            console.error("Error al crear orden en efectivo:", err);
            setError(err.response?.data?.message || "Error al crear la orden en efectivo.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    if (loading) return <p>Cargando tus direcciones activas...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    if (direcciones.length === 0) {
        return (
            <div className={styles.noAddresses}>
                <p>No tienes direcciones activas registradas para el envío.</p>
                <button className={styles.addAddressBtn} onClick={() => navigate('/profile/ubicaciones')}>
                    Agregar Nueva Dirección
                </button>
                <button className={styles.backToCartBtn} onClick={() => navigate('/cart')}>
                    Volver al Carrito
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Selecciona una Dirección de Envío</h2>
            <div className={styles.addressList}>
                {direcciones.map((dir) => (
                    <div
                        key={dir.id}
                        className={`${styles.addressItem} ${selectedAddressId === dir.id ? styles.selected : ''}`}
                        onClick={() => setSelectedAddressId(dir.id)}
                    >
                        <input
                            type="radio"
                            id={`address-${dir.id}`}
                            name="shippingAddress"
                            value={dir.id}
                            checked={selectedAddressId === dir.id}
                            onChange={() => setSelectedAddressId(dir.id)}
                            className={styles.addressRadio}
                        />
                        <label htmlFor={`address-${dir.id}`} className={styles.addressLabel}>
                            <p><strong>{dir.calle} {dir.numero}</strong></p>
                            <p>{dir.localidad.nombre}, {dir.localidad.provincia.nombre}</p>
                            <p>CP: {dir.cp}</p>
                        </label>
                    </div>
                ))}
            </div>

            {selectedAddressId && (
                <div className={styles.paymentOptions}>
                    <h3>Selecciona un Método de Pago</h3>
                    <button
                        onClick={handleMercadoPagoPayment}
                        disabled={isProcessingPayment}
                        className={styles.paymentButton}
                    >
                        {isProcessingPayment ? 'Procesando...' : 'Pagar con Mercado Pago'}
                    </button>
                    <button
                        onClick={handleCashPayment}
                        disabled={isProcessingPayment}
                        className={styles.paymentButton}
                    >
                        {isProcessingPayment ? 'Procesando...' : 'Pagar en Efectivo'}
                    </button>
                </div>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}

            <button className={styles.backButton} onClick={() => navigate('/cart')}>
                Volver al Carrito
            </button>
        </div>
    );
};
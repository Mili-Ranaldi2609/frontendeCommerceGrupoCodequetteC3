import { Modal } from '../Modal/Modal';
import { useState, useEffect } from 'react';
import type { Producto,  } from '../../../../types/IProduct'; // Asegúrate de importar IDetalleProducto
import { IColor } from '../../../../types/IEnumColor';
import { IEnumTalle } from '../../../../types/IEnumTalle';
import type { ICategoria } from '../../../../types/ICategoria';
import style from '../ModalsAdmin/AddProductModal.module.css';
import type { AxiosResponse } from 'axios';
import type { IDetalle } from '../../../../types/IDetalle';

// Definición de las Props del componente
interface Props {
    isOpen: boolean;
    onClose: () => void;
    producto: Producto; // El producto a editar
    categorias: ICategoria[];
    onEdit: (productoId: number, productoActualizado: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'>) => Promise<AxiosResponse<any, any>>;
    onProductoEditado?: () => void; // Callback opcional después de editar
}

// Tipo de datos del formulario para edición
type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'> & {
    detalle: Array<IDetalle>; // Usamos IDetalleProducto directamente
};

export const ModalEditarProducto = ({ isOpen, onClose, producto, categorias, onEdit, onProductoEditado }: Props) => {
    const [formData, setFormData] = useState<ProductoFormData>({
        descripcion: '',
        sexo: 'MASCULINO',
        categorias: [],
        detalle: [],
        tipoProducto: '',
        active: true, // ¡Añadido para el estado del producto principal!
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && producto) {
            setFormData({
                descripcion: producto.descripcion || '',
                sexo: producto.sexo || 'UNISEX',
                categorias: producto.categorias || [],
                tipoProducto: producto.tipoProducto || '',
                active: producto.active !== undefined ? producto.active : true, // Carga el estado activo del producto
                detalle: producto.detalle.map(det => ({
                    id: det.id, // ¡Importante mantener el ID del detalle!
                    color: det.color || IColor.AZUL,
                    talle: det.talle || IEnumTalle.S,
                    marca: det.marca || '',
                    stock: det.stock || 0,
                    precioCompra: det.precioCompra || 0,
                    precioVenta: det.precioVenta || 0,
                    imagenes: det.imagenes && det.imagenes.length > 0 ? det.imagenes : [''],
                    active: det.active !== undefined ? det.active : true, // Carga el estado activo del detalle
                })),
            });
        } else if (!isOpen) {
            setFormData({
                descripcion: '',
                sexo: 'MASCULINO',
                categorias: [],
                detalle: [],
                tipoProducto: '',
                active: true,
            });
            setError(null);
        }
    }, [isOpen, producto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement; // 'checked' para checkboxes

        if (name === 'active') { // Manejo del checkbox 'active' del producto
            setFormData(prev => ({ ...prev, active: checked }));
            return;
        }

        if (name.startsWith('detalle[')) {
            const imagenUrlMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);
            const activeCheckboxMatch = name.match(/detalle\[(\d+)\]\.active/); // Para el checkbox 'active' del detalle

            if (imagenUrlMatch) {
                const detalleIndex = parseInt(imagenUrlMatch[1]);
                const imagenIndex = parseInt(imagenUrlMatch[2]);

                setFormData(prev => {
                    const updatedDetalles = [...prev.detalle];
                    if (!updatedDetalles[detalleIndex]) {
                        updatedDetalles[detalleIndex] = {
                            color: IColor.AZUL, marca: '', stock: 0, talle: IEnumTalle.S, precioCompra: 0, precioVenta: 0, imagenes: [''], active: true
                        };
                    }
                    if (!updatedDetalles[detalleIndex].imagenes) {
                        updatedDetalles[detalleIndex].imagenes = [];
                    }
                    const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
                    updatedImagenes[imagenIndex] = value;

                    updatedDetalles[detalleIndex] = {
                        ...updatedDetalles[detalleIndex],
                        imagenes: updatedImagenes,
                    };
                    return { ...prev, detalle: updatedDetalles };
                });
            } else if (activeCheckboxMatch) { // Manejo del checkbox 'active' del detalle
                const detalleIndex = parseInt(activeCheckboxMatch[1]);
                setFormData(prev => {
                    const updatedDetalles = [...prev.detalle];
                    updatedDetalles[detalleIndex] = {
                        ...updatedDetalles[detalleIndex],
                        active: checked,
                    };
                    return { ...prev, detalle: updatedDetalles };
                });
            } else {
                const match = name.match(/detalle\[(\d+)\]\.(\w+)/);
                if (match) {
                    const index = parseInt(match[1]);
                    const field = match[2];
                    let fieldValue: any = value;

                    if (field === 'stock' || field === 'precioCompra' || field === 'precioVenta') {
                        fieldValue = parseFloat(value);
                        if (isNaN(fieldValue)) fieldValue = 0;
                    }

                    setFormData(prev => {
                        const updatedDetalles = [...prev.detalle];
                        updatedDetalles[index] = {
                            ...updatedDetalles[index],
                            [field]: fieldValue,
                        };
                        return { ...prev, detalle: updatedDetalles };
                    });
                }
            }
        } else if (name === 'categorias') {
            const select = e.target as HTMLSelectElement;
            const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
            const selectedCategorias = categorias.filter(cat => selectedIds.includes(cat.id!));
            setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
        } else {
            let productFieldValue: any = value;
            if (name === 'sexo') {
                productFieldValue = value as Producto['sexo'];
            }
            setFormData(prev => ({
                ...prev,
                [name]: productFieldValue,
            }));
        }
    };

    const handleAddDetalle = () => {
        setFormData(prev => ({
            ...prev,
            detalle: [
                ...prev.detalle,
                {
                    color: IColor.AZUL,
                    marca: '',
                    stock: 0,
                    talle: IEnumTalle.S,
                    precioCompra: 0,
                    precioVenta: 0,
                    imagenes: [''],
                    active: true, // Nuevo detalle por defecto activo
                },
            ],
        }));
    };

    const handleRemoveDetalle = (indexToRemove: number) => {
        setFormData(prev => {
            const updatedDetalles = prev.detalle.filter((_, idx) => idx !== indexToRemove);
            return { ...prev, detalle: updatedDetalles };
        });
    };

    const handleAddImagenToDetalle = (detalleIndex: number) => {
        setFormData(prev => {
            const updatedDetalles = [...prev.detalle];
            if (!updatedDetalles[detalleIndex]) {
                updatedDetalles[detalleIndex] = {
                    color: IColor.AZUL, marca: '', stock: 0, talle: IEnumTalle.S, precioCompra: 0, precioVenta: 0, imagenes: [''], active: true
                };
            }
            updatedDetalles[detalleIndex] = {
                ...updatedDetalles[detalleIndex],
                imagenes: [...updatedDetalles[detalleIndex].imagenes, ''],
            };
            return { ...prev, detalle: updatedDetalles };
        });
    };

    const handleRemoveImagenFromDetalle = (detalleIndex: number, imagenIndex: number) => {
        setFormData(prev => {
            const updatedDetalles = [...prev.detalle];
            const updatedImagenes = updatedDetalles[detalleIndex].imagenes.filter((_, idx) => idx !== imagenIndex);
            updatedDetalles[detalleIndex] = {
                ...updatedDetalles[detalleIndex],
                imagenes: updatedImagenes.length > 0 ? updatedImagenes : [''],
            };
            return { ...prev, detalle: updatedDetalles };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const productoParaBackend: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal'> = {
                descripcion: formData.descripcion,
                sexo: formData.sexo,
                tipoProducto: formData.tipoProducto,
                categorias: formData.categorias.map(cat => ({
                    id: cat.id,
                    descripcion: cat.descripcion,
                })),
                detalle: formData.detalle.map(det => ({
                    id: det.id, // ¡MUY IMPORTANTE: enviar el ID del detalle!
                    imagenes: det.imagenes.filter(url => url.trim() !== ''),
                    color: det.color,
                    talle: det.talle,
                    marca: det.marca,
                    stock: det.stock,
                    precioCompra: det.precioCompra,
                    precioVenta: det.precioVenta,
                    active: det.active // Enviar el estado active del detalle
                })),
                active: formData.active // Enviar el estado active del producto principal
            };

            await onEdit(producto.id, productoParaBackend);

            onClose();
            if (onProductoEditado) onProductoEditado();
            alert('Producto editado correctamente');
        } catch (err) {
            console.error("Error al editar producto:", err);
            setError('Error al editar producto. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onClose={onClose} title="Editar Producto">
            <form onSubmit={handleSubmit} className={style.form}>
                <label>
                    Descripción:
                    <input name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                </label>

                <label>
                    Género:
                    <select name="sexo" value={formData.sexo} onChange={handleChange} required>
                        <option value="">Seleccione género</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                        <option value="UNISEX">Unisex</option>
                        <option value="UNISEX_CHILD">Unisex Niño</option>
                    </select>
                </label>
                <label>
                    Tipo de Producto:
                    <input name="tipoProducto" value={formData.tipoProducto} onChange={handleChange} required />
                </label>

                <label>
                    Categorías:
                    <select
                        name="categorias"
                        multiple
                        value={formData.categorias.map(cat => String(cat.id))}
                        onChange={handleChange}
                        className={style.select_multiple}
                    >
                        {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.descripcion}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Campo para activar/desactivar el producto completo */}
                <label className={style.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                    />
                    Producto Activo
                </label>

                <div>
                    <h4>Detalles del Producto</h4>
                    {formData.detalle.map((detalleItem, idx) => (
                        <div key={detalleItem.id || `new-${idx}`} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
                            {/* Incluir un input oculto para el ID del detalle si existe */}
                            {detalleItem.id && <input type="hidden" name={`detalle[${idx}].id`} value={detalleItem.id} />}

                            <label>
                                Marca:
                                <input name={`detalle[${idx}].marca`} value={detalleItem.marca} onChange={handleChange} required />
                            </label>
                            <label>
                                Color:
                                <select name={`detalle[${idx}].color`} value={detalleItem.color} onChange={handleChange} required>
                                    {Object.values(IColor).map(color => (
                                        <option key={color} value={color}>
                                            {color}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Stock:
                                <input
                                    type="number"
                                    name={`detalle[${idx}].stock`}
                                    value={detalleItem.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Talle:
                                <select name={`detalle[${idx}].talle`} value={detalleItem.talle} onChange={handleChange} required>
                                    {Object.values(IEnumTalle).map(talle => (
                                        <option key={talle} value={talle}>
                                            {talle}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Precio Compra:
                                <input
                                    type="number"
                                    name={`detalle[${idx}].precioCompra`}
                                    value={detalleItem.precioCompra}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Precio Venta:
                                <input
                                    type="number"
                                    name={`detalle[${idx}].precioVenta`}
                                    value={detalleItem.precioVenta}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            {/* Campo para activar/desactivar el detalle individual */}
                            <label className={style.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name={`detalle[${idx}].active`}
                                    checked={detalleItem.active !== undefined ? detalleItem.active : true}
                                    onChange={handleChange}
                                />
                                Detalle Activo
                            </label>

                            <div className={style.imagenesDetalleContainer}>
                                <h6>Imágenes del Detalle {idx + 1} (URLs):</h6>
                                {Array.isArray(detalleItem.imagenes) && detalleItem.imagenes.map((imgUrl, imgIdx) => (
                                    <div key={`${idx}-${imgIdx}`} className={style.image_input_row}>
                                        <label>
                                            URL Imagen {imgIdx + 1}:
                                            <input
                                                name={`detalle[${idx}].imagenes[${imgIdx}]`}
                                                value={imgUrl || ''}
                                                onChange={handleChange}
                                            />
                                        </label>
                                        {detalleItem.imagenes.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)} className={style.smallButton}>
                                                Eliminar URL
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={style.smallButton}>
                                    Agregar Campo de URL
                                </button>
                            </div>
                            {formData.detalle.length > 1 && (
                                <button type="button" onClick={() => handleRemoveDetalle(idx)} style={{ marginTop: '10px', backgroundColor: '#f44336', color: 'white' }}>
                                    Remover Detalle (Desactivar si existe, eliminar si es nuevo)
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddDetalle} style={{ marginTop: '10px' }}>
                        Agregar Nuevo Detalle
                    </button>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? 'Guardando cambios...' : 'Guardar cambios'}
                </button>
            </form>
        </Modal>
    );
};
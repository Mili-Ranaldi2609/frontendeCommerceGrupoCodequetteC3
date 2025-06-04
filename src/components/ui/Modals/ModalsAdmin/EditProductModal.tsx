import { Modal } from '../Modal/Modal';
import { useState, useEffect } from 'react';
import type { Producto } from '../../../../types/IProduct';
import { IColor } from '../../../../types/IEnumColor';
import { IEnumTalle } from '../../../../types/IEnumTalle';
import type { ICategoria } from '../../../../types/ICategoria';
import style from '../ModalsAdmin/AddProductModal.module.css'; // Asegúrate de que esta ruta sea correcta para tus estilos
import type { AxiosResponse } from 'axios';

// Definición de las Props del componente
interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto; // El producto a editar
  categorias: ICategoria[];
  onEdit: (productoId: number, productoActualizado: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'imagenes'>) => Promise<AxiosResponse<any, any>>; 
  onProductoEditado?: () => void; // Callback opcional después de editar
}

// Tipo de datos del formulario para edición, excluyendo campos calculados o gestionados de otra forma
type ProductoFormData = Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'imagenes'> & {
  detalle: Array<{
    color: IColor;
    talle: IEnumTalle;
    marca: string;
    stock: number;
    precioCompra: number;
    precioVenta: number;
    imagenes: string[]; // URLs de las imágenes
  }>;
};

export const ModalEditarProducto = ({ isOpen, onClose, producto, categorias, onEdit, onProductoEditado }: Props) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ProductoFormData>({
    descripcion: '',
    sexo: 'MASCULINO',
    categorias: [],
    detalle: [],
    tipoProducto: '',
  });

  // Estados para el manejo de la carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar los datos del producto en el formulario cuando el modal se abre o el producto cambia
  useEffect(() => {
    if (isOpen && producto) {
      setFormData({
        descripcion: producto.descripcion || '',
        sexo: producto.sexo || 'UNISEX', // Valor por defecto si es undefined
        categorias: producto.categorias || [],
        tipoProducto: producto.tipoProducto || '',
        detalle: producto.detalle.map(det => ({
          color: det.color || IColor.AZUL, // Valor por defecto
          talle: det.talle || IEnumTalle.S, // Valor por defecto
          marca: det.marca || '',
          stock: det.stock || 0,
          precioCompra: det.precioCompra || 0,
          precioVenta: det.precioVenta || 0,
          imagenes: det.imagenes && det.imagenes.length > 0 ? det.imagenes : [''], // Inicializa con URLs existentes o un campo vacío
        })),
      });
    } else if (!isOpen) {
      // Opcional: Resetear el formulario cuando se cierra el modal
      setFormData({
        descripcion: '',
        sexo: 'MASCULINO',
        categorias: [],
        detalle: [],
        tipoProducto: '',
      });
      setError(null); // Limpiar errores
    }
  }, [isOpen, producto]);


  // Handler genérico para cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    console.log("handleChange disparado. Name:", name, "Value:", value, "Type:", type);

    if (name.startsWith('detalle[')) {
        // Regex para campos generales de detalle (marca, stock, etc.)
        const match = name.match(/detalle\[(\d+)\]\.(\w+)/);
        // Regex específico para las URLs de las imágenes dentro de un detalle
        const imagenUrlMatch = name.match(/detalle\[(\d+)\]\.imagenes\[(\d+)\]/);

        if (imagenUrlMatch) {
            // Manejo de URLs de imagen
            const detalleIndex = parseInt(imagenUrlMatch[1]);
            const imagenIndex = parseInt(imagenUrlMatch[2]);
            
            console.log("handleChange - URL de imagen detectada (DENTRO DEL BLOQUE IMAGEN):");
            console.log("  name:", name);
            console.log("  e.target.value (directo del input):", e.target.value);
            console.log("  detalleIndex:", detalleIndex);
            console.log("  imagenIndex:", imagenIndex);

            setFormData(prev => {
                const updatedDetalles = [...prev.detalle];
                // Asegurarse de que el detalle y su array de imágenes existan
                if (!updatedDetalles[detalleIndex]) { 
                    updatedDetalles[detalleIndex] = {
                        color: IColor.AZUL, marca: '', stock: 0, talle: IEnumTalle.S, precioCompra: 0, precioVenta: 0, imagenes: ['']
                    };
                }
                if (!updatedDetalles[detalleIndex].imagenes) {
                    updatedDetalles[detalleIndex].imagenes = [];
                }
                const updatedImagenes = [...updatedDetalles[detalleIndex].imagenes];
                updatedImagenes[imagenIndex] = e.target.value; 

                console.log("  updatedImagenes DESPUÉS de la asignación:", updatedImagenes);

                updatedDetalles[detalleIndex] = {
                    ...updatedDetalles[detalleIndex],
                    imagenes: updatedImagenes,
                };
                return { ...prev, detalle: updatedDetalles };
            });
        } else if (match) {
            // Manejo de otros campos de detalle (marca, stock, etc.)
            const index = parseInt(match[1]);
            const field = match[2];
            let fieldValue: any = value; 

            // Convertir a número si es un campo numérico
            if (field === 'stock' || field === 'precioCompra' || field === 'precioVenta') {
                fieldValue = parseFloat(value);
                if (isNaN(fieldValue)) fieldValue = 0; // Asegurar que sea 0 si no es un número válido
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
    } else if (name === 'categorias') {
        // Manejo de selección múltiple de categorías
        const select = e.target as HTMLSelectElement;
        const selectedIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
        // Mapea los IDs seleccionados a los objetos de categoría completos
        const selectedCategorias = categorias.filter(cat => selectedIds.includes(cat.id!));
        setFormData(prev => ({ ...prev, categorias: selectedCategorias }));
    } else {
        // Manejo de campos directos del producto (denominacion, sexo, tipoProducto)
        let productFieldValue: any = value;
        if (name === 'sexo') {
            productFieldValue = value as Producto['sexo']; // Asegurar el tipo para 'sexo'
        }
        setFormData(prev => ({
            ...prev,
            [name]: productFieldValue,
        }));
    }
  };

  // Función para agregar un nuevo bloque de detalle
  const handleAddDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalle: [
        ...prev.detalle,
        {
          color: IColor.AZUL, // Valores por defecto para el nuevo detalle
          marca: '',
          stock: 0,
          talle: IEnumTalle.S,
          precioCompra: 0,
          precioVenta: 0,
          imagenes: [''], // Un campo de imagen URL vacío por defecto
        },
      ],
    }));
  };

  // Función para eliminar un bloque de detalle
  const handleRemoveDetalle = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      detalle: prev.detalle.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Función para agregar un nuevo campo de URL de imagen a un detalle específico
  const handleAddImagenToDetalle = (detalleIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      // Asegurarse de que el detalle existe
      if (!updatedDetalles[detalleIndex]) {
        updatedDetalles[detalleIndex] = {
          color: IColor.AZUL, marca: '', stock: 0, talle: IEnumTalle.S, precioCompra: 0, precioVenta: 0, imagenes: ['']
        };
      }
      // Añadir un campo de URL vacío al array de imágenes de ese detalle
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        imagenes: [...updatedDetalles[detalleIndex].imagenes, ''],
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };

  // Función para eliminar un campo de URL de imagen de un detalle específico
  const handleRemoveImagenFromDetalle = (detalleIndex: number, imagenIndex: number) => {
    setFormData(prev => {
      const updatedDetalles = [...prev.detalle];
      const updatedImagenes = updatedDetalles[detalleIndex].imagenes.filter((_, idx) => idx !== imagenIndex);
      updatedDetalles[detalleIndex] = {
        ...updatedDetalles[detalleIndex],
        // Si se eliminan todas las imágenes, asegura que al menos haya un campo vacío para agregar
        imagenes: updatedImagenes.length > 0 ? updatedImagenes : [''],
      };
      return { ...prev, detalle: updatedDetalles };
    });
  };

  // Handler para el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true);
    setError(null);

    try {
        // Construir el objeto Producto a enviar al backend, excluyendo 'id' y campos calculados
        const productoParaBackend: Omit<Producto, 'id' | 'precioOriginal' | 'precioFinal' | 'imagenes'> = {
            descripcion: formData.descripcion,
            sexo: formData.sexo,
            tipoProducto: formData.tipoProducto,
            // Mapear categorías a una estructura más simple si el backend solo necesita id/descripcion
            categorias: formData.categorias.map(cat => ({
                id: cat.id,
                descripcion: cat.descripcion,
                categoriaPadre: undefined, // No se envía en este contexto
                subcategorias: undefined, // No se envía en este contexto
                productos: undefined // No se envía en este contexto
            })),
            // Mapear detalles, filtrando URLs de imagen vacías
            detalle: formData.detalle.map(det => ({
                imagenes: det.imagenes.filter(url => url.trim() !== ''), // Eliminar URLs vacías
                color: det.color,
                talle: det.talle,
                marca: det.marca,
                stock: det.stock,
                precioCompra: det.precioCompra,
                precioVenta: det.precioVenta,
            })),
        };

        // Llamar a la función onEdit con el ID del producto y los datos actualizados
        await onEdit(producto.id!, productoParaBackend); 
        
        onClose(); // Cerrar el modal
        if (onProductoEditado) onProductoEditado(); // Ejecutar callback opcional
        alert('Producto editado correctamente');
    } catch (err) {
        console.error("Error al editar producto:", err);
        setError('Error al editar producto. Revisa la consola para más detalles.');
    } finally {
        setLoading(false); // Desactivar el estado de carga
    }
  };

  if (!isOpen) return null; // No renderizar nada si el modal no está abierto

  return (
    <Modal show={isOpen} onClose={onClose} title="Editar Producto">
      <form onSubmit={handleSubmit} className={style.form}>
        {/* Campos directos del Producto */}
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

        {/* Selección múltiple de Categorías */}
        <label>
          Categorías:
          <select
            name="categorias"
            multiple
            value={formData.categorias.map(cat => String(cat.id))} // Convierte los IDs a string para el select
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

        {/* Sección de Detalles del Producto */}
        <div>
          <h4>Detalles del Producto</h4>
          {formData.detalle.map((detalleItem, idx) => (
            <div key={idx} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
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
              
              {/* Sección de Imágenes del Detalle */}
              <div className={style.imagenesDetalleContainer}>
                <h6>Imágenes del Detalle {idx + 1} (URLs):</h6>
                {Array.isArray(detalleItem.imagenes) && detalleItem.imagenes.map((imgUrl, imgIdx) => (
                  <div key={`${idx}-${imgIdx}`} className={style.image_input_row}>
                    <label>
                      URL Imagen {imgIdx + 1}:
                      <input
                        name={`detalle[${idx}].imagenes[${imgIdx}]`}
                        value={imgUrl || ''} // Asegurar que el valor sea un string
                        onChange={handleChange}
                      />
                    </label>
                    {/* Botón para eliminar URL, solo si hay más de una */}
                    {detalleItem.imagenes.length > 1 && (
                      <button type="button" onClick={() => handleRemoveImagenFromDetalle(idx, imgIdx)} className={style.smallButton}>
                        Eliminar URL
                      </button>
                    )}
                  </div>
                ))}
                {/* Botón para agregar nuevo campo de URL */}
                <button type="button" onClick={() => handleAddImagenToDetalle(idx)} className={style.smallButton}>
                  Agregar Campo de URL
                </button>
              </div>
              {/* Botón para eliminar detalle, solo si hay más de uno */}
              {formData.detalle.length > 1 && ( 
                <button type="button" onClick={() => handleRemoveDetalle(idx)} style={{ marginTop: '10px', backgroundColor: '#f44336', color: 'white' }}>
                  Eliminar Detalle
                </button>
              )}
            </div>
          ))}
          {/* Botón para agregar un nuevo detalle */}
          <button type="button" onClick={handleAddDetalle} style={{ marginTop: '10px' }}>
            Agregar Nuevo Detalle
          </button>
        </div>

        {/* Mensaje de error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {/* Botón para guardar cambios */}
        <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>
      </form>
    </Modal>
  );
};
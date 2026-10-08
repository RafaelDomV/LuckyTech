import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Productos.css";

const formularioInicial = {
    codigo: "",
    nombre: "",
    categoria: "",
    marca: "",
    modelo: "",
    descripcion: "",
    precioCompra: "",
    precioVenta: "",
    stockMinimo: "5"
};

function Productos() {

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [busqueda, setBusqueda] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [productoEditando, setProductoEditando] = useState(null);

    const [formulario, setFormulario] = useState(
        formularioInicial
    );

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");


    useEffect(() => {

        cargarDatos();

    }, []);


    const cargarDatos = async () => {

        try {

            setCargando(true);

            const [
                respuestaProductos,
                respuestaCategorias
            ] = await Promise.all([
                api.get("/productos"),
                api.get("/categorias")
            ]);

            setProductos(respuestaProductos.data);

            setCategorias(
                respuestaCategorias.data
            );

        } catch (error) {

            console.error(error);

            setError(
                "No fue posible cargar los productos."
            );

        } finally {

            setCargando(false);

        }

    };


    const cargarProductos = async () => {

        try {

            const respuesta = await api.get(
                "/productos"
            );

            setProductos(respuesta.data);

        } catch (error) {

            console.error(error);

        }

    };

    const editarProducto = (producto) => {

        setProductoEditando(producto._id);

        setFormulario({

            codigo: producto.codigo || "",

            nombre: producto.nombre || "",

            categoria:
                producto.categoria?._id
                || producto.categoria
                || "",

            marca: producto.marca || "",

            modelo: producto.modelo || "",

            descripcion: producto.descripcion || "",

            precioCompra:
                producto.precioCompra ?? "",

            precioVenta:
                producto.precioVenta ?? "",

            stockMinimo:
                producto.stockMinimo ?? 5

        });

        setMostrarFormulario(true);

        setMensaje("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

    const cambiarEstadoProducto = async (producto) => {

        const nuevoEstado = !producto.activo;

        const accion = nuevoEstado
            ? "activar"
            : "desactivar";

        const confirmar = window.confirm(
            `¿Deseas ${accion} el producto "${producto.nombre}"?`
        );

        if (!confirmar) {
            return;
        }

        try {

            setMensaje("");
            setError("");

            await api.put(
                `/productos/${producto._id}`,
                {
                    activo: nuevoEstado
                }
            );

            setMensaje(
                nuevoEstado
                    ? "Producto activado correctamente."
                    : "Producto desactivado correctamente."
            );

            await cargarProductos();

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje
                ||
                "No fue posible cambiar el estado del producto."
            );

        }

    };

    const cambiarCampo = (evento) => {

        const {
            name,
            value
        } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    const cancelarFormulario = () => {

        setMostrarFormulario(false);

        setProductoEditando(null);

        setFormulario(formularioInicial);

        setError("");

    };


    const guardarProducto = async (evento) => {
    
        evento.preventDefault();
    
        setGuardando(true);
        setMensaje("");
        setError("");
    
        try {
        
            const datosProducto = {
            
                codigo:
                    formulario.codigo.trim(),
            
                nombre:
                    formulario.nombre.trim(),
            
                categoria:
                    formulario.categoria,
            
                marca:
                    formulario.marca.trim(),
            
                modelo:
                    formulario.modelo.trim(),
            
                descripcion:
                    formulario.descripcion.trim(),
            
                precioCompra:
                    Number(
                        formulario.precioCompra || 0
                    ),
                
                precioVenta:
                    Number(
                        formulario.precioVenta
                    ),
                
                stockMinimo:
                    Number(
                        formulario.stockMinimo || 5
                    )
                
            };
        
        
            if (productoEditando) {
            
                await api.put(
                    `/productos/${productoEditando}`,
                    datosProducto
                );
            
                setMensaje(
                    "Producto actualizado correctamente."
                );
            
            } else {
            
                await api.post(
                    "/productos",
                    {
                        ...datosProducto,
                        stock: 0,
                        activo: true
                    }
                );
            
                setMensaje(
                    "Producto registrado correctamente."
                );
            
            }
        
        
            setFormulario(formularioInicial);
        
            setProductoEditando(null);
        
            setMostrarFormulario(false);
        
            await cargarProductos();
        
        
        } catch (error) {
        
            console.error(error);
        
            setError(
                error.response?.data?.mensaje
                ||
                (
                    productoEditando
                        ? "No fue posible actualizar el producto."
                        : "No fue posible registrar el producto."
                )
            );
        
        } finally {
        
            setGuardando(false);
        
        }
    
    };


    const productosFiltrados = useMemo(() => {

        const texto =
            busqueda
                .trim()
                .toLowerCase();


        if (!texto) {

            return productos;

        }


        return productos.filter(
            (producto) => {

                const categoria =
                    producto.categoria?.nombre
                    || "";

                return (
                    producto.codigo
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    producto.nombre
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    producto.marca
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    producto.modelo
                        ?.toLowerCase()
                        .includes(texto)
                    ||
                    categoria
                        .toLowerCase()
                        .includes(texto)
                );

            }
        );

    }, [productos, busqueda]);


    return (

        <div className="productos-page">

            <div className="productos-encabezado">

                <div>

                    <h1 className="productos-titulo">
                        Productos
                    </h1>

                    <p className="productos-subtitulo">
                        Administra el catálogo de productos de LuckyTech.
                    </p>

                </div>


                <button
                    className="btn-nuevo-producto"
                    onClick={() => {
                    
                        setProductoEditando(null);
                    
                        setFormulario(
                            formularioInicial
                        );
                    
                        setMostrarFormulario(true);
                    
                        setMensaje("");
                        setError("");
                    
                    }}
                >
                    + Nuevo producto
                </button>

            </div>


            {
                mensaje &&
                <div className="mensaje-exito">
                    {mensaje}
                </div>
            }


            {
                error &&
                <div className="mensaje-error">
                    {error}
                </div>
            }


            {
                mostrarFormulario &&
                <form
                    className="producto-formulario"
                    onSubmit={guardarProducto}
                >

                    <div className="formulario-titulo">

                        <div>

                            <h2>
                                {
                                    productoEditando
                                        ? "Editar producto"
                                        : "Registrar producto"
                                }
                            </h2>
                            
                            <p>
                                {
                                    productoEditando
                                        ? "Modifica la información del producto seleccionado."
                                        : "Ingresa la información del nuevo producto."
                                }
                            </p>

                        </div>

                    </div>


                    <div className="formulario-grid">

                        <div className="campo">

                            <label>
                                Código *
                            </label>

                            <input
                                type="text"
                                name="codigo"
                                value={formulario.codigo}
                                onChange={cambiarCampo}
                                placeholder="Ej. CAB-005"
                                required
                            />

                        </div>


                        <div className="campo campo-doble">

                            <label>
                                Nombre *
                            </label>

                            <input
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                placeholder="Nombre del producto"
                                required
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Categoría *
                            </label>

                            <select
                                name="categoria"
                                value={formulario.categoria}
                                onChange={cambiarCampo}
                                required
                            >

                                <option value="">
                                    Selecciona una categoría
                                </option>

                                {
                                    categorias
                                        .filter(
                                            categoria =>
                                                categoria.activo !== false
                                        )
                                        .map(
                                            categoria => (

                                                <option
                                                    key={categoria._id}
                                                    value={categoria._id}
                                                >
                                                    {categoria.nombre}
                                                </option>

                                            )
                                        )
                                }

                            </select>

                        </div>


                        <div className="campo">

                            <label>
                                Marca
                            </label>

                            <input
                                type="text"
                                name="marca"
                                value={formulario.marca}
                                onChange={cambiarCampo}
                                placeholder="Ej. Steren"
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Modelo
                            </label>

                            <input
                                type="text"
                                name="modelo"
                                value={formulario.modelo}
                                onChange={cambiarCampo}
                                placeholder="Modelo"
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Precio de compra
                            </label>

                            <input
                                type="number"
                                name="precioCompra"
                                value={formulario.precioCompra}
                                onChange={cambiarCampo}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Precio de venta *
                            </label>

                            <input
                                type="number"
                                name="precioVenta"
                                value={formulario.precioVenta}
                                onChange={cambiarCampo}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Stock mínimo
                            </label>

                            <input
                                type="number"
                                name="stockMinimo"
                                value={formulario.stockMinimo}
                                onChange={cambiarCampo}
                                min="0"
                            />

                        </div>


                        <div className="campo campo-descripcion">

                            <label>
                                Descripción
                            </label>

                            <textarea
                                name="descripcion"
                                value={formulario.descripcion}
                                onChange={cambiarCampo}
                                placeholder="Descripción del producto"
                                rows="3"
                            />

                        </div>

                    </div>


                    <div className="formulario-acciones">

                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={cancelarFormulario}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="btn-guardar"
                            disabled={guardando}
                        >
                            {
                                guardando
                                    ?
                                    "Guardando..."
                                    :
                                    productoEditando
                                        ? "Guardar cambios"
                                        : "Guardar producto"
                            }
                        </button>

                    </div>

                </form>
            }


            <div className="productos-herramientas">

                <div className="buscador-productos">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar por código, nombre, marca, modelo o categoría..."
                        value={busqueda}
                        onChange={
                            (evento) =>
                                setBusqueda(
                                    evento.target.value
                                )
                        }
                    />

                </div>


                <div className="contador-productos">

                    {
                        productosFiltrados.length
                    }

                    {
                        productosFiltrados.length === 1
                            ?
                            " producto"
                            :
                            " productos"
                    }

                </div>

            </div>


            <div className="tabla-contenedor">

                {
                    cargando
                    ?
                    (
                        <div className="estado-tabla">
                            Cargando productos...
                        </div>
                    )
                    :
                    productosFiltrados.length === 0
                    ?
                    (
                        <div className="estado-tabla">
                            No se encontraron productos.
                        </div>
                    )
                    :
                    (

                        <table className="tabla-productos">

                            <thead>

                                <tr>

                                    <th>
                                        Código
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Categoría
                                    </th>

                                    <th>
                                        Marca
                                    </th>

                                    <th>
                                        Precio
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    productosFiltrados.map(
                                        producto => {

                                            const stockBajo =
                                                producto.stock <=
                                                producto.stockMinimo;

                                            return (

                                                <tr
                                                    key={producto._id}
                                                >

                                                    <td>
                                                        <span className="codigo-producto">
                                                            {producto.codigo}
                                                        </span>
                                                    </td>


                                                    <td>

                                                        <div className="nombre-producto">
                                                            {producto.nombre}
                                                        </div>

                                                        {
                                                            producto.modelo &&
                                                            <div className="modelo-producto">
                                                                {producto.modelo}
                                                            </div>
                                                        }

                                                    </td>


                                                    <td>
                                                        {
                                                            producto.categoria?.nombre
                                                            ||
                                                            "Sin categoría"
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            producto.marca
                                                            ||
                                                            "—"
                                                        }
                                                    </td>


                                                    <td className="precio-producto">

                                                        $
                                                        {
                                                            Number(
                                                                producto.precioVenta
                                                            )
                                                                .toLocaleString(
                                                                    "es-MX",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    }
                                                                )
                                                        }

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                stockBajo
                                                                    ?
                                                                    "stock stock-bajo"
                                                                    :
                                                                    "stock stock-normal"
                                                            }
                                                        >
                                                            {producto.stock}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                producto.activo
                                                                    ?
                                                                    "estado estado-activo"
                                                                    :
                                                                    "estado estado-inactivo"
                                                            }
                                                        >

                                                            {
                                                                producto.activo
                                                                    ?
                                                                    "Activo"
                                                                    :
                                                                    "Inactivo"
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>
                                                                                                            
                                                        <div className="acciones-producto">
                                                                                                            
                                                            <button
                                                                type="button"
                                                                className="btn-editar-producto"
                                                                onClick={() =>
                                                                    editarProducto(producto)
                                                                }
                                                            >
                                                                Editar
                                                            </button>
                                                            
                                                            
                                                            <button
                                                                type="button"
                                                                className={
                                                                    producto.activo
                                                                        ? "btn-desactivar-producto"
                                                                        : "btn-activar-producto"
                                                                }
                                                                onClick={() =>
                                                                    cambiarEstadoProducto(producto)
                                                                }
                                                            >
                                                                {
                                                                    producto.activo
                                                                        ? "Desactivar"
                                                                        : "Activar"
                                                                }
                                                            </button>
                                                            
                                                        </div>
                                                            
                                                    </td>
                                                        
                                                </tr>

                                            );

                                        }
                                    )
                                }

                            </tbody>

                        </table>

                    )
                }

            </div>

        </div>

    );

}

export default Productos;
import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useOutletContext
} from "react-router-dom";

import api from "../services/api";

import "./Ventas.css";


function Ventas() {

    const [productos, setProductos] =
        useState([]);

    const [ventas, setVentas] =
        useState([]);

    const [carrito, setCarrito] =
        useState([]);

    const [busqueda, setBusqueda] =
        useState("");

    const [metodoPago, setMetodoPago] =
        useState("EFECTIVO");

    const [vista, setVista] =
        useState("NUEVA");

    const [cargando, setCargando] =
        useState(true);

    const [procesando, setProcesando] =
        useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");

    const { usuario } =
        useOutletContext();


    const esAdmin =
        usuario?.rol === "ADMIN";


    const [ventaDetalleId, setVentaDetalleId] =
        useState(null);


    const [ventaACancelar, setVentaACancelar] =
        useState(null);


    const [motivoCancelacion, setMotivoCancelacion] =
        useState("");


    const [cancelando, setCancelando] =
        useState(false);

    useEffect(() => {

        cargarDatos();

    }, []);


    const cargarDatos = async () => {

        try {

            setCargando(true);

            const [
                respuestaProductos,
                respuestaVentas
            ] = await Promise.all([

                api.get("/productos"),

                api.get("/ventas")

            ]);


            setProductos(
                respuestaProductos.data
            );

            setVentas(
                respuestaVentas.data
            );


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje
                ||
                "No fue posible cargar el módulo de ventas."
            );

        } finally {

            setCargando(false);

        }

    };


    const productosDisponibles =
        useMemo(() => {

            const texto =
                busqueda
                    .trim()
                    .toLowerCase();


            return productos.filter(
                producto => {

                    if (
                        producto.activo === false
                    ) {

                        return false;

                    }


                    if (!texto) {

                        return true;

                    }


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

                        categoria
                            .toLowerCase()
                            .includes(texto)

                    );

                }

            );

        }, [productos, busqueda]);


    const agregarProducto = (producto) => {

        setMensaje("");
        setError("");


        if (producto.stock <= 0) {

            setError(
                "Este producto no tiene existencias."
            );

            return;

        }


        const existente =
            carrito.find(
                item =>
                    item.producto._id ===
                    producto._id
            );


        if (existente) {

            if (
                existente.cantidad >=
                producto.stock
            ) {

                setError(
                    `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}".`
                );

                return;

            }


            setCarrito(
                carrito.map(
                    item =>

                        item.producto._id ===
                        producto._id

                            ? {
                                ...item,
                                cantidad:
                                    item.cantidad + 1
                            }

                            : item

                )
            );

            return;

        }


        setCarrito([
            ...carrito,
            {
                producto,
                cantidad: 1
            }
        ]);

    };


    const cambiarCantidad = (
        productoId,
        nuevaCantidad
    ) => {

        const cantidad =
            Number(nuevaCantidad);


        const item =
            carrito.find(
                item =>
                    item.producto._id ===
                    productoId
            );


        if (!item) {

            return;

        }


        if (
            !Number.isInteger(cantidad)
            ||
            cantidad < 1
        ) {

            return;

        }


        if (
            cantidad >
            item.producto.stock
        ) {

            setError(
                `Stock máximo disponible: ${item.producto.stock}.`
            );

            return;

        }


        setError("");


        setCarrito(
            carrito.map(
                itemCarrito =>

                    itemCarrito.producto._id ===
                    productoId

                        ? {
                            ...itemCarrito,
                            cantidad
                        }

                        : itemCarrito

            )
        );

    };


    const aumentarCantidad =
        (productoId) => {

            const item =
                carrito.find(
                    item =>
                        item.producto._id ===
                        productoId
                );


            if (!item) {
                return;
            }


            cambiarCantidad(
                productoId,
                item.cantidad + 1
            );

        };


    const disminuirCantidad =
        (productoId) => {

            const item =
                carrito.find(
                    item =>
                        item.producto._id ===
                        productoId
                );


            if (!item) {
                return;
            }


            if (item.cantidad === 1) {

                eliminarProducto(
                    productoId
                );

                return;

            }


            cambiarCantidad(
                productoId,
                item.cantidad - 1
            );

        };


    const eliminarProducto =
        (productoId) => {

            setCarrito(
                carrito.filter(
                    item =>
                        item.producto._id !==
                        productoId
                )
            );

            setError("");

        };


    const limpiarVenta = () => {

        setCarrito([]);

        setMetodoPago("EFECTIVO");

        setBusqueda("");

        setError("");

    };


    const total =
        carrito.reduce(
            (acumulado, item) => {

                return (
                    acumulado
                    +
                    Number(
                        item.producto.precioVenta
                    )
                    *
                    item.cantidad
                );

            },
            0
        );


    const totalArticulos =
        carrito.reduce(
            (acumulado, item) =>
                acumulado +
                item.cantidad,
            0
        );


    const finalizarVenta = async () => {

        if (carrito.length === 0) {

            setError(
                "Agrega al menos un producto a la venta."
            );

            return;

        }


        const confirmar =
            window.confirm(
                `¿Deseas finalizar la venta por $${total.toLocaleString(
                    "es-MX",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}?`
            );


        if (!confirmar) {

            return;

        }


        try {

            setProcesando(true);

            setMensaje("");
            setError("");


            const datosVenta = {

                productos:
                    carrito.map(
                        item => ({

                            producto:
                                item.producto._id,

                            cantidad:
                                item.cantidad

                        })
                    ),

                metodoPago

            };


            const respuesta =
                await api.post(
                    "/ventas",
                    datosVenta
                );


            setMensaje(
                `Venta ${respuesta.data.venta.folio} registrada correctamente.`
            );


            setCarrito([]);

            setMetodoPago(
                "EFECTIVO"
            );


            await cargarDatos();


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje
                ||
                "No fue posible registrar la venta."
            );

        } finally {

            setProcesando(false);

        }

    };


    const formatoDinero = (valor) => {

        return Number(
            valor || 0
        ).toLocaleString(
            "es-MX",
            {
                style: "currency",
                currency: "MXN"
            }
        );

    };
    
    const alternarDetalleVenta = (ventaId) => {
    
        setVentaDetalleId(
            ventaDetalleId === ventaId
                ? null
                : ventaId
        );
    
    };
    
    
    const ventaDetalle =
        ventas.find(
            venta =>
                venta._id === ventaDetalleId
        );
    
    
    const abrirCancelacion = (venta) => {
    
        setVentaACancelar(venta);
    
        setMotivoCancelacion("");
    
        setError("");
        setMensaje("");
    
    };
    
    
    const cerrarCancelacion = () => {
    
        if (cancelando) {
            return;
        }
    
        setVentaACancelar(null);
    
        setMotivoCancelacion("");
    
    };
    
    
    const confirmarCancelacion =
    async (evento) => {
    
        evento.preventDefault();
    
    
        if (
            !motivoCancelacion.trim()
        ) {
        
            setError(
                "Debes indicar el motivo de la cancelación."
            );
        
            return;
        
        }
    
    
        try {
        
            setCancelando(true);
        
            setError("");
            setMensaje("");
        
        
            const respuesta =
                await api.put(
                    `/ventas/${ventaACancelar._id}/cancelar`,
                    {
                        motivo:
                            motivoCancelacion.trim()
                    }
                );
            
            
            setMensaje(
                `Venta ${respuesta.data.venta.folio} cancelada correctamente.`
            );
        
        
            const ventaId =
                ventaACancelar._id;
        
        
            setVentaACancelar(null);
        
            setMotivoCancelacion("");
        
        
            await cargarDatos();
        
        
            setVista("HISTORIAL");
        
            setVentaDetalleId(
                ventaId
            );
        
        
        } catch (error) {
        
            console.error(error);
        
            setError(
                error.response?.data?.mensaje
                ||
                "No fue posible cancelar la venta."
            );
        
        } finally {
        
            setCancelando(false);
        
        }
    
    };
    

    return (

        <section className="ventas-page">

            <div className="ventas-encabezado">

                <div>

                    <h1>
                        Ventas
                    </h1>

                    <p>
                        Registra ventas y consulta el historial de LuckyTech.
                    </p>

                </div>


                <div className="ventas-tabs">

                    <button
                        type="button"
                        className={
                            vista === "NUEVA"
                                ? "venta-tab venta-tab-activo"
                                : "venta-tab"
                        }
                        onClick={() =>
                            setVista("NUEVA")
                        }
                    >
                        Nueva venta
                    </button>


                    <button
                        type="button"
                        className={
                            vista === "HISTORIAL"
                                ? "venta-tab venta-tab-activo"
                                : "venta-tab"
                        }
                        onClick={() =>
                            setVista("HISTORIAL")
                        }
                    >
                        Historial
                    </button>

                </div>

            </div>


            {
                mensaje &&
                <div className="venta-mensaje-exito">
                    {mensaje}
                </div>
            }


            {
                error &&
                <div className="venta-mensaje-error">
                    {error}
                </div>
            }


            {
                cargando
                    ?
                    (
                        <div className="ventas-cargando">
                            Cargando ventas...
                        </div>
                    )
                    :
                    vista === "NUEVA"
                        ?
                        (

                            <div className="punto-venta">

                                <div className="catalogo-venta">

                                    <div className="catalogo-titulo">

                                        <div>

                                            <h2>
                                                Productos
                                            </h2>

                                            <p>
                                                Selecciona los productos que deseas vender.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="buscador-venta">

                                        <span>
                                            🔎
                                        </span>

                                        <input
                                            type="text"
                                            value={busqueda}
                                            onChange={
                                                evento =>
                                                    setBusqueda(
                                                        evento.target.value
                                                    )
                                            }
                                            placeholder="Buscar por código, producto, marca o categoría..."
                                        />

                                    </div>


                                    <div className="lista-productos-venta">

                                        {
                                            productosDisponibles.length === 0
                                                ?
                                                (
                                                    <div className="ventas-vacio">
                                                        No se encontraron productos.
                                                    </div>
                                                )
                                                :
                                                productosDisponibles.map(
                                                    producto => (

                                                        <button
                                                            type="button"
                                                            className={
                                                                producto.stock > 0
                                                                    ? "producto-venta"
                                                                    : "producto-venta producto-sin-stock"
                                                            }
                                                            key={producto._id}
                                                            disabled={
                                                                producto.stock <= 0
                                                            }
                                                            onClick={() =>
                                                                agregarProducto(
                                                                    producto
                                                                )
                                                            }
                                                        >

                                                            <div className="producto-venta-info">

                                                                <strong>
                                                                    {producto.nombre}
                                                                </strong>

                                                                <span>
                                                                    {producto.codigo}
                                                                    {
                                                                        producto.marca
                                                                            ?
                                                                            ` · ${producto.marca}`
                                                                            :
                                                                            ""
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div className="producto-venta-datos">

                                                                <strong>
                                                                    {
                                                                        formatoDinero(
                                                                            producto.precioVenta
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span
                                                                    className={
                                                                        producto.stock <=
                                                                        producto.stockMinimo

                                                                            ?
                                                                            "stock-venta stock-venta-bajo"

                                                                            :
                                                                            "stock-venta"
                                                                    }
                                                                >
                                                                    Stock: {producto.stock}
                                                                </span>

                                                            </div>

                                                        </button>

                                                    )
                                                )
                                        }

                                    </div>

                                </div>


                                <div className="carrito-venta">

                                    <div className="carrito-titulo">

                                        <div>

                                            <h2>
                                                Venta actual
                                            </h2>

                                            <p>
                                                {totalArticulos} {
                                                    totalArticulos === 1
                                                        ? "artículo"
                                                        : "artículos"
                                                }
                                            </p>

                                        </div>


                                        {
                                            carrito.length > 0 &&
                                            <button
                                                type="button"
                                                className="btn-limpiar-venta"
                                                onClick={limpiarVenta}
                                            >
                                                Limpiar
                                            </button>
                                        }

                                    </div>


                                    {
                                        carrito.length === 0
                                            ?
                                            (
                                                <div className="carrito-vacio">

                                                    <span>
                                                        🛒
                                                    </span>

                                                    <strong>
                                                        Venta vacía
                                                    </strong>

                                                    <p>
                                                        Selecciona productos del catálogo para comenzar.
                                                    </p>

                                                </div>
                                            )
                                            :
                                            (

                                                <div className="carrito-productos">

                                                    {
                                                        carrito.map(
                                                            item => (

                                                                <div
                                                                    className="carrito-item"
                                                                    key={
                                                                        item.producto._id
                                                                    }
                                                                >

                                                                    <div className="carrito-item-superior">

                                                                        <div>

                                                                            <strong>
                                                                                {
                                                                                    item.producto.nombre
                                                                                }
                                                                            </strong>

                                                                            <span>
                                                                                {
                                                                                    item.producto.codigo
                                                                                }
                                                                            </span>

                                                                        </div>


                                                                        <button
                                                                            type="button"
                                                                            className="btn-eliminar-carrito"
                                                                            onClick={() =>
                                                                                eliminarProducto(
                                                                                    item.producto._id
                                                                                )
                                                                            }
                                                                        >
                                                                            ×
                                                                        </button>

                                                                    </div>


                                                                    <div className="carrito-item-inferior">

                                                                        <div className="control-cantidad">

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    disminuirCantidad(
                                                                                        item.producto._id
                                                                                    )
                                                                                }
                                                                            >
                                                                                −
                                                                            </button>


                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                max={
                                                                                    item.producto.stock
                                                                                }
                                                                                value={
                                                                                    item.cantidad
                                                                                }
                                                                                onChange={
                                                                                    evento =>
                                                                                        cambiarCantidad(
                                                                                            item.producto._id,
                                                                                            evento.target.value
                                                                                        )
                                                                                }
                                                                            />


                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    aumentarCantidad(
                                                                                        item.producto._id
                                                                                    )
                                                                                }
                                                                            >
                                                                                +
                                                                            </button>

                                                                        </div>


                                                                        <div className="carrito-subtotal">

                                                                            <span>
                                                                                {
                                                                                    formatoDinero(
                                                                                        item.producto.precioVenta
                                                                                    )
                                                                                }
                                                                                {" × "}
                                                                                {item.cantidad}
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    formatoDinero(
                                                                                        Number(
                                                                                            item.producto.precioVenta
                                                                                        )
                                                                                        *
                                                                                        item.cantidad
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                    }


                                    <div className="pago-venta">

                                        <label>
                                            Método de pago
                                        </label>

                                        <select
                                            value={metodoPago}
                                            onChange={
                                                evento =>
                                                    setMetodoPago(
                                                        evento.target.value
                                                    )
                                            }
                                        >

                                            <option value="EFECTIVO">
                                                Efectivo
                                            </option>

                                            <option value="TARJETA">
                                                Tarjeta
                                            </option>

                                            <option value="TRANSFERENCIA">
                                                Transferencia
                                            </option>

                                        </select>

                                    </div>


                                    <div className="total-venta">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatoDinero(total)}
                                        </strong>

                                    </div>


                                    <button
                                        type="button"
                                        className="btn-finalizar-venta"
                                        onClick={finalizarVenta}
                                        disabled={
                                            carrito.length === 0
                                            ||
                                            procesando
                                        }
                                    >
                                        {
                                            procesando
                                                ?
                                                "Procesando venta..."
                                                :
                                                "Finalizar venta"
                                        }
                                    </button>

                                </div>

                            </div>

                        )
                        :
                        (

                            <div className="historial-ventas">

                                <div className="historial-titulo">

                                    <div>

                                        <h2>
                                            Historial de ventas
                                        </h2>

                                        <p>
                                            {ventas.length} {
                                                ventas.length === 1
                                                    ? "venta registrada"
                                                    : "ventas registradas"
                                            }
                                        </p>

                                    </div>

                                </div>


                                {
                                    ventas.length === 0
                                        ?
                                        (
                                            <div className="ventas-vacio">
                                                Todavía no hay ventas registradas.
                                            </div>
                                        )
                                        :
                                        (

                                            <div className="tabla-ventas-contenedor">

                                                <table className="tabla-ventas">

                                                    <thead>

                                                        <tr>

                                                            <th>
                                                                Folio
                                                            </th>

                                                            <th>
                                                                Productos
                                                            </th>

                                                            <th>
                                                                Pago
                                                            </th>

                                                            <th>
                                                                Total
                                                            </th>

                                                            <th>
                                                                Usuario
                                                            </th>

                                                            <th>
                                                                Fecha
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
                                                            ventas.map(
                                                                venta => (

                                                                    <tr
                                                                        key={
                                                                            venta._id
                                                                        }
                                                                    >

                                                                        <td>

                                                                            <span className="folio-venta">
                                                                                {venta.folio}
                                                                            </span>

                                                                        </td>


                                                                        <td>

                                                                            <div className="detalle-productos-venta">

                                                                                {
                                                                                    venta.productos.map(
                                                                                        (
                                                                                            detalle,
                                                                                            index
                                                                                        ) => (

                                                                                            <span
                                                                                                key={
                                                                                                    `${venta._id}-${index}`
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    detalle.cantidad
                                                                                                }
                                                                                                {" × "}
                                                                                                {
                                                                                                    detalle.nombre
                                                                                                }
                                                                                            </span>

                                                                                        )
                                                                                    )
                                                                                }

                                                                            </div>

                                                                        </td>


                                                                        <td>
                                                                            {venta.metodoPago}
                                                                        </td>


                                                                        <td>

                                                                            <strong>
                                                                                {
                                                                                    formatoDinero(
                                                                                        venta.total
                                                                                    )
                                                                                }
                                                                            </strong>

                                                                        </td>


                                                                        <td>

                                                                            {
                                                                                venta.usuario?.nombre
                                                                                ||
                                                                                "Usuario no disponible"
                                                                            }

                                                                        </td>


                                                                        <td>

                                                                            {
                                                                                new Date(
                                                                                    venta.createdAt
                                                                                ).toLocaleString(
                                                                                    "es-MX",
                                                                                    {
                                                                                        dateStyle:
                                                                                            "short",
                                                                                        timeStyle:
                                                                                            "short"
                                                                                    }
                                                                                )
                                                                            }

                                                                        </td>


                                                                        <td>

                                                                            <span
                                                                                className={
                                                                                    venta.estado ===
                                                                                    "COMPLETADA"

                                                                                        ?
                                                                                        "estado-venta estado-completada"

                                                                                        :
                                                                                        "estado-venta estado-cancelada"
                                                                                }
                                                                            >
                                                                                {venta.estado}
                                                                            </span>

                                                                        </td>

                                                                        <td>

                                                                            <button
                                                                                type="button"
                                                                                className="btn-detalle-venta"
                                                                                onClick={() =>
                                                                                    alternarDetalleVenta(
                                                                                        venta._id
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    ventaDetalleId ===
                                                                                    venta._id
                                                                                        ? "Ocultar"
                                                                                        : "Ver detalle"
                                                                                }
                                                                            </button>
                                                                            
                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )
                                                        }

                                                    </tbody>

                                                </table>

                                            </div>

                                        )
                                }

                                {
                                    ventaDetalle &&
                                    <div className="venta-detalle-panel">
                                    
                                        <div className="venta-detalle-encabezado">
                                
                                            <div>
                                                <h3>Detalle de venta</h3>
                                
                                                <span className="folio-venta">
                                                    {ventaDetalle.folio}
                                                </span>
                                            </div>
                                
                                            <span
                                                className={
                                                    ventaDetalle.estado === "COMPLETADA"
                                                        ? "estado-venta estado-completada"
                                                        : "estado-venta estado-cancelada"
                                                }
                                            >
                                                {ventaDetalle.estado}
                                            </span>
                                            
                                        </div>
                                            
                                            
                                        <div className="venta-detalle-grid">
                                            
                                            <div>
                                                <span>Fecha</span>
                                            
                                                <strong>
                                                    {
                                                        new Date(
                                                            ventaDetalle.createdAt
                                                        ).toLocaleString(
                                                            "es-MX",
                                                            {
                                                                dateStyle: "medium",
                                                                timeStyle: "short"
                                                            }
                                                        )
                                                    }
                                                </strong>
                                            </div>
                                                
                                                
                                            <div>
                                                <span>Vendedor</span>
                                                
                                                <strong>
                                                    {
                                                        ventaDetalle.usuario?.nombre
                                                        ||
                                                        "Usuario no disponible"
                                                    }
                                                </strong>
                                            </div>
                                                
                                                
                                            <div>
                                                <span>Método de pago</span>
                                                
                                                <strong>
                                                    {ventaDetalle.metodoPago}
                                                </strong>
                                            </div>
                                                
                                                
                                            <div>
                                                <span>Total</span>
                                                
                                                <strong className="venta-detalle-total">
                                                    {
                                                        formatoDinero(
                                                            ventaDetalle.total
                                                        )
                                                    }
                                                </strong>
                                            </div>
                                                
                                        </div>
                                                
                                                
                                        <div className="venta-detalle-productos">
                                                
                                            <h4>Productos</h4>
                                                
                                            {
                                                ventaDetalle.productos.map(
                                                    (detalle, index) => (
                                                    
                                                        <div
                                                            className="venta-detalle-producto"
                                                            key={`${ventaDetalle._id}-${index}`}
                                                        >
                                                        
                                                            <div>
                                                                <strong>
                                                                    {detalle.nombre}
                                                                </strong>
                                                    
                                                                <span>
                                                                    {detalle.codigo}
                                                                </span>
                                                            </div>
                                                    
                                                    
                                                            <div>
                                                                <span>Cantidad</span>
                                                    
                                                                <strong>
                                                                    {detalle.cantidad}
                                                                </strong>
                                                            </div>
                                                    
                                                    
                                                            <div>
                                                                <span>Precio unitario</span>
                                                    
                                                                <strong>
                                                                    {
                                                                        formatoDinero(
                                                                            detalle.precioUnitario
                                                                        )
                                                                    }
                                                                </strong>
                                                            </div>
                                                                
                                                                
                                                            <div>
                                                                <span>Subtotal</span>
                                                                
                                                                <strong>
                                                                    {
                                                                        formatoDinero(
                                                                            detalle.subtotal
                                                                        )
                                                                    }
                                                                </strong>
                                                            </div>
                                                                
                                                        </div>

                                                    )
                                                )
                                            }

                                        </div>
                                        
                                        
                                        {
                                            ventaDetalle.estado === "CANCELADA"
                                            &&
                                            <div className="venta-cancelacion-info">
                                            
                                                <h4>
                                                    Información de cancelación
                                                </h4>
                                        
                                                <div className="venta-detalle-grid">
                                        
                                                    <div>
                                                        <span>Motivo</span>
                                        
                                                        <strong>
                                                            {
                                                                ventaDetalle.motivoCancelacion
                                                                ||
                                                                "Sin motivo"
                                                            }
                                                        </strong>
                                                    </div>
                                                        
                                                        
                                                    <div>
                                                        <span>Cancelada por</span>
                                                        
                                                        <strong>
                                                            {
                                                                ventaDetalle.canceladaPor?.nombre
                                                                ||
                                                                "Usuario no disponible"
                                                            }
                                                        </strong>
                                                    </div>
                                                        
                                                        
                                                    <div>
                                                        <span>
                                                            Fecha de cancelación
                                                        </span>
                                                        
                                                        <strong>
                                                            {
                                                                ventaDetalle.fechaCancelacion
                                                                    ?
                                                                    new Date(
                                                                        ventaDetalle.fechaCancelacion
                                                                    ).toLocaleString(
                                                                        "es-MX",
                                                                        {
                                                                            dateStyle: "medium",
                                                                            timeStyle: "short"
                                                                        }
                                                                    )
                                                                    :
                                                                    "No disponible"
                                                            }
                                                        </strong>
                                                    </div>
                                                        
                                                </div>
                                                        
                                            </div>
                                        }

                                    
                                        {
                                            esAdmin
                                            &&
                                            ventaDetalle.estado === "COMPLETADA"
                                            &&
                                            <div className="venta-detalle-acciones">
                                            
                                                <button
                                                    type="button"
                                                    className="btn-cancelar-venta"
                                                    onClick={() =>
                                                        abrirCancelacion(
                                                            ventaDetalle
                                                        )
                                                    }
                                                >
                                                    Cancelar venta
                                                </button>
                                                
                                            </div>
                                        }

                                    </div>
                                }

                            </div>

                        )
            }

            {
                ventaACancelar &&
                <div
                    className="modal-cancelacion-fondo"
                    role="dialog"
                    aria-modal="true"
                >
                
                    <form
                        className="modal-cancelacion"
                        onSubmit={confirmarCancelacion}
                    >
                    
                        <div>
            
                            <h2>
                                Cancelar venta
                            </h2>
            
                            <p>
                                Esta operación devolverá los productos al inventario.
                            </p>
            
                        </div>
            
            
                        <div className="cancelacion-resumen">
            
                            <span>Folio</span>
            
                            <strong>
                                {ventaACancelar.folio}
                            </strong>
            
            
                            <span>Total</span>
            
                            <strong>
                                {
                                    formatoDinero(
                                        ventaACancelar.total
                                    )
                                }
                            </strong>
                            
                        </div>
                            
                            
                        <div className="campo-motivo-cancelacion">
                            
                            <label>
                                Motivo de cancelación *
                            </label>
                            
                            <textarea
                                value={motivoCancelacion}
                                onChange={
                                    evento =>
                                        setMotivoCancelacion(
                                            evento.target.value
                                        )
                                }
                                placeholder="Ej. Cliente solicitó devolución"
                                rows="4"
                                required
                            />
            
                        </div>
                            
                            
                        <div className="modal-cancelacion-acciones">
                            
                            <button
                                type="button"
                                className="btn-cerrar-cancelacion"
                                onClick={cerrarCancelacion}
                                disabled={cancelando}
                            >
                                Volver
                            </button>
                            
                            
                            <button
                                type="submit"
                                className="btn-confirmar-cancelacion"
                                disabled={cancelando}
                            >
                                {
                                    cancelando
                                        ?
                                        "Cancelando..."
                                        :
                                        "Confirmar cancelación"
                                }
                            </button>
                            
                        </div>
                            
                    </form>
                            
                </div>
            }
            
        </section>

    );

}


export default Ventas;
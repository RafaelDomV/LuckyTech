import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Inventario.css";


const formularioInicial = {
    tipo: "ENTRADA",
    producto: "",
    cantidad: "",
    motivo: ""
};


function Inventario() {

    const [movimientos, setMovimientos] = useState([]);
    const [productos, setProductos] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] =
        useState(false);

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [busqueda, setBusqueda] =
        useState("");

    const [cargando, setCargando] =
        useState(true);

    const [guardando, setGuardando] =
        useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");


    const usuario = (() => {

        try {

            return JSON.parse(
                localStorage.getItem("usuario")
            );

        } catch {

            return null;

        }

    })();


    const esAdmin =
        usuario?.rol === "ADMIN";


    useEffect(() => {

        cargarDatos();

    }, []);


    const cargarDatos = async () => {

        try {

            setCargando(true);

            const [
                respuestaMovimientos,
                respuestaProductos
            ] = await Promise.all([

                api.get("/inventario"),

                api.get("/productos")

            ]);


            setMovimientos(
                respuestaMovimientos.data
            );


            setProductos(
                respuestaProductos.data
            );


        } catch (error) {

            console.error(error);

            setError(
                "No fue posible cargar el inventario."
            );

        } finally {

            setCargando(false);

        }

    };


    const abrirFormulario = () => {

        setFormulario(
            formularioInicial
        );

        setMostrarFormulario(true);

        setMensaje("");
        setError("");

    };


    const cancelarFormulario = () => {

        setMostrarFormulario(false);

        setFormulario(
            formularioInicial
        );

        setError("");

    };


    const cambiarCampo = (evento) => {

        const {
            name,
            value
        } = evento.target;


        if (name === "tipo") {

            setFormulario({
                ...formulario,
                tipo: value,
                cantidad: ""
            });

            return;

        }


        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    const productoSeleccionado =
        productos.find(
            producto =>
                producto._id ===
                formulario.producto
        );


    const registrarMovimiento =
        async (evento) => {

            evento.preventDefault();

            setGuardando(true);
            setMensaje("");
            setError("");


            try {

                const cantidad =
                    Number(
                        formulario.cantidad
                    );


                if (
                    formulario.tipo !== "AJUSTE"
                    &&
                    cantidad <= 0
                ) {

                    setError(
                        "La cantidad debe ser mayor a cero."
                    );

                    setGuardando(false);

                    return;

                }


                if (
                    formulario.tipo === "AJUSTE"
                    &&
                    cantidad === 0
                ) {

                    setError(
                        "El ajuste no puede ser cero."
                    );

                    setGuardando(false);

                    return;

                }


                const datos = {

                    producto:
                        formulario.producto,

                    cantidad,

                    motivo:
                        formulario.motivo.trim()

                };


                let endpoint = "";


                if (
                    formulario.tipo === "ENTRADA"
                ) {

                    endpoint =
                        "/inventario/entrada";

                }


                if (
                    formulario.tipo === "SALIDA"
                ) {

                    endpoint =
                        "/inventario/salida";

                }


                if (
                    formulario.tipo === "AJUSTE"
                ) {

                    endpoint =
                        "/inventario/ajuste";

                }


                await api.post(
                    endpoint,
                    datos
                );


                setMensaje(
                    `${formulario.tipo} registrada correctamente.`
                );


                setFormulario(
                    formularioInicial
                );

                setMostrarFormulario(false);


                await cargarDatos();


            } catch (error) {

                console.error(error);


                setError(
                    error.response?.data?.mensaje
                    ||
                    "No fue posible registrar el movimiento."
                );


            } finally {

                setGuardando(false);

            }

        };


    const movimientosFiltrados =
        useMemo(() => {

            const texto =
                busqueda
                    .trim()
                    .toLowerCase();


            if (!texto) {

                return movimientos;

            }


            return movimientos.filter(
                movimiento => {

                    const producto =
                        movimiento.producto?.nombre
                        || "";

                    const codigo =
                        movimiento.producto?.codigo
                        || "";

                    const usuario =
                        movimiento.usuario?.nombre
                        || "";

                    const motivo =
                        movimiento.motivo
                        || "";

                    const tipo =
                        movimiento.tipo
                        || "";


                    return (

                        producto
                            .toLowerCase()
                            .includes(texto)

                        ||

                        codigo
                            .toLowerCase()
                            .includes(texto)

                        ||

                        usuario
                            .toLowerCase()
                            .includes(texto)

                        ||

                        motivo
                            .toLowerCase()
                            .includes(texto)

                        ||

                        tipo
                            .toLowerCase()
                            .includes(texto)

                    );

                }

            );

        }, [movimientos, busqueda]);


    const productosActivos =
        productos.filter(
            producto =>
                producto.activo !== false
        );


    return (

        <div className="inventario-page">

            <div className="inventario-encabezado">

                <div>

                    <h1 className="inventario-titulo">
                        Inventario
                    </h1>

                    <p className="inventario-subtitulo">
                        Registra entradas, salidas y consulta el historial de movimientos.
                    </p>

                </div>


                <button
                    className="btn-nuevo-movimiento"
                    onClick={abrirFormulario}
                >
                    + Nuevo movimiento
                </button>

            </div>


            {
                mensaje &&
                <div className="inventario-mensaje-exito">
                    {mensaje}
                </div>
            }


            {
                error &&
                <div className="inventario-mensaje-error">
                    {error}
                </div>
            }


            {
                mostrarFormulario &&
                <form
                    className="movimiento-formulario"
                    onSubmit={registrarMovimiento}
                >

                    <div className="movimiento-form-titulo">

                        <h2>
                            Registrar movimiento
                        </h2>

                        <p>
                            Selecciona el tipo de movimiento y el producto.
                        </p>

                    </div>


                    <div className="movimiento-grid">

                        <div className="inventario-campo">

                            <label>
                                Tipo de movimiento *
                            </label>

                            <select
                                name="tipo"
                                value={formulario.tipo}
                                onChange={cambiarCampo}
                                required
                            >

                                <option value="ENTRADA">
                                    Entrada
                                </option>

                                <option value="SALIDA">
                                    Salida
                                </option>

                                {
                                    esAdmin &&
                                    <option value="AJUSTE">
                                        Ajuste
                                    </option>
                                }

                            </select>

                        </div>


                        <div className="inventario-campo inventario-campo-doble">

                            <label>
                                Producto *
                            </label>

                            <select
                                name="producto"
                                value={formulario.producto}
                                onChange={cambiarCampo}
                                required
                            >

                                <option value="">
                                    Selecciona un producto
                                </option>

                                {
                                    productosActivos.map(
                                        producto => (

                                            <option
                                                key={producto._id}
                                                value={producto._id}
                                            >
                                                {producto.codigo} - {producto.nombre}
                                            </option>

                                        )
                                    )
                                }

                            </select>

                        </div>


                        <div className="inventario-campo">

                            <label>
                                Stock actual
                            </label>

                            <div
                                className={
                                    productoSeleccionado
                                        ? "stock-actual"
                                        : "stock-actual stock-sin-producto"
                                }
                            >

                                {
                                    productoSeleccionado
                                        ?
                                        `${productoSeleccionado.stock} unidades`
                                        :
                                        "Selecciona un producto"
                                }

                            </div>

                        </div>


                        <div className="inventario-campo">

                            <label>
                                Cantidad *
                            </label>

                            <input
                                type="number"
                                name="cantidad"
                                value={formulario.cantidad}
                                onChange={cambiarCampo}
                                step="1"
                                min={
                                    formulario.tipo === "AJUSTE"
                                        ? undefined
                                        : "1"
                                }
                                placeholder={
                                    formulario.tipo === "AJUSTE"
                                        ? "Ej. 5 o -5"
                                        : "Ej. 10"
                                }
                                required
                            />

                            {
                                formulario.tipo === "AJUSTE" &&
                                <small className="ayuda-ajuste">
                                    Usa un número positivo para aumentar y negativo para disminuir.
                                </small>
                            }

                        </div>


                        <div className="inventario-campo inventario-campo-motivo">

                            <label>
                                Motivo *
                            </label>

                            <input
                                type="text"
                                name="motivo"
                                value={formulario.motivo}
                                onChange={cambiarCampo}
                                placeholder={
                                    formulario.tipo === "ENTRADA"
                                        ?
                                        "Ej. Compra a proveedor"
                                        :
                                        formulario.tipo === "SALIDA"
                                            ?
                                            "Ej. Venta o consumo"
                                            :
                                            "Ej. Diferencia de inventario físico"
                                }
                                required
                            />

                        </div>

                    </div>


                    {
                        productoSeleccionado &&
                        <div className="resumen-movimiento">

                            <div>

                                <span>
                                    Producto
                                </span>

                                <strong>
                                    {productoSeleccionado.nombre}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Stock actual
                                </span>

                                <strong>
                                    {productoSeleccionado.stock}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Movimiento
                                </span>

                                <strong>
                                    {formulario.tipo}
                                </strong>

                            </div>

                        </div>
                    }


                    <div className="movimiento-acciones">

                        <button
                            type="button"
                            className="btn-cancelar-movimiento"
                            onClick={cancelarFormulario}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="btn-registrar-movimiento"
                            disabled={guardando}
                        >
                            {
                                guardando
                                    ?
                                    "Registrando..."
                                    :
                                    "Registrar movimiento"
                            }
                        </button>

                    </div>

                </form>
            }


            <div className="inventario-herramientas">

                <div className="buscador-inventario">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar por producto, código, tipo, motivo o usuario..."
                        value={busqueda}
                        onChange={
                            evento =>
                                setBusqueda(
                                    evento.target.value
                                )
                        }
                    />

                </div>


                <div className="contador-movimientos">

                    {movimientosFiltrados.length}

                    {
                        movimientosFiltrados.length === 1
                            ?
                            " movimiento"
                            :
                            " movimientos"
                    }

                </div>

            </div>


            <div className="tabla-inventario-contenedor">

                {
                    cargando
                        ?
                        (
                            <div className="estado-inventario">
                                Cargando movimientos...
                            </div>
                        )
                        :
                        movimientosFiltrados.length === 0
                            ?
                            (
                                <div className="estado-inventario">
                                    No se encontraron movimientos.
                                </div>
                            )
                            :
                            (

                                <table className="tabla-inventario">

                                    <thead>

                                        <tr>

                                            <th>
                                                Producto
                                            </th>

                                            <th>
                                                Tipo
                                            </th>

                                            <th>
                                                Cantidad
                                            </th>

                                            <th>
                                                Motivo
                                            </th>

                                            <th>
                                                Usuario
                                            </th>

                                            <th>
                                                Fecha
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            movimientosFiltrados.map(
                                                movimiento => (

                                                    <tr
                                                        key={movimiento._id}
                                                    >

                                                        <td>

                                                            <div className="movimiento-producto">
                                                                {
                                                                    movimiento.producto?.nombre
                                                                    ||
                                                                    "Producto no disponible"
                                                                }
                                                            </div>

                                                            {
                                                                movimiento.producto?.codigo &&
                                                                <div className="movimiento-codigo">
                                                                    {movimiento.producto.codigo}
                                                                </div>
                                                            }

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `tipo-movimiento tipo-${movimiento.tipo?.toLowerCase()}`
                                                                }
                                                            >
                                                                {movimiento.tipo}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    movimiento.cantidad < 0
                                                                        ?
                                                                        "cantidad-movimiento cantidad-negativa"
                                                                        :
                                                                        "cantidad-movimiento"
                                                                }
                                                            >

                                                                {
                                                                    movimiento.tipo === "ENTRADA"
                                                                    &&
                                                                    movimiento.cantidad > 0
                                                                        ?
                                                                        `+${movimiento.cantidad}`
                                                                        :
                                                                        movimiento.tipo === "SALIDA"
                                                                            ?
                                                                            `-${Math.abs(movimiento.cantidad)}`
                                                                            :
                                                                            movimiento.cantidad > 0
                                                                                ?
                                                                                `+${movimiento.cantidad}`
                                                                                :
                                                                                movimiento.cantidad
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>
                                                            {movimiento.motivo}
                                                        </td>


                                                        <td>

                                                            {
                                                                movimiento.usuario?.nombre
                                                                ||
                                                                "Usuario no disponible"
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                new Date(
                                                                    movimiento.createdAt
                                                                ).toLocaleString(
                                                                    "es-MX",
                                                                    {
                                                                        dateStyle: "short",
                                                                        timeStyle: "short"
                                                                    }
                                                                )
                                                            }

                                                        </td>

                                                    </tr>

                                                )
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


export default Inventario;
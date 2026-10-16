import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useOutletContext
} from "react-router-dom";

import api from "../services/api";

import "./Dashboard.css";


const formatoDinero = (valor) => {

    return Number(valor || 0).toLocaleString(
        "es-MX",
        {
            style: "currency",
            currency: "MXN"
        }
    );

};


const formatoCompacto = (valor) => {

    return new Intl.NumberFormat(
        "es-MX",
        {
            notation: "compact",
            maximumFractionDigits: 1
        }
    ).format(valor || 0);

};


const obtenerFecha = (valor) => {

    if (!valor) {
        return null;
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return null;
    }

    return fecha;

};


const esMismoDia = (fechaA, fechaB) => {

    return (
        fechaA.getFullYear() === fechaB.getFullYear()
        &&
        fechaA.getMonth() === fechaB.getMonth()
        &&
        fechaA.getDate() === fechaB.getDate()
    );

};


const formatoFecha = (valor) => {

    const fecha = obtenerFecha(valor);

    if (!fecha) {
        return "No disponible";
    }

    return fecha.toLocaleString(
        "es-MX",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

};


function Dashboard() {

    const { usuario } = useOutletContext();


    const rol = usuario?.rol;


    const esAdmin =
        rol === "ADMIN";

    const esInventario =
        rol === "INVENTARIO";

    const esVentas =
        rol === "VENTAS";


    const puedeVerProductos =
        esAdmin || esInventario;

    const puedeVerVentas =
        esAdmin || esVentas;


    const [productos, setProductos] =
        useState([]);

    const [ventas, setVentas] =
        useState([]);

    const [cargando, setCargando] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        let componenteActivo = true;


        const cargarDashboard = async () => {

            if (!rol) {

                setCargando(false);

                return;

            }


            try {

                setCargando(true);

                setError("");


                const [
                    respuestaProductos,
                    respuestaVentas
                ] = await Promise.all([

                    puedeVerProductos
                        ? api.get("/productos")
                        : Promise.resolve({
                            data: []
                        }),

                    puedeVerVentas
                        ? api.get("/ventas")
                        : Promise.resolve({
                            data: []
                        })

                ]);


                if (!componenteActivo) {
                    return;
                }


                setProductos(

                    Array.isArray(
                        respuestaProductos.data
                    )
                        ? respuestaProductos.data
                        : []

                );


                setVentas(

                    Array.isArray(
                        respuestaVentas.data
                    )
                        ? respuestaVentas.data
                        : []

                );


            } catch (error) {

                if (!componenteActivo) {
                    return;
                }


                console.error(
                    "Error al cargar el Dashboard:",
                    error
                );


                setError(

                    error.response?.data?.mensaje
                    ||
                    "No fue posible cargar las métricas del Dashboard."

                );


            } finally {

                if (componenteActivo) {

                    setCargando(false);

                }

            }

        };


        cargarDashboard();


        return () => {

            componenteActivo = false;

        };


    }, [
        rol,
        puedeVerProductos,
        puedeVerVentas
    ]);


    // =========================================
    // DATOS DE PRODUCTOS E INVENTARIO
    // =========================================

    const productosActivos = useMemo(() => {

        return productos.filter(

            producto =>
                producto.activo !== false

        );

    }, [productos]);


    const totalUnidadesInventario = useMemo(() => {

        return productosActivos.reduce(

            (total, producto) => {

                return (
                    total
                    +
                    Math.max(
                        0,
                        Number(producto.stock || 0)
                    )
                );

            },

            0

        );

    }, [productosActivos]);


    const productosStockBajo = useMemo(() => {

        return productosActivos

            .filter(producto => {

                const stock =
                    Number(producto.stock || 0);


                const stockMinimo =
                    Number(
                        producto.stockMinimo ?? 5
                    );


                return stock <= stockMinimo;

            })

            .sort((a, b) => {

                return (
                    Number(a.stock || 0)
                    -
                    Number(b.stock || 0)
                );

            });

    }, [productosActivos]);


    // =========================================
    // DATOS DE VENTAS
    // =========================================

    const ventasCompletadas = useMemo(() => {

        return ventas.filter(

            venta =>
                venta.estado === "COMPLETADA"

        );

    }, [ventas]);


    const hoy = new Date();


    const ventasHoy = ventasCompletadas.filter(

        venta => {

            const fecha =
                obtenerFecha(venta.createdAt);


            return (
                fecha
                &&
                esMismoDia(fecha, hoy)
            );

        }

    );


    const ventasMes = ventasCompletadas.filter(

        venta => {

            const fecha =
                obtenerFecha(venta.createdAt);


            return (

                fecha
                &&
                fecha.getMonth() === hoy.getMonth()
                &&
                fecha.getFullYear() === hoy.getFullYear()

            );

        }

    );


    const totalVentasHoy = ventasHoy.reduce(

        (total, venta) => {

            return (
                total
                +
                Number(venta.total || 0)
            );

        },

        0

    );


    const totalVentasMes = ventasMes.reduce(

        (total, venta) => {

            return (
                total
                +
                Number(venta.total || 0)
            );

        },

        0

    );


    // =========================================
    // VENTAS DE LOS ÚLTIMOS SIETE DÍAS
    // =========================================

    const datosUltimosSieteDias = useMemo(() => {

        const dias = [];


        const fechaActual = new Date();

        fechaActual.setHours(
            0,
            0,
            0,
            0
        );


        for (
            let desplazamiento = -6;
            desplazamiento <= 0;
            desplazamiento++
        ) {

            const fecha = new Date(fechaActual);


            fecha.setDate(

                fechaActual.getDate()
                +
                desplazamiento

            );


            const total = ventasCompletadas.reduce(

                (acumulado, venta) => {

                    const fechaVenta =
                        obtenerFecha(
                            venta.createdAt
                        );


                    if (
                        !fechaVenta
                        ||
                        !esMismoDia(
                            fechaVenta,
                            fecha
                        )
                    ) {

                        return acumulado;

                    }


                    return (

                        acumulado
                        +
                        Number(venta.total || 0)

                    );

                },

                0

            );


            dias.push({

                fecha,

                etiqueta:
                    fecha.toLocaleDateString(
                        "es-MX",
                        {
                            weekday: "short"
                        }
                    ).replace(".", ""),

                total

            });

        }


        return dias;

    }, [ventasCompletadas]);


    const maximoGrafica = Math.max(

        1,

        ...datosUltimosSieteDias.map(

            dia => dia.total

        )

    );


    // =========================================
    // ÚLTIMAS VENTAS
    // =========================================

    const ventasRecientes = useMemo(() => {

        return [...ventas]

            .sort((a, b) => {

                const fechaA =
                    obtenerFecha(a.createdAt)?.getTime()
                    || 0;


                const fechaB =
                    obtenerFecha(b.createdAt)?.getTime()
                    || 0;


                return fechaB - fechaA;

            })

            .slice(0, 5);

    }, [ventas]);


    // =========================================
    // ESTADOS DE CARGA Y ERROR
    // =========================================

    if (cargando) {

        return (

            <section className="dashboard-page">

                <div className="dashboard-estado">

                    <div className="dashboard-spinner"></div>

                    <p>
                        Cargando información de LuckyTech...
                    </p>

                </div>

            </section>

        );

    }


    if (error) {

        return (

            <section className="dashboard-page">

                <div className="dashboard-encabezado">

                    <div>

                        <h1>
                            Dashboard LuckyTech
                        </h1>

                        <p>
                            Resumen general del sistema.
                        </p>

                    </div>

                </div>


                <div className="dashboard-error">

                    <strong>
                        No se pudieron cargar los datos.
                    </strong>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Reintentar
                    </button>

                </div>

            </section>

        );

    }


    // =========================================
    // INTERFAZ DEL DASHBOARD
    // =========================================

    return (

        <section className="dashboard-page">


            {/* ENCABEZADO */}

            <header className="dashboard-encabezado">

                <div>

                    <span className="dashboard-etiqueta">

                        PANEL DE CONTROL

                    </span>


                    <h1>
                        Dashboard LuckyTech
                    </h1>


                    <p>

                        Bienvenido,{" "}

                        <strong>
                            {usuario?.nombre || "Usuario"}
                        </strong>

                        . Aquí tienes el resumen de tu sistema.

                    </p>

                </div>


                <div className="dashboard-rol">

                    <span className="dashboard-rol-indicador"></span>

                    {usuario?.rol || "USUARIO"}

                </div>

            </header>


            {/* MÉTRICAS */}

            <section className="dashboard-seccion">

                <div className="dashboard-titulo-seccion">

                    <div>

                        <h2>
                            Resumen general
                        </h2>

                        <p>
                            Información actualizada desde la base de datos.
                        </p>

                    </div>

                </div>


                <div className="dashboard-grid-metricas">


                    {/* MÉTRICAS DE VENTAS */}

                    {
                        puedeVerVentas && (

                            <>

                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-azul">

                                        $

                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Ventas de hoy
                                        </span>


                                        <strong>
                                            {formatoDinero(totalVentasHoy)}
                                        </strong>


                                        <small>

                                            {ventasHoy.length}{" "}

                                            {ventasHoy.length === 1
                                                ? "venta completada"
                                                : "ventas completadas"}

                                        </small>

                                    </div>

                                </article>


                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-verde">

                                        ↗

                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Ventas del mes
                                        </span>


                                        <strong>
                                            {formatoDinero(totalVentasMes)}
                                        </strong>


                                        <small>
                                            Importe acumulado del mes
                                        </small>

                                    </div>

                                </article>


                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-morado">

                                        #
                                        
                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Operaciones del mes
                                        </span>


                                        <strong>
                                            {ventasMes.length}
                                        </strong>


                                        <small>
                                            Ventas completadas
                                        </small>

                                    </div>

                                </article>

                            </>

                        )
                    }


                    {/* MÉTRICAS DE INVENTARIO */}

                    {
                        puedeVerProductos && (

                            <>

                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-azul">

                                        ▦

                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Productos activos
                                        </span>


                                        <strong>
                                            {productosActivos.length}
                                        </strong>


                                        <small>
                                            Productos disponibles en el catálogo
                                        </small>

                                    </div>

                                </article>


                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-verde">

                                        ▤

                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Unidades en inventario
                                        </span>


                                        <strong>
                                            {totalUnidadesInventario.toLocaleString("es-MX")}
                                        </strong>


                                        <small>
                                            Existencias de productos activos
                                        </small>

                                    </div>

                                </article>


                                <article className="dashboard-metrica">

                                    <div className="dashboard-metrica-icono dashboard-icono-rojo">

                                        !

                                    </div>


                                    <div className="dashboard-metrica-contenido">

                                        <span>
                                            Stock bajo
                                        </span>


                                        <strong>
                                            {productosStockBajo.length}
                                        </strong>


                                        <small>
                                            Productos que requieren revisión
                                        </small>

                                    </div>

                                </article>

                            </>

                        )
                    }


                </div>

            </section>


            {/* GRÁFICA Y ÚLTIMAS VENTAS */}

            {
                puedeVerVentas && (

                    <div className="dashboard-paneles">


                        {/* GRÁFICA */}

                        <section className="dashboard-panel">

                            <div className="dashboard-panel-encabezado">

                                <div>

                                    <h2>
                                        Actividad de ventas
                                    </h2>

                                    <p>
                                        Importe de ventas completadas durante los últimos siete días.
                                    </p>

                                </div>

                            </div>


                            <div className="dashboard-grafica">

                                {
                                    datosUltimosSieteDias.map(

                                        dia => {

                                            const porcentaje =

                                                dia.total === 0

                                                    ? 4

                                                    : Math.max(

                                                        8,

                                                        (
                                                            dia.total
                                                            /
                                                            maximoGrafica
                                                        ) * 100

                                                    );


                                            return (

                                                <div
                                                    className="dashboard-grafica-columna"
                                                    key={dia.fecha.toISOString()}
                                                >

                                                    <span className="dashboard-grafica-valor">

                                                        {formatoCompacto(dia.total)}

                                                    </span>


                                                    <div className="dashboard-grafica-area">

                                                        <div

                                                            className="dashboard-grafica-barra"

                                                            style={{
                                                                height: `${porcentaje}%`
                                                            }}

                                                        ></div>

                                                    </div>


                                                    <span className="dashboard-grafica-dia">

                                                        {dia.etiqueta}

                                                    </span>

                                                </div>

                                            );

                                        }

                                    )
                                }

                            </div>


                            <div className="dashboard-grafica-pie">

                                <span className="dashboard-grafica-leyenda"></span>

                                <span>
                                    Ventas completadas
                                </span>

                            </div>

                        </section>


                        {/* ÚLTIMAS VENTAS */}

                        <section className="dashboard-panel">

                            <div className="dashboard-panel-encabezado">

                                <div>

                                    <h2>
                                        Últimas ventas
                                    </h2>

                                    <p>
                                        Los cinco registros más recientes.
                                    </p>

                                </div>


                                <Link
                                    to="/ventas"
                                    className="dashboard-enlace"
                                >

                                    Ver todas

                                </Link>

                            </div>


                            <div className="dashboard-tabla-contenedor">

                                <table className="dashboard-tabla">

                                    <thead>

                                        <tr>

                                            <th>
                                                Folio
                                            </th>

                                            <th>
                                                Fecha
                                            </th>

                                            <th>
                                                Total
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {

                                            ventasRecientes.length === 0

                                                ? (

                                                    <tr>

                                                        <td
                                                            colSpan="4"
                                                            className="dashboard-tabla-vacia"
                                                        >

                                                            Todavía no hay ventas registradas.

                                                        </td>

                                                    </tr>

                                                )

                                                : (

                                                    ventasRecientes.map(

                                                        venta => {

                                                            const estado =

                                                                String(
                                                                    venta.estado || "SIN ESTADO"
                                                                ).toUpperCase();


                                                            return (

                                                                <tr key={venta._id}>

                                                                    <td>

                                                                        <strong>
                                                                            {venta.folio || "Sin folio"}
                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        {formatoFecha(venta.createdAt)}

                                                                    </td>


                                                                    <td>

                                                                        <strong>
                                                                            {formatoDinero(venta.total)}
                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        <span

                                                                            className={

                                                                                `dashboard-estado-venta dashboard-estado-${estado.toLowerCase()}`

                                                                            }

                                                                        >

                                                                            {estado}

                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            );

                                                        }

                                                    )

                                                )

                                        }

                                    </tbody>

                                </table>

                            </div>

                        </section>


                    </div>

                )

            }


            {/* PRODUCTOS CON STOCK BAJO */}

            {

                puedeVerProductos && (

                    <section className="dashboard-panel">

                        <div className="dashboard-panel-encabezado">

                            <div>

                                <h2>
                                    Productos que requieren atención
                                </h2>

                                <p>
                                    Existencias iguales o inferiores al stock mínimo.
                                </p>

                            </div>


                            <Link
                                to="/inventario"
                                className="dashboard-enlace"
                            >

                                Ir a inventario

                            </Link>

                        </div>


                        {

                            productosStockBajo.length === 0

                                ? (

                                    <div className="dashboard-sin-alertas">

                                        <span className="dashboard-sin-alertas-icono">

                                            ✓

                                        </span>


                                        <div>

                                            <strong>
                                                Sin alertas de stock
                                            </strong>

                                            <p>
                                                No hay productos activos por debajo de su nivel mínimo.
                                            </p>

                                        </div>

                                    </div>

                                )

                                : (

                                    <div className="dashboard-stock-lista">

                                        {

                                            productosStockBajo.slice(0, 5).map(

                                                producto => {

                                                    const stock =
                                                        Number(producto.stock || 0);


                                                    const stockMinimo =
                                                        Number(
                                                            producto.stockMinimo ?? 5
                                                        );


                                                    return (

                                                        <div
                                                            className="dashboard-stock-item"
                                                            key={producto._id}
                                                        >

                                                            <div className="dashboard-stock-producto">

                                                                <strong>
                                                                    {producto.nombre}
                                                                </strong>

                                                                <span>
                                                                    {producto.codigo || "Sin código"}
                                                                </span>

                                                            </div>


                                                            <div className="dashboard-stock-datos">

                                                                <span
                                                                    className={

                                                                        stock <= 0

                                                                            ? "dashboard-stock-cantidad dashboard-stock-agotado"

                                                                            : "dashboard-stock-cantidad"

                                                                    }
                                                                >

                                                                    {stock} unidades

                                                                </span>


                                                                <small>

                                                                    Mínimo: {stockMinimo}

                                                                </small>

                                                            </div>

                                                        </div>

                                                    );

                                                }

                                            )

                                        }


                                        {

                                            productosStockBajo.length > 5 && (

                                                <p className="dashboard-stock-mas">

                                                    Hay {productosStockBajo.length - 5} productos adicionales que requieren atención.

                                                </p>

                                            )

                                        }

                                    </div>

                                )

                        }

                    </section>

                )

            }


            {/* ACCESOS RÁPIDOS */}

            <section className="dashboard-seccion">

                <div className="dashboard-titulo-seccion">

                    <div>

                        <h2>
                            Accesos rápidos
                        </h2>

                        <p>
                            Selecciona el módulo que necesitas utilizar.
                        </p>

                    </div>

                </div>


                <div className="dashboard-accesos">


                    {/* ADMIN E INVENTARIO */}

                    {

                        (esAdmin || esInventario) && (

                            <>

                                <Link
                                    className="dashboard-acceso"
                                    to="/productos"
                                >

                                    <span className="dashboard-acceso-icono">
                                        ▦
                                    </span>

                                    <h3>
                                        Productos
                                    </h3>

                                    <p>
                                        Administra y consulta el catálogo de productos.
                                    </p>

                                    <span className="dashboard-acceso-flecha">
                                        →
                                    </span>

                                </Link>


                                <Link
                                    className="dashboard-acceso"
                                    to="/categorias"
                                >

                                    <span className="dashboard-acceso-icono">
                                        ▤
                                    </span>

                                    <h3>
                                        Categorías
                                    </h3>

                                    <p>
                                        Administra las categorías registradas.
                                    </p>

                                    <span className="dashboard-acceso-flecha">
                                        →
                                    </span>

                                </Link>


                                <Link
                                    className="dashboard-acceso"
                                    to="/inventario"
                                >

                                    <span className="dashboard-acceso-icono">
                                        ⇄
                                    </span>

                                    <h3>
                                        Inventario
                                    </h3>

                                    <p>
                                        Consulta existencias y registra movimientos.
                                    </p>

                                    <span className="dashboard-acceso-flecha">
                                        →
                                    </span>

                                </Link>

                            </>

                        )

                    }


                    {/* SOLO ADMIN */}

                    {

                        esAdmin && (

                            <Link
                                className="dashboard-acceso"
                                to="/usuarios"
                            >

                                <span className="dashboard-acceso-icono">
                                    ♙
                                </span>

                                <h3>
                                    Usuarios
                                </h3>

                                <p>
                                    Administra las cuentas y los permisos del sistema.
                                </p>

                                <span className="dashboard-acceso-flecha">
                                    →
                                </span>

                            </Link>

                        )

                    }


                    {/* ADMIN Y VENTAS */}

                    {

                        (esAdmin || esVentas) && (

                            <Link
                                className="dashboard-acceso"
                                to="/ventas"
                            >

                                <span className="dashboard-acceso-icono">
                                    $
                                </span>

                                <h3>
                                    Ventas
                                </h3>

                                <p>
                                    Registra ventas y consulta el historial.
                                </p>

                                <span className="dashboard-acceso-flecha">
                                    →
                                </span>

                            </Link>

                        )

                    }


                </div>

            </section>


        </section>

    );

}


export default Dashboard;
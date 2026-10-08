import {
    Link,
    useOutletContext
} from "react-router-dom";


function Dashboard() {

    const { usuario } = useOutletContext();


    const esAdmin =
        usuario?.rol === "ADMIN";

    const esInventario =
        usuario?.rol === "INVENTARIO";

    const esVentas =
        usuario?.rol === "VENTAS";


    return (

        <section>

            <h1>
                Dashboard LuckyTech
            </h1>


            <p>
                Bienvenido, {usuario.nombre}.
                Selecciona un módulo para comenzar.
            </p>


            <div className="dashboard-accesos">

                {/* ADMIN E INVENTARIO */}
                {
                    (esAdmin || esInventario) && (
                        <>

                            <Link
                                className="dashboard-acceso"
                                to="/productos"
                            >
                                <h2>
                                    Productos
                                </h2>

                                <p>
                                    Administra y consulta el catálogo de productos.
                                </p>
                            </Link>


                            <Link
                                className="dashboard-acceso"
                                to="/categorias"
                            >
                                <h2>
                                    Categorías
                                </h2>

                                <p>
                                    Administra las categorías registradas.
                                </p>
                            </Link>


                            <Link
                                className="dashboard-acceso"
                                to="/inventario"
                            >
                                <h2>
                                    Inventario
                                </h2>

                                <p>
                                    Consulta y registra movimientos de inventario.
                                </p>
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
                            <h2>
                                Usuarios
                            </h2>

                            <p>
                                Administra las cuentas y permisos del sistema.
                            </p>
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
                            <h2>
                                Ventas
                            </h2>

                            <p>
                                Registra y consulta las ventas de LuckyTech.
                            </p>
                        </Link>
                    )
                }

            </div>

        </section>

    );

}


export default Dashboard;
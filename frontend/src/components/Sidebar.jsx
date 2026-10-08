import { NavLink } from "react-router-dom";
import "./Sidebar.css";


function Sidebar({ usuario }) {

    const esAdmin =
        usuario?.rol === "ADMIN";

    const esInventario =
        usuario?.rol === "INVENTARIO";

    const esVentas =
        usuario?.rol === "VENTAS";


    return (

        <aside className="sidebar">

            <h2>
                LuckyTech
            </h2>


            <nav aria-label="Menú principal">

                {/* TODOS LOS USUARIOS */}
                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>


                {/* ADMIN E INVENTARIO */}
                {
                    (esAdmin || esInventario) && (
                        <>
                            <NavLink to="/productos">
                                Productos
                            </NavLink>

                            <NavLink to="/categorias">
                                Categorías
                            </NavLink>

                            <NavLink to="/inventario">
                                Inventario
                            </NavLink>
                        </>
                    )
                }


                {/* SOLO ADMIN */}
                {
                    esAdmin && (
                        <NavLink to="/usuarios">
                            Usuarios
                        </NavLink>
                    )
                }


                {/* ADMIN Y VENTAS */}
                {
                    (esAdmin || esVentas) && (
                        <NavLink to="/ventas">
                            Ventas
                        </NavLink>
                    )
                }

            </nav>

        </aside>

    );

}


export default Sidebar;
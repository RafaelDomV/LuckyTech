import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../context/AuthContext";


function Sidebar() {

    const { usuario } = useAuth();


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


                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>


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



                {
                    esAdmin && (

                        <NavLink to="/usuarios">
                            Usuarios
                        </NavLink>

                    )
                }



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
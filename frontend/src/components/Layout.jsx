import {
    Outlet,
    useOutletContext,
    useNavigate
} from "react-router-dom";

import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout() {
    const { usuario } = useOutletContext();
    const navigate = useNavigate();

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        navigate("/", { replace: true });
    };

    return (
        <div className="layout">
            <Sidebar usuario={usuario} />

            <main className="content">
                <header className="layout-header">
                    <div>
                        <strong>{usuario.nombre}</strong>
                        <p>Rol: {usuario.rol}</p>
                    </div>

                    <button
                        type="button"
                        onClick={cerrarSesion}
                    >
                        Cerrar sesión
                    </button>
                </header>

                <Outlet context={{ usuario }} />
            </main>
        </div>
    );
}

export default Layout;
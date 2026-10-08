import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useLocation
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";
import Ventas from "./pages/Ventas";

import RutaProtegida from "./components/RutaProtegida";
import Layout from "./components/Layout";


function RutasAplicacion() {

    const { pathname } = useLocation();


    return (
        <Routes>

            {/* LOGIN */}
            <Route
                path="/"
                element={<Login />}
            />


            {/* DASHBOARD: CUALQUIER USUARIO AUTENTICADO */}
            <Route
                element={
                    <RutaProtegida
                        key={`${pathname}-general`}
                    />
                }
            >
                <Route element={<Layout />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                </Route>
            </Route>


            {/* ADMIN E INVENTARIO */}
            <Route
                element={
                    <RutaProtegida
                        key={`${pathname}-inventario`}
                        roles={[
                            "ADMIN",
                            "INVENTARIO"
                        ]}
                    />
                }
            >
                <Route element={<Layout />}>

                    <Route
                        path="/productos"
                        element={<Productos />}
                    />

                    <Route
                        path="/categorias"
                        element={<Categorias />}
                    />

                    <Route
                        path="/inventario"
                        element={<Inventario />}
                    />

                </Route>
            </Route>


            {/* SOLO ADMIN */}
            <Route
                element={
                    <RutaProtegida
                        key={`${pathname}-admin`}
                        roles={["ADMIN"]}
                    />
                }
            >
                <Route element={<Layout />}>

                    <Route
                        path="/usuarios"
                        element={<Usuarios />}
                    />

                </Route>
            </Route>


            {/* ADMIN Y VENTAS */}
            <Route
                element={
                    <RutaProtegida
                        key={`${pathname}-ventas`}
                        roles={[
                            "ADMIN",
                            "VENTAS"
                        ]}
                    />
                }
            >
                <Route element={<Layout />}>

                    <Route
                        path="/ventas"
                        element={<Ventas />}
                    />

                </Route>
            </Route>


            {/* RUTA NO ENCONTRADA */}
            <Route
                path="*"
                element={
                    <div>

                        <h1>
                            Página no encontrada
                        </h1>

                        <Link to="/dashboard">
                            Ir al Dashboard
                        </Link>

                    </div>
                }
            />

        </Routes>
    );

}


function App() {

    return (
        <BrowserRouter>
            <RutasAplicacion />
        </BrowserRouter>
    );

}


export default App;
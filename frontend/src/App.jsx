import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";


function App(){

    return(

        <BrowserRouter>

            <Routes>


                <Route
                    path="/"
                    element={<Login/>}
                />


                <Route
                    path="/dashboard"
                    element={<Dashboard/>}
                />


                <Route
                    path="/productos"
                    element={<Productos/>}
                />
                <Route
                    path="/categorias"
                    element={<Categorias/>}
                />
                <Route
                    path="/inventario"
                    element={<Inventario/>}
                />

                <Route
                    path="/usuarios"
                    element={<Usuarios/>}
                />
            </Routes>

        </BrowserRouter>

    );

}


export default App;
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "./Dashboard.css";


function Dashboard(){

    const [usuario,setUsuario] = useState(null);


    useEffect(()=>{

        const datosUsuario = 
        localStorage.getItem("usuario");


        if(datosUsuario){

            setUsuario(
                JSON.parse(datosUsuario)
            );

        }

    },[]);



    const cerrarSesion = ()=>{

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        window.location.href="/";

    };



    return(

    <Layout>


        <h1>
            Dashboard LuckyTech
        </h1>


        {
            usuario && (

                <div className="cards">

                    <h3>
                        Bienvenido:
                        {" "}
                        {usuario.nombre}
                    </h3>


                    <p>
                        Rol:
                        {" "}
                        {usuario.rol}
                    </p>

                </div>

            )
        }



        <hr/>


        <h2>
            Resumen del sistema
        </h2>



        <div className="card">


            <div className="card">

                <h2>
                    📦
                </h2>

                <h3>
                    Productos
                </h3>

                <p>
                    52 productos registrados
                </p>

                <button
                onClick={()=>{
                    window.location.href="/productos"
                }}
                >
                    Ver productos
                </button>

            </div>




            <div className="card">

                <h2>
                    🗂
                </h2>

                <h3>
                    Categorías
                </h3>

                <p>
                    9 categorías activas
                </p>

                <button
                onClick={()=>{
                    window.location.href="/categorias"
                }}
                >
                    Ver categorías
                </button>

            </div>




            <div className="card">

                <h2>
                    📋
                </h2>

                <h3>
                    Inventario
                </h3>

                <p>
                    Historial de movimientos
                </p>

                <button
                onClick={()=>{
                    window.location.href="/inventario"
                }}
                >
                    Ver inventario
                </button>

            </div>




            <div className="card">

                <h2>
                    👥
                </h2>

                <h3>
                    Usuarios
                </h3>

                <p>
                    Administración de usuarios
                </p>

                <button
                onClick={()=>{
                    window.location.href="/usuarios"
                }}
                >
                    Ver usuarios
                </button>

            </div>



        </div>



        <br/>


        <button onClick={cerrarSesion}>

            Cerrar sesión

        </button>


    </Layout>

    );

}


export default Dashboard;
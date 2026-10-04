import { useState } from "react";
import api from "../services/api";


function Login(){

    const [correo,setCorreo] = useState("");
    const [password,setPassword] = useState("");


    const iniciarSesion = async(e)=>{

        e.preventDefault();

        try{

            const respuesta = await api.post(
                "/auth/login",
                {
                    correo,
                    password
                }
            );


            
            localStorage.setItem(
                "token",
                respuesta.data.token
            );
            
            
            localStorage.setItem(
                "usuario",
                JSON.stringify(respuesta.data.usuario)
            );
            
            
            window.location.href="/dashboard";


        }catch(error){

            console.log(error);

        }

    };


    return(

        <div>

            <h1>
                LuckyTech
            </h1>


            <h2>
                Inicio de sesión
            </h2>


            <form onSubmit={iniciarSesion}>


                <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={
                        e=>setCorreo(e.target.value)
                    }
                />


                <br/>


                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={
                        e=>setPassword(e.target.value)
                    }
                />


                <br/>


                <button>
                    Entrar
                </button>


            </form>


        </div>

    );

}


export default Login;
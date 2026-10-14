import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/auth.service";


function Login(){

    const [correo,setCorreo] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");

    const { login } = useAuth();

    const navigate = useNavigate();


    const iniciarSesion = async(e)=>{

        e.preventDefault();

        setError("");


        try{

            const respuesta = await authService.iniciarSesion(
                correo,
                password
            );


            login(
                respuesta.usuario,
                respuesta.token
            );


            navigate("/dashboard");


        }catch(error){

            console.error(error);


            setError(
                error.response?.data?.mensaje ||
                "Credenciales no válidas"
            );

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


            {
                error && (

                    <p style={{color:"red"}}>
                        {error}
                    </p>

                )
            }



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
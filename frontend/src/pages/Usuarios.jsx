import { useEffect, useState } from "react";
import api from "../services/api";


function Usuarios(){

    const [usuarios,setUsuarios] = useState([]);



    useEffect(()=>{

        cargarUsuarios();

    },[]);



    const cargarUsuarios = async()=>{

        try{

            const respuesta = await api.get(
                "/usuarios"
            );


            setUsuarios(
                respuesta.data
            );


        }catch(error){

            console.log(error);

        }

    };



    return(

        <div>

            <h1>
                Usuarios LuckyTech
            </h1>


            <table border="1">

                <thead>

                    <tr>

                        <th>
                            Nombre
                        </th>

                        <th>
                            Correo
                        </th>

                        <th>
                            Rol
                        </th>

                        <th>
                            Estado
                        </th>

                    </tr>

                </thead>


                <tbody>

                {
                    usuarios.map(
                        usuario=>(

                        <tr key={usuario._id}>


                            <td>
                                {usuario.nombre}
                            </td>


                            <td>
                                {usuario.correo}
                            </td>


                            <td>
                                {usuario.rol}
                            </td>


                            <td>
                                {
                                    usuario.activo
                                    ?
                                    "Activo"
                                    :
                                    "Inactivo"
                                }
                            </td>


                        </tr>

                    ))
                }


                </tbody>


            </table>


        </div>

    );

}


export default Usuarios;
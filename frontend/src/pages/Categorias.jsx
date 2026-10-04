import { useEffect, useState } from "react";
import api from "../services/api";


function Categorias(){


    const [categorias,setCategorias] = useState([]);



    useEffect(()=>{

        cargarCategorias();

    },[]);



    const cargarCategorias = async()=>{

        try{

            const respuesta = await api.get(
                "/categorias"
            );


            setCategorias(
                respuesta.data
            );


        }catch(error){

            console.log(error);

        }

    };



    return(

        <div>

            <h1>
                Categorías LuckyTech
            </h1>


            <table border="1">

                <thead>

                    <tr>

                        <th>
                            Nombre
                        </th>


                        <th>
                            Descripción
                        </th>


                        <th>
                            Estado
                        </th>

                    </tr>

                </thead>


                <tbody>


                {
                    categorias.map(
                        categoria=>(

                        <tr key={categoria._id}>


                            <td>
                                {categoria.nombre}
                            </td>


                            <td>
                                {categoria.descripcion}
                            </td>


                            <td>
                                {
                                    categoria.activo
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


export default Categorias;
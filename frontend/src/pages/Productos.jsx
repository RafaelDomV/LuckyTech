import { useEffect, useState } from "react";
import api from "../services/api";


function Productos(){

    const [productos,setProductos] = useState([]);


    useEffect(()=>{

        cargarProductos();

    },[]);



    const cargarProductos = async()=>{

        try{

            const respuesta = await api.get(
                "/productos"
            );


            setProductos(
                respuesta.data
            );


        }catch(error){

            console.log(error);

        }

    };



    return(

        <div>

            <h1>
                Productos LuckyTech
            </h1>


            <table border="1">

                <thead>

                    <tr>

                        <th>
                            Código
                        </th>

                        <th>
                            Nombre
                        </th>

                        <th>
                            Marca
                        </th>

                        <th>
                            Precio
                        </th>

                        <th>
                            Stock
                        </th>

                    </tr>

                </thead>


                <tbody>


                {
                    productos.map(
                        producto=>(

                        <tr key={producto._id}>


                            <td>
                                {producto.codigo}
                            </td>


                            <td>
                                {producto.nombre}
                            </td>


                            <td>
                                {producto.marca}
                            </td>


                            <td>
                                $
                                {producto.precioVenta}
                            </td>


                            <td>
                                {producto.stock}
                            </td>


                        </tr>

                    ))
                }


                </tbody>


            </table>


        </div>

    );

}


export default Productos;
import { useEffect, useState } from "react";
import api from "../services/api";


function Inventario(){

    const [movimientos,setMovimientos] = useState([]);


    useEffect(()=>{

        cargarMovimientos();

    },[]);



    const cargarMovimientos = async()=>{

        try{

            const respuesta = await api.get(
                "/inventario"
            );


            setMovimientos(
                respuesta.data
            );


        }catch(error){

            console.log(error);

        }

    };



    return(

        <div>

            <h1>
                Inventario LuckyTech
            </h1>

        <table border="1">
            
        <thead>
            
        <tr>
            
        <th>
        Producto
        </th>
            
        <th>
        Tipo
        </th>
            
        <th>
        Cantidad
        </th>
            
        <th>
        Motivo
        </th>
            
        <th>
        Usuario
        </th>
            
        <th>
        Fecha
        </th>
            
        </tr>
            
        </thead>
            
            
        <tbody>
            
        {
        movimientos.map(
        movimiento=>(
        
        <tr key={movimiento._id}>
        
        
        <td>
        {
        movimiento.producto?.nombre
        }
        </td>
        
        
        <td>
        {
        movimiento.tipo
        }
        </td>
        
        
        <td>
        {
        movimiento.cantidad
        }
        </td>
        
        
        <td>
        {
        movimiento.motivo
        }
        </td>
        
        
        <td>
        {
        movimiento.usuario?.nombre
        }
        </td>
        
        
        <td>
        
        {
        new Date(
        movimiento.createdAt
        )
        .toLocaleString()
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


export default Inventario;
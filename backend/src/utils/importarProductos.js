import XLSX from "xlsx";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Producto from "../models/Producto.js";
import Categoria from "../models/Categoria.js";


dotenv.config();
const normalizarCategoria = (categoria)=>{

    if(!categoria)
        return null;


    categoria = categoria.trim().toLowerCase();


    if(categoria.includes("audio"))
        return "Audio";


    if(categoria.includes("comput"))
        return "Computación";


    if(categoria.includes("herramient"))
        return "Herramientas";


    if(categoria.includes("cable"))
        return "Cables";


    if(categoria.includes("telefon"))
        return "Telefonía";


    if(categoria.includes("energ"))
        return "Energía";


    if(categoria.includes("casa") || categoria.includes("oficina"))
        return "Casa y Oficina";


    if(categoria.includes("seguridad"))
        return "Seguridad";


    if(categoria.includes("proyecto"))
        return "Proyectos de Electrónica";


    return null;

};

const importarProductos = async()=>{

try{

await mongoose.connect(process.env.MONGO_URI);
await Producto.deleteMany();
console.log("MongoDB conectado");


const archivo = XLSX.readFile(
    "./data/catalogo_componentes_electronicos.xlsx"
);


const hoja = archivo.Sheets["Catálogo de Productos"];


const datos = XLSX.utils.sheet_to_json(
    hoja,
    {
        header:[
            "codigo",
            "imagen",
            "nombre",
            "categoria",
            "modelo",
            "marca",
            "precioVenta",
            "stock",
            "descripcion"
        ],
        range:4
    }
);


console.log(
    `Productos encontrados: ${datos.length}`
);



for(const item of datos){


const nombreCategoria =
normalizarCategoria(item.categoria);


const categoria = await Categoria.findOne({
    nombre:nombreCategoria
});


if(!categoria){

console.log(
    "Categoría no encontrada:",
    item.categoria
);

continue;

}



await Producto.create({

codigo:item.codigo,

nombre:item.nombre,

categoria:categoria._id,

marca:item.marca,

modelo:item.modelo,

descripcion:item.descripcion,

precioVenta:item.precioVenta,

stock:item.stock,

imagen:item.imagen,

especificaciones:{
    referencia:item.modelo
}

});


console.log(
    "Importado:",
    item.codigo
);


}


console.log(
"Importación finalizada"
);


process.exit();



}catch(error){

console.log(error);

process.exit(1);

}


};


importarProductos();
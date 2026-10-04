import mongoose from "mongoose";
import dotenv from "dotenv";
import Categoria from "../models/Categoria.js";


dotenv.config();


const categorias = [

{
nombre:"Audio",
descripcion:"Componentes y accesorios de audio"
},

{
nombre:"Computación",
descripcion:"Accesorios y componentes para computadora"
},

{
nombre:"Herramientas",
descripcion:"Herramientas para electrónica y reparación"
},

{
nombre:"Cables",
descripcion:"Cables y conectores"
},

{
nombre:"Telefonía",
descripcion:"Accesorios para dispositivos móviles"
},

{
nombre:"Energía",
descripcion:"Fuentes, baterías y alimentación eléctrica"
},

{
nombre:"Casa y Oficina",
descripcion:"Productos tecnológicos para hogar y oficina"
},

{
nombre:"Seguridad",
descripcion:"Cámaras y sistemas de vigilancia"
},

{
nombre:"Proyectos de Electrónica",
descripcion:"Módulos y componentes para desarrollo"
}

];


const cargarCategorias = async()=>{

try{

await mongoose.connect(process.env.MONGO_URI);


await Categoria.deleteMany();


await Categoria.insertMany(categorias);


console.log("Categorías cargadas correctamente");


process.exit();


}catch(error){

console.log(error);
process.exit(1);

}

};


cargarCategorias();
import mongoose from "mongoose";


const usuarioSchema = new mongoose.Schema({

    nombre:{
        type:String,
        required:true
    },

    correo:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    rol:{
        type:String,
        enum:[
            "ADMIN",
            "INVENTARIO",
            "VENTAS"
        ],
        default:"VENTAS"
    },

    activo:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true
});


export default mongoose.model(
    "Usuario",
    usuarioSchema
);
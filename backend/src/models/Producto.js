import mongoose from "mongoose";


const productoSchema = new mongoose.Schema({

    codigo:{
        type:String,
        required:true,
        unique:true
    },

    nombre:{
        type:String,
        required:true
    },

    categoria:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Categoria",
        required:true
    },

    marca:{
        type:String
    },

    modelo:{
        type:String
    },

    descripcion:{
        type:String
    },

    precioCompra:{
        type:Number,
        default:0
    },

    precioVenta:{
        type:Number,
        required:true
    },

    stock:{
        type:Number,
        default:0
    },

    stockMinimo:{
        type:Number,
        default:5
    },

    imagen:{
        type:String,
        default:""
    },

    especificaciones:{
        type:Object,
        default:{}
    },

    activo:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true
});


export default mongoose.model(
    "Producto",
    productoSchema
);
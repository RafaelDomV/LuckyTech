import mongoose from "mongoose";


const movimientoInventarioSchema = new mongoose.Schema({

    producto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Producto",
        required:true
    },


    tipo:{
        type:String,
        enum:[
            "ENTRADA",
            "SALIDA",
            "AJUSTE"
        ],
        required:true
    },


    cantidad:{
        type:Number,
        required:true
    },


    motivo:{
        type:String,
        required:true
    },


    usuario:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Usuario",
        required:true
    }


},{
    timestamps:true
});


export default mongoose.model(
    "MovimientoInventario",
    movimientoInventarioSchema
);
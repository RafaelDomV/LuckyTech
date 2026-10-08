import mongoose from "mongoose";


const detalleVentaSchema =
new mongoose.Schema(
    {

        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Producto",
            required: true
        },

        codigo: {
            type: String,
            required: true
        },

        nombre: {
            type: String,
            required: true
        },

        cantidad: {
            type: Number,
            required: true,
            min: 1
        },

        precioUnitario: {
            type: Number,
            required: true,
            min: 0
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }

    },
    {
        _id: false
    }
);


const ventaSchema =
new mongoose.Schema(
    {

        folio: {
            type: String,
            required: true,
            unique: true
        },

        productos: {
            type: [detalleVentaSchema],
            required: true
        },

        metodoPago: {
            type: String,
            enum: [
                "EFECTIVO",
                "TARJETA",
                "TRANSFERENCIA"
            ],
            default: "EFECTIVO"
        },

        total: {
            type: Number,
            required: true,
            min: 0
        },

        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },

        estado: {
            type: String,
            enum: [
                "COMPLETADA",
                "CANCELANDO",
                "CANCELADA"
            ],
            default: "COMPLETADA"
        },
        
        motivoCancelacion: {
            type: String,
            default: ""
        },
        
        canceladaPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        },
        
        fechaCancelacion: {
            type: Date,
            default: null
        }

    },
    {
        timestamps: true
    }
);


export default mongoose.model(
    "Venta",
    ventaSchema
);
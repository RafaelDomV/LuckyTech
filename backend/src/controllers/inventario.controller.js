import Producto from "../models/Producto.js";
import MovimientoInventario from "../models/MovimientoInventario.js";


// ENTRADA DE PRODUCTO

export const registrarEntrada = async(req,res)=>{

    try{

        const {
            producto,
            cantidad,
            motivo
        } = req.body;

        const cantidadNumero = Number(cantidad);

        if(
            !Number.isFinite(cantidadNumero)
            ||
            !Number.isInteger(cantidadNumero)
            ||
            cantidadNumero <= 0
        ){
            return res.status(400).json({
                mensaje:
                    "La cantidad debe ser un número entero mayor a cero"
            });
        }

         if(!motivo){

            return res.status(400).json({
                mensaje:"El motivo es obligatorio"
            });

        }


        const item = await Producto.findOne({
            _id: producto,
            activo:true
        });


        if(!item){

            return res.status(404).json({
                mensaje:"Producto no encontrado"
            });

        }


        item.stock += cantidadNumero;

        await item.save();



        const movimiento = await MovimientoInventario.create({

            producto:item._id,

            tipo:"ENTRADA",

            cantidad: cantidadNumero,

            motivo,

            usuario:req.usuario.id

        });



        res.json({

            mensaje:"Entrada registrada correctamente",

            movimiento

        });



    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};




// SALIDA DE PRODUCTO

export const registrarSalida = async(req,res)=>{

    try{

        const {
            producto,
            cantidad,
            motivo
        } = req.body;

        const cantidadNumero = Number(cantidad);
            
        if(
            !Number.isFinite(cantidadNumero)
            ||
            !Number.isInteger(cantidadNumero)
            ||
            cantidadNumero <= 0
        ){
            return res.status(400).json({
                mensaje:
                    "La cantidad debe ser un número entero mayor a cero"
            });
        }

         if(!motivo){

            return res.status(400).json({
                mensaje:"El motivo es obligatorio"
            });

        }


        const item = await Producto.findOne({
            _id: producto,
            activo:true
        });



        if(!item){

            return res.status(404).json({
                mensaje:"Producto no encontrado"
            });

        }



        if(item.stock < cantidadNumero){

            return res.status(400).json({

                mensaje:"Stock insuficiente"

            });

        }



        item.stock -= cantidadNumero;


        await item.save();



        const movimiento = await MovimientoInventario.create({

            producto:item._id,

            tipo:"SALIDA",

            cantidad: cantidadNumero,

            motivo,

            usuario:req.usuario.id

        });



        res.json({

            mensaje:"Salida registrada correctamente",

            movimiento

        });



    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};




// HISTORIAL

export const obtenerMovimientos = async(req,res)=>{

    try{

        const movimientos =
        await MovimientoInventario.find()
        .populate("producto")
        .populate("usuario", "nombre correo rol")
        .sort({
            createdAt: -1
        });


        res.json(movimientos);


    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};
// AJUSTE DE INVENTARIO

export const registrarAjuste = async(req,res)=>{

    try{

        const {
            producto,
            cantidad,
            motivo
        } = req.body;


        const cantidadNumero = Number(cantidad);


        if(
            !Number.isFinite(cantidadNumero)
            ||
            !Number.isInteger(cantidadNumero)
            ||
            cantidadNumero === 0
        ){
            return res.status(400).json({
                mensaje:
                    "El ajuste debe ser un número entero diferente de cero"
            });
        }


        if(!motivo){

            return res.status(400).json({
                mensaje:"El motivo es obligatorio"
            });

        }


        const item = await Producto.findOne({
            _id: producto,
            activo:true
        });


        if(!item){

            return res.status(404).json({
                mensaje:"Producto no encontrado"
            });

        }


        const nuevoStock = item.stock + cantidadNumero;


        if(nuevoStock < 0){

            return res.status(400).json({
                mensaje:"El ajuste dejaría el stock negativo"
            });

        }


        item.stock = nuevoStock;


        await item.save();



        const movimiento =
        await MovimientoInventario.create({

            producto:item._id,

            tipo:"AJUSTE",

            cantidad: cantidadNumero,

            motivo,

            usuario:req.usuario.id

        });



        res.json({

            mensaje:"Ajuste registrado correctamente",

            movimiento

        });



    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};
import { randomUUID } from "crypto";

import Venta from "../models/Venta.js";

import Producto from "../models/Producto.js";

import MovimientoInventario
from "../models/MovimientoInventario.js";



const generarFolio = () => {

    const fecha =
        Date.now();

    const aleatorio =
        randomUUID()
            .slice(0, 6)
            .toUpperCase();

    return `V-${fecha}-${aleatorio}`;

};



export const registrarVenta =
async (req, res) => {

    const productosDescontados = [];

    let ventaCreada = null;


    try {

        const {
            productos,
            metodoPago
        } = req.body;


        /*
        Debe existir por lo menos
        un producto en la venta.
        */
        if (
            !Array.isArray(productos)
            ||
            productos.length === 0
        ) {

            return res.status(400).json({
                mensaje:
                    "La venta debe contener al menos un producto"
            });

        }


        /*
        Agrupamos productos repetidos.

        Ejemplo:

        producto A x 2
        producto A x 3

        se convierte en:

        producto A x 5
        */
        const productosAgrupados =
            new Map();


        for (const item of productos) {

            const cantidad =
                Number(item.cantidad);


            if (
                !item.producto
                ||
                !Number.isFinite(cantidad)
                ||
                !Number.isInteger(cantidad)
                ||
                cantidad <= 0
            ) {

                return res.status(400).json({
                    mensaje:
                        "Todos los productos deben tener una cantidad entera mayor a cero"
                });

            }


            const id =
                String(item.producto);


            const cantidadAnterior =
                productosAgrupados.get(id)
                || 0;


            productosAgrupados.set(
                id,
                cantidadAnterior + cantidad
            );

        }


        const idsProductos =
            Array.from(
                productosAgrupados.keys()
            );


        const productosBD =
            await Producto.find({

                _id: {
                    $in: idsProductos
                }

            });


        /*
        Comprobamos que todos
        los productos existan.
        */
        if (
            productosBD.length !==
            idsProductos.length
        ) {

            return res.status(404).json({
                mensaje:
                    "Uno o más productos no existen"
            });

        }


        const detalleVenta = [];

        let total = 0;


        for (
            const producto of productosBD
        ) {

            const cantidad =
                productosAgrupados.get(
                    producto._id.toString()
                );


            if (!producto.activo) {

                return res.status(400).json({
                    mensaje:
                        `El producto "${producto.nombre}" está inactivo`
                });

            }


            if (
                producto.stock <
                cantidad
            ) {

                return res.status(400).json({
                    mensaje:
                        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
                });

            }


            const precioUnitario =
                Number(
                    producto.precioVenta
                );


            const subtotal =
                precioUnitario *
                cantidad;


            total += subtotal;


            detalleVenta.push({

                producto:
                    producto._id,

                codigo:
                    producto.codigo,

                nombre:
                    producto.nombre,

                cantidad,

                precioUnitario,

                subtotal

            });

        }


        /*
        Validar método de pago.
        */
        const metodo =
            metodoPago
            || "EFECTIVO";


        const metodosPermitidos = [
            "EFECTIVO",
            "TARJETA",
            "TRANSFERENCIA"
        ];


        if (
            !metodosPermitidos.includes(
                metodo
            )
        ) {

            return res.status(400).json({
                mensaje:
                    "Método de pago no válido"
            });

        }


        /*
        DESCONTAR STOCK.

        Se vuelve a comprobar stock
        directamente durante la operación.
        */
        for (
            const detalle of detalleVenta
        ) {

            const resultado =
                await Producto.updateOne(
                    {
                        _id:
                            detalle.producto,

                        activo:
                            true,

                        stock: {
                            $gte:
                                detalle.cantidad
                        }
                    },
                    {
                        $inc: {
                            stock:
                                -detalle.cantidad
                        }
                    }
                );


            if (
                resultado.modifiedCount !== 1
            ) {

                /*
                Si algo cambió entre la
                validación y el descuento,
                regresamos las existencias
                que ya se descontaron.
                */
                for (
                    const descontado
                    of productosDescontados
                ) {

                    await Producto.updateOne(
                        {
                            _id:
                                descontado.producto
                        },
                        {
                            $inc: {
                                stock:
                                    descontado.cantidad
                            }
                        }
                    );

                }


                return res.status(409).json({
                    mensaje:
                        `No fue posible completar la venta. Verifica el stock de "${detalle.nombre}".`
                });

            }


            productosDescontados.push({

                producto:
                    detalle.producto,

                cantidad:
                    detalle.cantidad

            });

        }


        const folio =
            generarFolio();


        /*
        Crear la venta.
        */
        ventaCreada =
            await Venta.create({

                folio,

                productos:
                    detalleVenta,

                metodoPago:
                    metodo,

                total,

                usuario:
                    req.usuario.id,

                estado:
                    "COMPLETADA"

            });


        /*
        Cada producto vendido genera
        automáticamente un movimiento
        SALIDA en Inventario.
        */
        const movimientos =
            detalleVenta.map(
                detalle => ({

                    producto:
                        detalle.producto,

                    tipo:
                        "SALIDA",

                    cantidad:
                        detalle.cantidad,

                    motivo:
                        `Venta ${folio}`,

                    usuario:
                        req.usuario.id

                })
            );


        await MovimientoInventario.insertMany(
            movimientos
        );


        /*
        Regresamos la venta completa.
        */
        const venta =
            await Venta.findById(
                ventaCreada._id
            )
            .populate(
                "usuario",
                "nombre correo rol"
            );


        res.status(201).json({

            mensaje:
                "Venta registrada correctamente",

            venta

        });


    } catch (error) {

        console.error(error);


        /*
        Si ocurrió un error después de
        descontar inventario, tratamos de
        regresar las existencias.
        */
        for (
            const descontado
            of productosDescontados
        ) {

            try {

                await Producto.updateOne(
                    {
                        _id:
                            descontado.producto
                    },
                    {
                        $inc: {
                            stock:
                                descontado.cantidad
                        }
                    }
                );

            } catch (
                errorRollback
            ) {

                console.error(
                    "Error al restaurar stock:",
                    errorRollback
                );

            }

        }


        /*
        Si la venta alcanzó a crearse pero
        falló después, la eliminamos para
        no dejar una venta incompleta.
        */
        if (ventaCreada) {

            try {

                await Venta.findByIdAndDelete(
                    ventaCreada._id
                );

            } catch (
                errorEliminar
            ) {

                console.error(
                    "Error al revertir venta:",
                    errorEliminar
                );

            }

        }


        res.status(500).json({
            mensaje:
                "No fue posible registrar la venta"
        });

    }

};



export const obtenerVentas =
async (req, res) => {

    try {

        const ventas =
            await Venta.find()
                .populate(
                    "usuario",
                    "nombre correo rol"
                )
                .populate(
                    "canceladaPor",
                    "nombre correo rol"
                )
                .sort({
                    createdAt: -1
                });


        res.json(
            ventas
        );


    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "No fue posible obtener las ventas"
        });

    }

};

export const cancelarVenta =
async (req, res) => {

    const movimientosCreados = [];

    const productosRestaurados = [];


    try {

        const {
            motivo
        } = req.body;


        if (
            !motivo
            ||
            motivo.trim() === ""
        ) {

            return res.status(400).json({
                mensaje:
                    "Debes indicar el motivo de la cancelación"
            });

        }


        /*
        Tomamos la venta de forma atómica.

        Solamente puede pasar de COMPLETADA
        a CANCELANDO una vez.
        */
        const venta =
            await Venta.findOneAndUpdate(
                {
                    _id:
                        req.params.id,

                    estado:
                        "COMPLETADA"
                },
                {
                    $set: {
                        estado:
                            "CANCELANDO"
                    }
                },
                {
                    new: true
                }
            );


        if (!venta) {

            const ventaExistente =
                await Venta.findById(
                    req.params.id
                );


            if (!ventaExistente) {

                return res.status(404).json({
                    mensaje:
                        "Venta no encontrada"
                });

            }


            if (
                ventaExistente.estado ===
                "CANCELADA"
            ) {

                return res.status(400).json({
                    mensaje:
                        "La venta ya está cancelada"
                });

            }


            return res.status(409).json({
                mensaje:
                    "La venta está siendo procesada"
            });

        }


        /*
        Regresar stock de cada producto.
        */
        for (
            const detalle
            of venta.productos
        ) {

            const resultado =
                await Producto.updateOne(
                    {
                        _id:
                            detalle.producto
                    },
                    {
                        $inc: {
                            stock:
                                detalle.cantidad
                        }
                    }
                );


            if (
                resultado.modifiedCount !== 1
            ) {

                throw new Error(
                    `No fue posible restaurar el stock de "${detalle.nombre}"`
                );

            }


            productosRestaurados.push({

                producto:
                    detalle.producto,

                cantidad:
                    detalle.cantidad

            });

        }


        /*
        Registrar movimientos ENTRADA
        por devolución de la venta.
        */
        const motivoMovimiento =
            `Cancelación venta ${venta.folio}`;


        const movimientos =
            venta.productos.map(
                detalle => ({

                    producto:
                        detalle.producto,

                    tipo:
                        "ENTRADA",

                    cantidad:
                        detalle.cantidad,

                    motivo:
                        motivoMovimiento,

                    usuario:
                        req.usuario.id

                })
            );


        const movimientosInsertados =
            await MovimientoInventario.insertMany(
                movimientos
            );


        movimientosCreados.push(
            ...movimientosInsertados.map(
                movimiento =>
                    movimiento._id
            )
        );


        /*
        Marcar venta definitivamente
        como CANCELADA.
        */
        venta.estado =
            "CANCELADA";

        venta.motivoCancelacion =
            motivo.trim();

        venta.canceladaPor =
            req.usuario.id;

        venta.fechaCancelacion =
            new Date();


        await venta.save();


        const ventaActualizada =
            await Venta.findById(
                venta._id
            )
            .populate(
                "usuario",
                "nombre correo rol"
            )
            .populate(
                "canceladaPor",
                "nombre correo rol"
            );


        res.json({

            mensaje:
                "Venta cancelada correctamente",

            venta:
                ventaActualizada

        });


    } catch (error) {

        console.error(error);


        /*
        Si algo falló, eliminamos los
        movimientos de cancelación creados.
        */
        if (
            movimientosCreados.length > 0
        ) {

            try {

                await MovimientoInventario.deleteMany(
                    {
                        _id: {
                            $in:
                                movimientosCreados
                        }
                    }
                );

            } catch (
                errorMovimientos
            ) {

                console.error(
                    "Error al revertir movimientos:",
                    errorMovimientos
                );

            }

        }


        /*
        Regresar el stock a como estaba
        antes de intentar cancelar.
        */
        for (
            const restaurado
            of productosRestaurados
        ) {

            try {

                await Producto.updateOne(
                    {
                        _id:
                            restaurado.producto
                    },
                    {
                        $inc: {
                            stock:
                                -restaurado.cantidad
                        }
                    }
                );

            } catch (
                errorStock
            ) {

                console.error(
                    "Error al revertir stock:",
                    errorStock
                );

            }

        }


        /*
        Volver la venta a COMPLETADA
        si quedó atrapada en CANCELANDO.
        */
        try {

            await Venta.updateOne(
                {
                    _id:
                        req.params.id,

                    estado:
                        "CANCELANDO"
                },
                {
                    $set: {
                        estado:
                            "COMPLETADA"
                    }
                }
            );

        } catch (
            errorVenta
        ) {

            console.error(
                "Error al revertir venta:",
                errorVenta
            );

        }


        res.status(500).json({
            mensaje:
                error.message
                ||
                "No fue posible cancelar la venta"
        });

    }

};

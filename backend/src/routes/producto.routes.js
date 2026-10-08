import express from "express";

import {

crearProducto,
obtenerProductos,
obtenerProducto,
actualizarProducto,
eliminarProducto

} from "../controllers/producto.controller.js";


import {

    verificarToken

} from "../middleware/auth.middleware.js";


import {

    verificarRol

} from "../middleware/role.middleware.js";


const router = express.Router();



router.post(

    "/",

    verificarToken,

    verificarRol("ADMIN","INVENTARIO"),

    crearProducto

);



router.get(
    "/",
    verificarToken,
    verificarRol(
        "ADMIN",
        "INVENTARIO",
        "VENTAS"
    ),
    obtenerProductos
);



router.get(
    "/:id",
    verificarToken,
    verificarRol(
        "ADMIN",
        "INVENTARIO",
        "VENTAS"
    ),
    obtenerProducto
);



router.put(

    "/:id",

    verificarToken,

    verificarRol("ADMIN","INVENTARIO"),

    actualizarProducto

);



router.delete(

    "/:id",

    verificarToken,

    verificarRol("ADMIN"),

    eliminarProducto

);



export default router;
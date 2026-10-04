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

    obtenerProductos

);



router.get(

    "/:id",

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
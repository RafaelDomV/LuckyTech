import express from "express";

import {

    crearCategoria,

    obtenerCategorias,

    obtenerCategoria,

    actualizarCategoria,

    eliminarCategoria

} from "../controllers/categoria.controller.js";


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

    crearCategoria

);



router.get(

    "/",

    obtenerCategorias

);



router.get(

    "/:id",

    obtenerCategoria

);



router.put(

    "/:id",

    verificarToken,

    verificarRol("ADMIN","INVENTARIO"),

    actualizarCategoria

);



router.delete(

    "/:id",

    verificarToken,

    verificarRol("ADMIN"),

    eliminarCategoria

);


export default router;
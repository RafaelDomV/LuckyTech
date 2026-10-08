import express from "express";


import {

    registrarVenta,

    obtenerVentas,

    cancelarVenta

} from "../controllers/venta.controller.js";


import {

    verificarToken

} from "../middleware/auth.middleware.js";


import {

    verificarRol

} from "../middleware/role.middleware.js";



const router =
    express.Router();



router.get(

    "/",

    verificarToken,

    verificarRol(
        "ADMIN",
        "VENTAS"
    ),

    obtenerVentas

);



router.post(

    "/",

    verificarToken,

    verificarRol(
        "ADMIN",
        "VENTAS"
    ),

    registrarVenta

);

router.put(

    "/:id/cancelar",

    verificarToken,

    verificarRol(
        "ADMIN"
    ),

    cancelarVenta

);

export default router;
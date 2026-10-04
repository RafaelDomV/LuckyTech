import express from "express";


import {

    registrarEntrada,

    registrarSalida,

    registrarAjuste,

    obtenerMovimientos

} from "../controllers/inventario.controller.js";


import {

    verificarToken

} from "../middleware/auth.middleware.js";


import {

    verificarRol

} from "../middleware/role.middleware.js";


const router = express.Router();



// Registrar entrada de mercancía

router.post(

    "/entrada",

    verificarToken,

    verificarRol(
        "ADMIN",
        "INVENTARIO"
    ),

    registrarEntrada

);



// Registrar salida de mercancía

router.post(

    "/salida",

    verificarToken,

    verificarRol(
        "ADMIN",
        "INVENTARIO"
    ),

    registrarSalida

);

router.post(

    "/ajuste",

    verificarToken,

    verificarRol("ADMIN"),

    registrarAjuste

);


// Consultar historial

router.get(

    "/",

    verificarToken,

    verificarRol(
        "ADMIN",
        "INVENTARIO",
        "VENTAS"
    ),

    obtenerMovimientos

);


export default router;
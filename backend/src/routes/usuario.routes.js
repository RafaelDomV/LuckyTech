import express from "express";

import {

    crearUsuario,

    obtenerUsuarios

} from "../controllers/usuario.controller.js";


import { verificarToken } from "../middleware/auth.middleware.js";

import { verificarRol } from "../middleware/role.middleware.js";


const router = express.Router();



router.post(

    "/",

    verificarToken,

    verificarRol("ADMIN"),

    crearUsuario

);



router.get(

    "/",

    verificarToken,

    verificarRol("ADMIN"),

    obtenerUsuarios

);



export default router;
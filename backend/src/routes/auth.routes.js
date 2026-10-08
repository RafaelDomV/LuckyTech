import express from "express";

import {
    login
} from "../controllers/auth.controller.js";

import {
    verificarToken
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Iniciar sesión.
router.post(
    "/login",
    login
);
// Consultar el usuario y la vigencia de la sesión.
router.get(
    "/me",
    verificarToken,
    (req, res) => {
        return res.json({
            usuario: req.usuario,
            expira: req.sesionExpira
        });
    }
);

export default router;
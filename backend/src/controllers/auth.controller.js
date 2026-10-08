import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body || {};

        if (
            typeof correo !== "string" ||
            !correo.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                mensaje: "Correo y contraseña son obligatorios"
            });
        }

        // Solo el login solicita expresamente el hash de contraseña.
        const usuario = await Usuario.findOne({
            correo: correo.trim()
        }).select("+password");

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                mensaje: "Usuario desactivado"
            });
        }

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        return res.json({
            mensaje: "Inicio de sesión correcto",
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            },
            token
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: error.message
        });
    }
};
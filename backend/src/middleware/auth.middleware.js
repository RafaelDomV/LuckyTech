import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const verificarToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (
        typeof authHeader !== "string" ||
        !/^Bearer\s+\S+$/i.test(authHeader)
    ) {
        return res.status(401).json({
            mensaje: "Token requerido"
        });
    }

    let decoded;

    try {
        const token = authHeader.split(/\s+/)[1];

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        if (
            typeof decoded !== "object" ||
            !/^[a-f\d]{24}$/i.test(decoded.id)
        ) {
            return res.status(401).json({
                mensaje: "Token inválido o expirado"
            });
        }
    } catch {
        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }

    try {
        const usuario = await Usuario.findById(
            decoded.id
        ).select("nombre correo rol activo");

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                mensaje: "La sesión ya no está disponible"
            });
        }

        // Los permisos utilizan el rol actual de MongoDB.
        req.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        req.sesionExpira = decoded.exp;
    } catch {
        return res.status(503).json({
            mensaje:
                "No se pudo verificar la sesión. Intenta nuevamente."
        });
    }

    return next();
};
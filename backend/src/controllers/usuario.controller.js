import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";


// CREAR USUARIO
export const crearUsuario = async (req, res) => {

    try {

        const {
            nombre,
            correo,
            password,
            rol
        } = req.body;


        if (
            !nombre ||
            !correo ||
            !password ||
            !rol
        ) {

            return res.status(400).json({
                mensaje:
                    "Nombre, correo, contraseña y rol son obligatorios"
            });

        }


        const correoNormalizado =
            correo.trim().toLowerCase();


        const usuarioExistente =
            await Usuario.findOne({
                correo: correoNormalizado
            });


        if (usuarioExistente) {

            return res.status(400).json({
                mensaje:
                    "Ya existe un usuario con ese correo"
            });

        }


        const passwordEncriptada =
            await bcrypt.hash(
                password,
                10
            );


        const usuario =
            await Usuario.create({

                nombre:
                    nombre.trim(),

                correo:
                    correoNormalizado,

                password:
                    passwordEncriptada,

                rol,

                activo: true

            });


        res.status(201).json({

            mensaje:
                "Usuario creado correctamente",

            usuario: {

                id:
                    usuario._id,

                nombre:
                    usuario.nombre,

                correo:
                    usuario.correo,

                rol:
                    usuario.rol,

                activo:
                    usuario.activo

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                error.message
        });

    }

};


// OBTENER USUARIOS
export const obtenerUsuarios = async (req, res) => {

    try {

        const usuarios =
            await Usuario.find()
                .select("-password")
                .sort({
                    createdAt: -1
                });


        res.json(
            usuarios
        );


    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                error.message
        });

    }

};


// ACTUALIZAR USUARIO
export const actualizarUsuario = async (req, res) => {

    try {

        const {
            nombre,
            correo,
            password,
            rol,
            activo
        } = req.body;


        const usuario =
            await Usuario.findById(
                req.params.id
            );


        if (!usuario) {

            return res.status(404).json({
                mensaje:
                    "Usuario no encontrado"
            });

        }


        /*
        Evitamos que el administrador
        desactive su propia cuenta.
        */
        if (
            req.usuario.id ===
                usuario._id.toString()
            &&
            activo === false
        ) {

            return res.status(400).json({
                mensaje:
                    "No puedes desactivar tu propia cuenta"
            });

        }


        /*
        Evitamos que el administrador
        quite su propio rol ADMIN mientras
        tiene la sesión iniciada.
        */
        if (
            req.usuario.id ===
                usuario._id.toString()
            &&
            rol
            &&
            rol !== "ADMIN"
        ) {

            return res.status(400).json({
                mensaje:
                    "No puedes cambiar tu propio rol de ADMIN"
            });

        }


        if (
            correo !== undefined
        ) {

            const correoNormalizado =
                correo
                    .trim()
                    .toLowerCase();


            const correoExistente =
                await Usuario.findOne({

                    correo:
                        correoNormalizado,

                    _id: {
                        $ne: usuario._id
                    }

                });


            if (correoExistente) {

                return res.status(400).json({
                    mensaje:
                        "Ya existe otro usuario con ese correo"
                });

            }


            usuario.correo =
                correoNormalizado;

        }


        if (nombre !== undefined) {

            usuario.nombre =
                nombre.trim();

        }


        if (rol !== undefined) {

            usuario.rol =
                rol;

        }


        if (activo !== undefined) {

            usuario.activo =
                activo;

        }


        /*
        La contraseña solamente se cambia
        si el administrador escribió una nueva.
        */
        if (
            password &&
            password.trim() !== ""
        ) {

            usuario.password =
                await bcrypt.hash(
                    password,
                    10
                );

        }


        await usuario.save();


        res.json({

            mensaje:
                "Usuario actualizado correctamente",

            usuario: {

                id:
                    usuario._id,

                nombre:
                    usuario.nombre,

                correo:
                    usuario.correo,

                rol:
                    usuario.rol,

                activo:
                    usuario.activo

            }

        });


    } catch (error) {

        console.error(error);


        if (
            error.name ===
            "ValidationError"
        ) {

            return res.status(400).json({
                mensaje:
                    error.message
            });

        }


        res.status(500).json({
            mensaje:
                error.message
        });

    }

};
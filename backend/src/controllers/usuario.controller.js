import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";


// Crear usuario

export const crearUsuario = async(req,res)=>{

    try{


        const passwordEncriptada =
        await bcrypt.hash(
            req.body.password,
            10
        );


        const usuario = await Usuario.create({

            nombre:req.body.nombre,

            correo:req.body.correo,

            password:passwordEncriptada,

            rol:req.body.rol

        });


        res.status(201).json({

            mensaje:"Usuario creado correctamente",

            usuario:{
                id:usuario._id,
                nombre:usuario.nombre,
                correo:usuario.correo,
                rol:usuario.rol
            }

        });


    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};
export const obtenerUsuarios = async(req,res)=>{

    try{

        const usuarios = await Usuario.find()
        .select("-password");


        res.json(usuarios);


    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};
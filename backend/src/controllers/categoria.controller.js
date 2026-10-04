import Categoria from "../models/Categoria.js";


export const crearCategoria = async(req,res)=>{

    try{

        const categoria = await Categoria.create(req.body);

        res.status(201).json(categoria);

    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};



export const obtenerCategorias = async(req,res)=>{

    try{

        const categorias = await Categoria.find();

        res.json(categorias);

    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

export const obtenerCategoria = async(req,res)=>{

    try{

        const categoria = await Categoria.findById(req.params.id);

        if(!categoria){
            return res.status(404).json({
                mensaje:"Categoría no encontrada"
            });
        }

        res.json(categoria);

    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};



export const actualizarCategoria = async(req,res)=>{

    try{

        const categoria = await Categoria.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );

        res.json(categoria);


    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};



export const eliminarCategoria = async(req,res)=>{

    try{

        await Categoria.findByIdAndDelete(
            req.params.id
        );


        res.json({
            mensaje:"Categoría eliminada correctamente"
        });


    }catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};
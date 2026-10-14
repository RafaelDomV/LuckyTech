import api from "./api";


const obtenerCategorias = async () => {

    const respuesta = await api.get("/categorias");

    return respuesta.data;

};


const crearCategoria = async (categoria) => {

    const respuesta = await api.post(
        "/categorias",
        categoria
    );

    return respuesta.data;

};


const actualizarCategoria = async (id, categoria) => {

    const respuesta = await api.put(
        `/categorias/${id}`,
        categoria
    );

    return respuesta.data;

};


const cambiarEstadoCategoria = async (id, activo) => {

    const respuesta = await api.put(
        `/categorias/${id}`,
        {
            activo
        }
    );

    return respuesta.data;

};


const categoriasService = {

    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria

};


export default categoriasService;
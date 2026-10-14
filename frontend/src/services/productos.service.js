import api from "./api";


const obtenerProductos = async () => {

    const respuesta = await api.get("/productos");

    return respuesta.data;

};


const obtenerCategorias = async () => {

    const respuesta = await api.get("/categorias");

    return respuesta.data;

};


const crearProducto = async (producto) => {

    const respuesta = await api.post(
        "/productos",
        producto
    );

    return respuesta.data;

};


const actualizarProducto = async (id, producto) => {

    const respuesta = await api.put(
        `/productos/${id}`,
        producto
    );

    return respuesta.data;

};


const cambiarEstadoProducto = async (id, activo) => {

    const respuesta = await api.put(
        `/productos/${id}`,
        {
            activo
        }
    );

    return respuesta.data;

};



const productosService = {

    obtenerProductos,
    obtenerCategorias,
    crearProducto,
    actualizarProducto,
    cambiarEstadoProducto

};


export default productosService;
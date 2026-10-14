import api from "./api";


const obtenerProductos = async () => {

    const respuesta = await api.get(
        "/productos"
    );

    return respuesta.data;

};


const obtenerVentas = async () => {

    const respuesta = await api.get(
        "/ventas"
    );

    return respuesta.data;

};


const registrarVenta = async (datosVenta) => {

    const respuesta = await api.post(
        "/ventas",
        datosVenta
    );

    return respuesta.data;

};


const cancelarVenta = async (id, motivo) => {

    const respuesta = await api.put(
        `/ventas/${id}/cancelar`,
        {
            motivo
        }
    );

    return respuesta.data;

};


const ventasService = {

    obtenerProductos,
    obtenerVentas,
    registrarVenta,
    cancelarVenta

};


export default ventasService;
import api from "./api";


const obtenerMovimientos = async () => {

    const respuesta = await api.get(
        "/inventario"
    );

    return respuesta.data;

};


const obtenerProductos = async () => {

    const respuesta = await api.get(
        "/productos"
    );

    return respuesta.data;

};


const registrarEntrada = async (datos) => {

    const respuesta = await api.post(
        "/inventario/entrada",
        datos
    );

    return respuesta.data;

};


const registrarSalida = async (datos) => {

    const respuesta = await api.post(
        "/inventario/salida",
        datos
    );

    return respuesta.data;

};


const registrarAjuste = async (datos) => {

    const respuesta = await api.post(
        "/inventario/ajuste",
        datos
    );

    return respuesta.data;

};


const inventarioService = {

    obtenerMovimientos,
    obtenerProductos,
    registrarEntrada,
    registrarSalida,
    registrarAjuste

};


export default inventarioService;
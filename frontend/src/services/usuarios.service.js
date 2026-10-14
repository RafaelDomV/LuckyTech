import api from "./api";


const obtenerUsuarios = async () => {

    const respuesta = await api.get(
        "/usuarios"
    );

    return respuesta.data;

};


const crearUsuario = async (usuario) => {

    const respuesta = await api.post(
        "/usuarios",
        usuario
    );

    return respuesta.data;

};


const actualizarUsuario = async (id, usuario) => {

    const respuesta = await api.put(
        `/usuarios/${id}`,
        usuario
    );

    return respuesta.data;

};


const cambiarEstadoUsuario = async (id, activo) => {

    const respuesta = await api.put(
        `/usuarios/${id}`,
        {
            activo
        }
    );

    return respuesta.data;

};


const usuariosService = {

    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    cambiarEstadoUsuario

};


export default usuariosService;
import api from "./api";


const iniciarSesion = async (correo, password) => {

    const respuesta = await api.post(
        "/auth/login",
        {
            correo,
            password
        }
    );

    return respuesta.data;

};


const obtenerUsuarioActual = async () => {

    const respuesta = await api.get(
        "/auth/me"
    );

    return respuesta.data;

};


const authService = {

    iniciarSesion,
    obtenerUsuarioActual

};


export default authService;
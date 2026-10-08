import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Usuarios.css";


const formularioInicial = {
    nombre: "",
    correo: "",
    password: "",
    rol: "VENTAS"
};


function Usuarios() {

    const [usuarios, setUsuarios] = useState([]);

    const [busqueda, setBusqueda] = useState("");

    const [mostrarFormulario, setMostrarFormulario] =
        useState(false);

    const [usuarioEditando, setUsuarioEditando] =
        useState(null);

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [mostrarPassword, setMostrarPassword] =
        useState(false);

    const [cargando, setCargando] =
        useState(true);

    const [guardando, setGuardando] =
        useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");


    const usuarioActual = (() => {

        try {

            return JSON.parse(
                localStorage.getItem("usuario")
            );

        } catch {

            return null;

        }

    })();


    const idUsuarioActual =
        usuarioActual?.id
        ||
        usuarioActual?._id;


    useEffect(() => {

        cargarUsuarios();

    }, []);


    const cargarUsuarios = async () => {

        try {

            setCargando(true);

            const respuesta =
                await api.get("/usuarios");

            setUsuarios(
                respuesta.data
            );

        } catch (error) {

            console.error(error);

            setError(
                "No fue posible cargar los usuarios."
            );

        } finally {

            setCargando(false);

        }

    };


    const cambiarCampo = (evento) => {

        const {
            name,
            value
        } = evento.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    const nuevoUsuario = () => {

        setUsuarioEditando(null);

        setFormulario(
            formularioInicial
        );

        setMostrarPassword(false);

        setMostrarFormulario(true);

        setMensaje("");
        setError("");

    };


    const editarUsuario = (usuario) => {

        setUsuarioEditando(
            usuario._id
        );

        setFormulario({

            nombre:
                usuario.nombre || "",

            correo:
                usuario.correo || "",

            password: "",

            rol:
                usuario.rol || "VENTAS"

        });

        setMostrarPassword(false);

        setMostrarFormulario(true);

        setMensaje("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    const cancelarFormulario = () => {

        setMostrarFormulario(false);

        setUsuarioEditando(null);

        setFormulario(
            formularioInicial
        );

        setMostrarPassword(false);

        setError("");

    };


    const guardarUsuario = async (evento) => {

        evento.preventDefault();

        setGuardando(true);
        setMensaje("");
        setError("");


        try {

            const datosUsuario = {

                nombre:
                    formulario.nombre.trim(),

                correo:
                    formulario.correo
                        .trim()
                        .toLowerCase(),

                rol:
                    formulario.rol

            };


            if (usuarioEditando) {

                if (
                    formulario.password.trim() !== ""
                ) {

                    datosUsuario.password =
                        formulario.password;

                }


                const respuesta =
                    await api.put(
                        `/usuarios/${usuarioEditando}`,
                        datosUsuario
                    );


                /*
                Si el ADMIN editó su propia
                información, actualizamos
                también el usuario guardado
                en el navegador.
                */
                if (
                    usuarioEditando ===
                    idUsuarioActual
                ) {

                    const usuarioLocal = {
                        ...usuarioActual,
                        nombre:
                            respuesta.data.usuario.nombre,
                        correo:
                            respuesta.data.usuario.correo,
                        rol:
                            respuesta.data.usuario.rol
                    };

                    localStorage.setItem(
                        "usuario",
                        JSON.stringify(
                            usuarioLocal
                        )
                    );

                }


                setMensaje(
                    "Usuario actualizado correctamente."
                );

            } else {

                await api.post(
                    "/usuarios",
                    {
                        ...datosUsuario,
                        password:
                            formulario.password
                    }
                );


                setMensaje(
                    "Usuario registrado correctamente."
                );

            }


            setFormulario(
                formularioInicial
            );

            setUsuarioEditando(null);

            setMostrarPassword(false);

            setMostrarFormulario(false);

            await cargarUsuarios();


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje
                ||
                (
                    usuarioEditando
                        ? "No fue posible actualizar el usuario."
                        : "No fue posible registrar el usuario."
                )
            );

        } finally {

            setGuardando(false);

        }

    };


    const cambiarEstadoUsuario =
        async (usuario) => {

            const nuevoEstado =
                !usuario.activo;

            const accion =
                nuevoEstado
                    ? "activar"
                    : "desactivar";


            const confirmar =
                window.confirm(
                    `¿Deseas ${accion} al usuario "${usuario.nombre}"?`
                );


            if (!confirmar) {

                return;

            }


            try {

                setMensaje("");
                setError("");


                await api.put(
                    `/usuarios/${usuario._id}`,
                    {
                        activo:
                            nuevoEstado
                    }
                );


                setMensaje(
                    nuevoEstado
                        ? "Usuario activado correctamente."
                        : "Usuario desactivado correctamente."
                );


                await cargarUsuarios();


            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.mensaje
                    ||
                    "No fue posible cambiar el estado del usuario."
                );

            }

        };


    const usuariosFiltrados =
        useMemo(() => {

            const texto =
                busqueda
                    .trim()
                    .toLowerCase();


            if (!texto) {

                return usuarios;

            }


            return usuarios.filter(
                usuario => {

                    return (

                        usuario.nombre
                            ?.toLowerCase()
                            .includes(texto)

                        ||

                        usuario.correo
                            ?.toLowerCase()
                            .includes(texto)

                        ||

                        usuario.rol
                            ?.toLowerCase()
                            .includes(texto)

                    );

                }

            );

        }, [usuarios, busqueda]);


    const esUsuarioActual =
        usuarioEditando ===
        idUsuarioActual;


    return (

        <div className="usuarios-page">

            <div className="usuarios-encabezado">

                <div>

                    <h1 className="usuarios-titulo">
                        Usuarios
                    </h1>

                    <p className="usuarios-subtitulo">
                        Administra las cuentas y permisos de LuckyTech.
                    </p>

                </div>


                <button
                    className="btn-nuevo-usuario"
                    onClick={nuevoUsuario}
                >
                    + Nuevo usuario
                </button>

            </div>


            {
                mensaje &&
                <div className="usuarios-mensaje-exito">
                    {mensaje}
                </div>
            }


            {
                error &&
                <div className="usuarios-mensaje-error">
                    {error}
                </div>
            }


            {
                mostrarFormulario &&
                <form
                    className="usuario-formulario"
                    onSubmit={guardarUsuario}
                >

                    <div className="usuario-form-titulo">

                        <h2>
                            {
                                usuarioEditando
                                    ? "Editar usuario"
                                    : "Registrar usuario"
                            }
                        </h2>

                        <p>
                            {
                                usuarioEditando
                                    ? "Modifica la información y permisos del usuario."
                                    : "Crea una nueva cuenta para LuckyTech."
                            }
                        </p>

                    </div>


                    <div className="usuario-form-grid">

                        <div className="usuario-campo">

                            <label>
                                Nombre *
                            </label>

                            <input
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                placeholder="Nombre del usuario"
                                required
                            />

                        </div>


                        <div className="usuario-campo">

                            <label>
                                Correo *
                            </label>

                            <input
                                type="email"
                                name="correo"
                                value={formulario.correo}
                                onChange={cambiarCampo}
                                placeholder="usuario@luckytech.com"
                                required
                            />

                        </div>


                        <div className="usuario-campo">

                            <label>
                                Rol *
                            </label>

                            <select
                                name="rol"
                                value={formulario.rol}
                                onChange={cambiarCampo}
                                disabled={esUsuarioActual}
                                required
                            >

                                <option value="ADMIN">
                                    Administrador
                                </option>

                                <option value="INVENTARIO">
                                    Inventario
                                </option>

                                <option value="VENTAS">
                                    Ventas
                                </option>

                            </select>


                            {
                                esUsuarioActual &&
                                <small className="usuario-ayuda">
                                    No puedes cambiar tu propio rol de administrador.
                                </small>
                            }

                        </div>


                        <div className="usuario-campo">

                            <label>
                                {
                                    usuarioEditando
                                        ? "Nueva contraseña"
                                        : "Contraseña *"
                                }
                            </label>


                            <div className="password-contenedor">

                                <input
                                    type={
                                        mostrarPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formulario.password}
                                    onChange={cambiarCampo}
                                    placeholder={
                                        usuarioEditando
                                            ? "Dejar vacío para conservarla"
                                            : "Contraseña"
                                    }
                                    required={
                                        !usuarioEditando
                                    }
                                />


                                <button
                                    type="button"
                                    className="btn-mostrar-password"
                                    onClick={() =>
                                        setMostrarPassword(
                                            !mostrarPassword
                                        )
                                    }
                                >
                                    {
                                        mostrarPassword
                                            ? "Ocultar"
                                            : "Mostrar"
                                    }
                                </button>

                            </div>


                            {
                                usuarioEditando &&
                                <small className="usuario-ayuda">
                                    Si no deseas cambiarla, deja este campo vacío.
                                </small>
                            }

                        </div>

                    </div>


                    <div className="usuario-form-acciones">

                        <button
                            type="button"
                            className="btn-cancelar-usuario"
                            onClick={cancelarFormulario}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="btn-guardar-usuario"
                            disabled={guardando}
                        >
                            {
                                guardando
                                    ? "Guardando..."
                                    : usuarioEditando
                                        ? "Guardar cambios"
                                        : "Guardar usuario"
                            }
                        </button>

                    </div>

                </form>
            }


            <div className="usuarios-herramientas">

                <div className="buscador-usuarios">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o rol..."
                        value={busqueda}
                        onChange={
                            evento =>
                                setBusqueda(
                                    evento.target.value
                                )
                        }
                    />

                </div>


                <div className="contador-usuarios">

                    {usuariosFiltrados.length}

                    {
                        usuariosFiltrados.length === 1
                            ? " usuario"
                            : " usuarios"
                    }

                </div>

            </div>


            <div className="tabla-usuarios-contenedor">

                {
                    cargando
                        ?
                        (
                            <div className="estado-usuarios">
                                Cargando usuarios...
                            </div>
                        )
                        :
                        usuariosFiltrados.length === 0
                            ?
                            (
                                <div className="estado-usuarios">
                                    No se encontraron usuarios.
                                </div>
                            )
                            :
                            (

                                <table className="tabla-usuarios">

                                    <thead>

                                        <tr>

                                            <th>
                                                Nombre
                                            </th>

                                            <th>
                                                Correo
                                            </th>

                                            <th>
                                                Rol
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                            <th>
                                                Acciones
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            usuariosFiltrados.map(
                                                usuario => {

                                                    const esMismoUsuario =
                                                        usuario._id ===
                                                        idUsuarioActual;


                                                    return (

                                                        <tr
                                                            key={usuario._id}
                                                        >

                                                            <td>

                                                                <div className="nombre-usuario">
                                                                    {usuario.nombre}
                                                                </div>

                                                                {
                                                                    esMismoUsuario &&
                                                                    <div className="sesion-actual">
                                                                        Sesión actual
                                                                    </div>
                                                                }

                                                            </td>


                                                            <td>
                                                                {usuario.correo}
                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        `rol-usuario rol-${usuario.rol?.toLowerCase()}`
                                                                    }
                                                                >
                                                                    {usuario.rol}
                                                                </span>

                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        usuario.activo
                                                                            ? "estado-usuario estado-usuario-activo"
                                                                            : "estado-usuario estado-usuario-inactivo"
                                                                    }
                                                                >

                                                                    {
                                                                        usuario.activo
                                                                            ? "Activo"
                                                                            : "Inactivo"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <div className="acciones-usuario">

                                                                    <button
                                                                        type="button"
                                                                        className="btn-editar-usuario"
                                                                        onClick={() =>
                                                                            editarUsuario(
                                                                                usuario
                                                                            )
                                                                        }
                                                                    >
                                                                        Editar
                                                                    </button>


                                                                    {
                                                                        !esMismoUsuario &&
                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                usuario.activo
                                                                                    ? "btn-desactivar-usuario"
                                                                                    : "btn-activar-usuario"
                                                                            }
                                                                            onClick={() =>
                                                                                cambiarEstadoUsuario(
                                                                                    usuario
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                usuario.activo
                                                                                    ? "Desactivar"
                                                                                    : "Activar"
                                                                            }
                                                                        </button>
                                                                    }

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )
                                        }

                                    </tbody>

                                </table>

                            )
                }

            </div>

        </div>

    );

}


export default Usuarios;
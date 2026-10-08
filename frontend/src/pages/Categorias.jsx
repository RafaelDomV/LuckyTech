import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Categorias.css";


const formularioInicial = {
    nombre: "",
    descripcion: ""
};


function Categorias() {

    const [categorias, setCategorias] = useState([]);

    const [busqueda, setBusqueda] = useState("");

    const [mostrarFormulario, setMostrarFormulario] =
        useState(false);

    const [categoriaEditando, setCategoriaEditando] =
        useState(null);

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [cargando, setCargando] =
        useState(true);

    const [guardando, setGuardando] =
        useState(false);

    const [mensaje, setMensaje] =
        useState("");

    const [error, setError] =
        useState("");


    useEffect(() => {

        cargarCategorias();

    }, []);


    const cargarCategorias = async () => {

        try {

            setCargando(true);

            const respuesta =
                await api.get("/categorias");

            setCategorias(
                respuesta.data
            );

        } catch (error) {

            console.error(error);

            setError(
                "No fue posible cargar las categorías."
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


    const nuevaCategoria = () => {

        setCategoriaEditando(null);

        setFormulario(
            formularioInicial
        );

        setMostrarFormulario(true);

        setMensaje("");
        setError("");

    };


    const editarCategoria = (categoria) => {

        setCategoriaEditando(
            categoria._id
        );

        setFormulario({

            nombre:
                categoria.nombre || "",

            descripcion:
                categoria.descripcion || ""

        });

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

        setCategoriaEditando(null);

        setFormulario(
            formularioInicial
        );

        setError("");

    };


    const guardarCategoria = async (evento) => {

        evento.preventDefault();

        setGuardando(true);
        setMensaje("");
        setError("");

        try {

            const datosCategoria = {

                nombre:
                    formulario.nombre.trim(),

                descripcion:
                    formulario.descripcion.trim()

            };


            if (categoriaEditando) {

                await api.put(
                    `/categorias/${categoriaEditando}`,
                    datosCategoria
                );

                setMensaje(
                    "Categoría actualizada correctamente."
                );

            } else {

                await api.post(
                    "/categorias",
                    {
                        ...datosCategoria,
                        activo: true
                    }
                );

                setMensaje(
                    "Categoría registrada correctamente."
                );

            }


            setFormulario(
                formularioInicial
            );

            setCategoriaEditando(null);

            setMostrarFormulario(false);

            await cargarCategorias();


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje
                ||
                (
                    categoriaEditando
                        ? "No fue posible actualizar la categoría."
                        : "No fue posible registrar la categoría."
                )
            );

        } finally {

            setGuardando(false);

        }

    };


    const cambiarEstadoCategoria =
        async (categoria) => {

            const nuevoEstado =
                !categoria.activo;

            const accion =
                nuevoEstado
                    ? "activar"
                    : "desactivar";

            const confirmar =
                window.confirm(
                    `¿Deseas ${accion} la categoría "${categoria.nombre}"?`
                );

            if (!confirmar) {
                return;
            }


            try {

                setMensaje("");
                setError("");

                await api.put(
                    `/categorias/${categoria._id}`,
                    {
                        activo:
                            nuevoEstado
                    }
                );

                setMensaje(
                    nuevoEstado
                        ? "Categoría activada correctamente."
                        : "Categoría desactivada correctamente."
                );

                await cargarCategorias();


            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.mensaje
                    ||
                    "No fue posible cambiar el estado de la categoría."
                );

            }

        };


    const categoriasFiltradas =
        useMemo(() => {

            const texto =
                busqueda
                    .trim()
                    .toLowerCase();


            if (!texto) {

                return categorias;

            }


            return categorias.filter(
                categoria =>

                    categoria.nombre
                        ?.toLowerCase()
                        .includes(texto)

                    ||

                    categoria.descripcion
                        ?.toLowerCase()
                        .includes(texto)

            );

        }, [categorias, busqueda]);


    return (

        <div className="categorias-page">

            <div className="categorias-encabezado">

                <div>

                    <h1 className="categorias-titulo">
                        Categorías
                    </h1>

                    <p className="categorias-subtitulo">
                        Administra las categorías de productos de LuckyTech.
                    </p>

                </div>


                <button
                    className="btn-nueva-categoria"
                    onClick={nuevaCategoria}
                >
                    + Nueva categoría
                </button>

            </div>


            {
                mensaje &&
                <div className="mensaje-exito">
                    {mensaje}
                </div>
            }


            {
                error &&
                <div className="mensaje-error">
                    {error}
                </div>
            }


            {
                mostrarFormulario &&
                <form
                    className="categoria-formulario"
                    onSubmit={guardarCategoria}
                >

                    <div className="formulario-titulo">

                        <h2>
                            {
                                categoriaEditando
                                    ? "Editar categoría"
                                    : "Registrar categoría"
                            }
                        </h2>

                        <p>
                            {
                                categoriaEditando
                                    ? "Modifica la información de la categoría seleccionada."
                                    : "Ingresa la información de la nueva categoría."
                            }
                        </p>

                    </div>


                    <div className="categoria-form-grid">

                        <div className="campo">

                            <label>
                                Nombre *
                            </label>

                            <input
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={cambiarCampo}
                                placeholder="Ej. Redes"
                                required
                            />

                        </div>


                        <div className="campo">

                            <label>
                                Descripción
                            </label>

                            <input
                                type="text"
                                name="descripcion"
                                value={formulario.descripcion}
                                onChange={cambiarCampo}
                                placeholder="Descripción de la categoría"
                            />

                        </div>

                    </div>


                    <div className="formulario-acciones">

                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={cancelarFormulario}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="btn-guardar"
                            disabled={guardando}
                        >
                            {
                                guardando
                                    ? "Guardando..."
                                    : categoriaEditando
                                        ? "Guardar cambios"
                                        : "Guardar categoría"
                            }
                        </button>

                    </div>

                </form>
            }


            <div className="categorias-herramientas">

                <div className="buscador-categorias">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={busqueda}
                        onChange={
                            evento =>
                                setBusqueda(
                                    evento.target.value
                                )
                        }
                    />

                </div>


                <div className="contador-categorias">

                    {
                        categoriasFiltradas.length
                    }

                    {
                        categoriasFiltradas.length === 1
                            ? " categoría"
                            : " categorías"
                    }

                </div>

            </div>


            <div className="tabla-categorias-contenedor">

                {
                    cargando
                        ?
                        (
                            <div className="estado-tabla">
                                Cargando categorías...
                            </div>
                        )
                        :
                        categoriasFiltradas.length === 0
                            ?
                            (
                                <div className="estado-tabla">
                                    No se encontraron categorías.
                                </div>
                            )
                            :
                            (

                                <table className="tabla-categorias">

                                    <thead>

                                        <tr>

                                            <th>
                                                Nombre
                                            </th>

                                            <th>
                                                Descripción
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
                                            categoriasFiltradas.map(
                                                categoria => (

                                                    <tr
                                                        key={categoria._id}
                                                    >

                                                        <td>

                                                            <span className="nombre-categoria">
                                                                {categoria.nombre}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            {
                                                                categoria.descripcion
                                                                ||
                                                                "Sin descripción"
                                                            }

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    categoria.activo
                                                                        ? "estado estado-activo"
                                                                        : "estado estado-inactivo"
                                                                }
                                                            >

                                                                {
                                                                    categoria.activo
                                                                        ? "Activo"
                                                                        : "Inactivo"
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="acciones-categoria">

                                                                <button
                                                                    type="button"
                                                                    className="btn-editar-categoria"
                                                                    onClick={() =>
                                                                        editarCategoria(
                                                                            categoria
                                                                        )
                                                                    }
                                                                >
                                                                    Editar
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        categoria.activo
                                                                            ? "btn-desactivar-categoria"
                                                                            : "btn-activar-categoria"
                                                                    }
                                                                    onClick={() =>
                                                                        cambiarEstadoCategoria(
                                                                            categoria
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        categoria.activo
                                                                            ? "Desactivar"
                                                                            : "Activar"
                                                                    }
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
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


export default Categorias;
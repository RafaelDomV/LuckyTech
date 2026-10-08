import { useEffect, useState } from "react";
import { Navigate, Outlet, Link } from "react-router-dom";
import api from "../services/api";

function RutaProtegida({ roles }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [sesionTerminada, setSesionTerminada] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        let temporizador;

        const terminarSesion = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            setUsuario(null);
            setSesionTerminada(true);
        };

        const verificarSesion = async () => {
            try {
                const respuesta = await api.get("/auth/me", {
                    signal: controller.signal
                });

                if (controller.signal.aborted) return;

                const datosUsuario = respuesta.data.usuario;

                setUsuario(datosUsuario);

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(datosUsuario)
                );

                const tiempoRestante =
                    respuesta.data.expira * 1000 - Date.now();

                if (tiempoRestante <= 0) {
                    terminarSesion();
                    return;
                }

                temporizador = window.setTimeout(
                    terminarSesion,
                    tiempoRestante
                );
            } catch (error) {
                if (controller.signal.aborted) return;

                if (error.response?.status === 401) {
                    terminarSesion();
                } else {
                    setError(
                        error.response?.data?.mensaje ||
                        "No se pudo conectar con el servidor."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCargando(false);
                }
            }
        };

        verificarSesion();

        return () => {
            controller.abort();
            window.clearTimeout(temporizador);
        };
    }, [token]);

    if (!token || sesionTerminada) {
        return <Navigate to="/" replace />;
    }

    if (cargando) {
        return <p role="status">Verificando sesión…</p>;
    }

    if (error) {
        return (
            <div role="alert">
                <p>{error}</p>

                <button onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        );
    }

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(usuario.rol)) {
        return (
            <div>
                <h1>Acceso restringido</h1>

                <p>
                    No tienes permisos para consultar esta sección.
                </p>

                <Link to="/dashboard">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    return <Outlet context={{ usuario }} />;
}

export default RutaProtegida;
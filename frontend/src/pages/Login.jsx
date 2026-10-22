import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import authService from "../services/auth.service";

import "./Login.css";


function Login() {

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const [mostrarPassword, setMostrarPassword] = useState(false);

    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);


    const { login } = useAuth();

    const navigate = useNavigate();


    const iniciarSesion = async (e) => {

        e.preventDefault();

        if (cargando) {
            return;
        }

        setError("");
        setCargando(true);


        try {

            const respuesta = await authService.iniciarSesion(
                correo,
                password
            );


            login(
                respuesta.usuario,
                respuesta.token
            );


            navigate("/dashboard", {
                replace: true
            });


        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.mensaje ||
                "No fue posible iniciar sesión. Verifica tus credenciales."
            );

        } finally {

            setCargando(false);

        }

    };


    return (

        <main className="login-page">

            <div className="login-contenedor">


                {/* PANEL IZQUIERDO */}

                <section className="login-marca">

                    <div className="login-marca-contenido">

                        <div className="login-logo">

                            <div className="login-logo-icono">
                                LT
                            </div>

                            <span>
                                LuckyTech
                            </span>

                        </div>


                        <div className="login-presentacion">

                            <span className="login-etiqueta">
                                SISTEMA DE GESTIÓN
                            </span>


                            <h1>
                                Todo tu negocio,
                                <br />
                                <span>
                                    en un solo lugar.
                                </span>
                            </h1>


                            <p>
                                Administra tus productos,
                                controla tu inventario
                                y gestiona tus ventas
                                desde una plataforma
                                diseñada para trabajar
                                de manera eficiente.
                            </p>

                        </div>


                        <div className="login-caracteristicas">

                            <div>
                                <span className="login-punto"></span>
                                Control de inventario
                            </div>

                            <div>
                                <span className="login-punto"></span>
                                Gestión de ventas
                            </div>

                            <div>
                                <span className="login-punto"></span>
                                Administración segura
                            </div>

                        </div>

                    </div>


                    <div className="login-marca-footer">

                        LuckyTech © 2026

                    </div>

                </section>


                {/* PANEL DERECHO */}

                <section className="login-formulario-panel">

                    <div className="login-formulario-contenido">


                        <div className="login-formulario-encabezado">

                            <div className="login-bienvenida-icono">
                                LT
                            </div>


                            <span className="login-formulario-etiqueta">
                                BIENVENIDO DE NUEVO
                            </span>


                            <h2>
                                Iniciar sesión
                            </h2>


                            <p>
                                Ingresa tus credenciales
                                para acceder al sistema.
                            </p>

                        </div>


                        {
                            error && (

                                <div
                                    className="login-error"
                                    role="alert"
                                >

                                    <span>!</span>

                                    <p>
                                        {error}
                                    </p>

                                </div>

                            )
                        }


                        <form
                            className="login-formulario"
                            onSubmit={iniciarSesion}
                        >


                            {/* CORREO */}

                            <div className="login-campo">

                                <label htmlFor="login-correo">
                                    Correo electrónico
                                </label>


                                <input
                                    id="login-correo"
                                    type="email"
                                    name="correo"
                                    placeholder="usuario@luckytech.com"
                                    value={correo}
                                    onChange={(e) => {
                                        setCorreo(e.target.value);
                                    }}
                                    autoComplete="username"
                                    required
                                    disabled={cargando}
                                />

                            </div>


                            {/* CONTRASEÑA */}

                            <div className="login-campo">

                                <label htmlFor="login-password">
                                    Contraseña
                                </label>


                                <div className="login-password-contenedor">

                                    <input
                                        id="login-password"
                                        type={
                                            mostrarPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                        }}
                                        autoComplete="current-password"
                                        required
                                        disabled={cargando}
                                    />


                                    <button
                                        type="button"
                                        className="login-mostrar-password"
                                        onClick={() => {
                                            setMostrarPassword(
                                                !mostrarPassword
                                            );
                                        }}
                                        aria-label={
                                            mostrarPassword
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        aria-pressed={mostrarPassword}
                                    >

                                        {
                                            mostrarPassword
                                                ? "Ocultar"
                                                : "Mostrar"
                                        }

                                    </button>

                                </div>

                            </div>


                            {/* BOTÓN */}

                            <button
                                type="submit"
                                className="login-boton"
                                disabled={cargando}
                            >

                                {
                                    cargando
                                        ? "Iniciando sesión..."
                                        : "Iniciar sesión"
                                }


                                {
                                    !cargando && (
                                        <span>
                                            →
                                        </span>
                                    )
                                }

                            </button>


                        </form>


                        <div className="login-ayuda">

                            <span className="login-ayuda-icono">
                                i
                            </span>

                            <p>
                                ¿No tienes acceso?
                                Contacta al administrador
                                de LuckyTech.
                            </p>

                        </div>

                    </div>

                </section>

            </div>

        </main>

    );

}


export default Login;
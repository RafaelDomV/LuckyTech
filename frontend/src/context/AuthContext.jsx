import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {

    const tokenGuardado = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }

  }, []);


  const login = (datosUsuario, token) => {

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));

    setToken(token);
    setUsuario(datosUsuario);

  };


  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);

  };

  const actualizarUsuario = (datosUsuario) => {

    localStorage.setItem(
        "usuario",
        JSON.stringify(datosUsuario)
    );

    setUsuario(datosUsuario);

};


  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        actualizarUsuario,
        autenticado: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );

};
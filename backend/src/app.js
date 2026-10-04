import express from "express";
import cors from "cors";
import categoriaRoutes from "./routes/categoria.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import authRoutes from "./routes/auth.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";


const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{
    res.json({
        mensaje:"LuckyTech API funcionando"
    });
});


app.use(
    "/api/categorias",
    categoriaRoutes
);

app.use(
    "/api/productos",
    productoRoutes
);

app.use(
    "/api/usuarios",
    usuarioRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/inventario",
    inventarioRoutes
);

export default app;
import dotenv from "dotenv";
import app from "./src/app.js";
import conectarDB from "./src/config/database.js";


dotenv.config();


conectarDB();


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{
    console.log(`Servidor LuckyTech activo en puerto ${PORT}`);
});
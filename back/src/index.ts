import { AppDataSource } from "./config/dataSource";
import app from "./server";

const initialize = async () => {
    console.log("Iniciando el servidor...");
    await AppDataSource.initialize();
    console.log("Base de datos inicializada correctamente.");
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
    });
}

initialize();


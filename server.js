import app from "./app.js";
import dotenv from "dotenv";
import { connectDb } from "./src/config/mongoose.js";

dotenv.config({
    path: './.env',
});

connectDb();

const PORT = process.env.PORT || 8080;
app.listen(PORT, (req, res) => { console.log(`server is running of the the port: ${PORT}`) });
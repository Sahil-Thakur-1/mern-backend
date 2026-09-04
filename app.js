import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.route.js";

const app = express();

app.use(cors({
    origin: ["https://mern-frontend-puwpj5yoy-sahil-thakur-1s-projects.vercel.app", "https://mern-frontend-two-phi.vercel.app", "http://localhost:5173"],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma"
    ],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(routes);


export default app;

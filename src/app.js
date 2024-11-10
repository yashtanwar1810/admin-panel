import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import adminRoutes from "./routes/admin.router.js"
import employeeRouter from "./routes/employee.router.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: statusCode,
        message: err.message || "Internal Server Error",
    });
});


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/admin", adminRoutes)
app.use("/employee", employeeRouter)


export default app;

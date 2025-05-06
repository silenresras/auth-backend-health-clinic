import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './db/connectDB.js';
import router from './routes/auth.route.js';

const authRoutes = router
dotenv.config();

const PORT = process.env.PORT || 7000
const app = express()



const allowedOrigins = [process.env.CLIENT_URL, "frontend-health-clinic.vercel.app",];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

//middleware
app.use(express.json())
app.use(cookieParser()) //allows to parse incoming cookies


//routing  
app.use("/api/auth", authRoutes)





app.listen(PORT, () => {
    connectDB()
    console.log('Server is running on port', PORT)
})

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js"
import connectDB from "./config/db.js";

const PORT = process.env.SERVER_PORT || 5000;  
connectDB();

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})
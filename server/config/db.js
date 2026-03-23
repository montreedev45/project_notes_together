import mongoose from "mongoose";

const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("database connet successfully")
    } catch (error) {
        console.log(error);
        process.exit(1); //บอกชนิด error ที่หยุดทำงาน , 1 = หยุดทำงานเพราะพัง 0 = หยุดทำงานเพราะจบการทำงาน
    }
}

export default connectDB;
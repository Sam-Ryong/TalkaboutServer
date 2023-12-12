import mongoose from "mongoose";

const URL = process.env.DB_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose를 통해 mongo connection 알려주기
const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB 🚀");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);

export default db;

// 모듈 선언
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

//routers
//const router = require("./routers");

// 변수 선언
const app = express();

// 미들웨어 설정과 정적 파일 서비스
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

//Router
// app.use("/", chatrouter);

app.listen(80, () => {
  console.log("Server is running on http://localhost:80");
});

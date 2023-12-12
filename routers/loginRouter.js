const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

var client_id = "EStY7Rur7honNOcLSHCw";
var client_secret = "PknhV6qJIM";
var state = "RAMDOM_STATE-anyword";
var redirectURI = encodeURI("http://127.0.0.1:80/login/redirect");
var api_url = "";

router.get("/login", (req, res) => {
  api_url =
    "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
    client_id +
    "&redirect_uri=" +
    redirectURI +
    "&state=" +
    state;
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.end(
    "<a href='" +
      api_url +
      "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>"
  );
});

router.get("/login/redirect", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const api_url =
    "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=" +
    client_id +
    "&client_secret=" +
    client_secret +
    "&redirect_uri=" +
    redirectURI +
    "&code=" +
    code +
    "&state=" +
    state;

  const response = await fetch(api_url, {
    headers: {
      "X-Naver-Client-Id": client_id,
      "X-Naver-Client-Secret": client_secret,
    },
  });

  const tokenRequest = await response.json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://openapi.naver.com/v1/nid/me";

    const data = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await data.json();

    //사용자 정보 콘솔로 받아오기 -> DB에 저장해야 합니다.
    console.log("userData:", userData);
  }

  res.send("DB에 저장하고 랜드페이지로 redirect ");
});

router.get("/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;

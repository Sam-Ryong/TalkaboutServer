const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.send("login");
});

router.get("/login/redirect", (req, res) => {
  res.send("redirect");
});

router.get("/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;

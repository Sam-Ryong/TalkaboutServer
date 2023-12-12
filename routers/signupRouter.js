const express = require("express");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.send("signup");
});

router.get("/signup/redirect", (req, res) => {
  res.send("signup/redirect");
});

module.exports = router;

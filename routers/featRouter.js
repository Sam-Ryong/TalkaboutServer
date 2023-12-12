const express = require("express");
const router = express.Router();

router.get("/talkabout", (req, res) => {
  res.send("talkabout");
});

router.post("/talkabout", (req, res) => {
  res.send("talkabout");
});

router.get("/talkabout/lists", (req, res) => {
  res.send("signup/redirect");
});

router.get(`/talkabout/lists/${id}`, (req, res) => {
  res.send("signup/redirect");
});

module.exports = router;

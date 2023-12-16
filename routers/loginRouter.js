const express = require("express");
const fs = require("fs");

const router = express.Router();

router.post("/api/nickname", (req, res) => {
  const nickname = req.body.nickname;

  if (!fs.existsSync(`./user/${nickname}.json`)) {
    const initialData = {
      data: {
        messages: [
          {
            role: "system",
            content:
              "- 시스템은 민감한 사회적 문제, 욕설, 위험, 폭력적인 주제에 대한 언급을 피한다.\r\n- 시스템은 사용자의 입력을 바탕으로 새로운 질문을 생성한다.\r\n- 생성하는 질문의 내용은 이전 대화의 맥락과 연관이 있어야 한다.",
          },
        ],
        topP: 0.8,
        topK: 0,
        maxTokens: 256,
        temperature: 0.5,
        repeatPenalty: 5,
        stopBefore: [],
        includeAiFilters: true,
      },
      sum: { title: "", conv: "" },
    };
    fs.writeFileSync(
      `./user/${nickname}.json`,
      JSON.stringify(initialData, null, 2),
      "utf8"
    );
  }

  fs.readFile(`./user/${nickname}.json`, "utf8", (err, data) => {
    if (err) {
      console.error("파일 읽기 오류:", err);
      res.send("저장 되어 있지 않음");
    }
    const jsonData = JSON.parse(data);

    const updatedJsonString = JSON.stringify(jsonData.data.messages, null, 2);

    res.send("OK");
  });
});

module.exports = router;

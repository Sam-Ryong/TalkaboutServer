const express = require("express");
const axios = require("axios");
const fs = require("fs");

const router = express.Router();
const list = [
  "돈 키호테",
  "1984",
  "벌레",
  "죄와 벌",
  "로미오와 줄리엣",
  "아그네스의 집",
  "햄릿",
  "호밀밭의 파수꾼",
  "오만과 편견",
  "죽은 시인의 사회",
  "크라이메리아의 라쿠",
  "어린 왕자",
  "사랑의 불시착",
  "베를린 베를린",
  "흰",
  "동물농장",
  "파리대왕",
  "다섯째 아이",
  "야성의 부름",
  "달과 6펜스",
  "데미안",
  "젊은 예술가의 초상",
  "차라투스트라는 이렇게 말했다",
];

router.get("/talkabout/:nickname", (req, res) => {
  res.send("talkabout");
});

router.post("/api/reset/:nickname", (req, res) => {
  const bookname = list[Math.floor(Math.random() * list.length)];
  const nickname = req.params.nickname;
  const postData = {
    messages: [
      {
        role: "system",
        content:
          "- 주어진 도서 명을 바탕으로 해당 도서에 관한 철학적 질문을 생성하시오.\n- 주어지는 도서 명은 모두 세계 고전 문학이다.\n- 질문은 도서의 스토리, 중심 주제와 연관이 있어야 한다.\n- 질문은 사용자의 의향에 초점을 두어야 한다.\r\n- 질문의 길이는 32 토큰을 넘겨서는 안된다.\r\n\r\n도서 명: 1984\r\n질문: 윈스턴은 줄리아라는 여자와 연인 관계를 맺고, 당의 전복을 계획했지만 결국 발각되어 고문을 당합니다. 그럼 당신이 윈스턴이라면 줄리아와의 여자의 사랑을 지킬건가요?",
      },
      {
        role: "user",
        content: bookname,
      },
    ],
    topP: 0.8,
    topK: 0,
    maxTokens: 256,
    temperature: 0.5,
    repeatPenalty: 5.0,
    stopBefore: [],
    includeAiFilters: true,
  };

  axios
    .post(
      "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-002",
      postData,
      {
        headers: {
          "X-NCP-CLOVASTUDIO-API-KEY":
            "NTA0MjU2MWZlZTcxNDJiY9B2x/lnHOLMzdeUJ8HUttYmOr+OiXujo+AAZZ4WjQoIeCCCw7dSHiLcvrjdeN5MWIh9wx4lofMExV4q1D5AW0TwS9PbKo+IdDMFnViLWgD/htfOlq+mGmk6onJPuvx4MkQYITkn00wj3KofhClDgYm+8CgxQLvlSWjtOF6taIRi2Vz0i4yFPCen1cuRl6/s5mxNj2n3CajOfKwgIyPXms0=",
          "X-NCP-APIGW-API-KEY": "b60LQZjYl5dUquwPam7iVaai0NVIEtDs497uvIom",
          "X-NCP-CLOVASTUDIO-REQUEST-ID": "aadb572132fd49f981874f7a55cb59a3",
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
      }
    )
    .then((response) => {
      const regex = /event:result\n(?:.|\n)*?content":"([^"]*)"/;
      const match = regex.exec(response.data);
      const resultContent = match ? match[1] : null;

      fs.readFile(`./user/${nickname}.json`, "utf8", (err, data) => {
        if (err) {
          console.error("파일 읽기 오류:", err);
          res.send("정보 저장에 실패했어요.");
        }

        const jsonData = {
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
          sum: {
            title: "",
            conv: "",
          },
        };

        jsonData.data.messages.push({
          role: "assistant",
          content: resultContent,
        });
        jsonData.sum.title = bookname;
        jsonData.sum.conv = jsonData.sum.conv + +"어시스턴트: " + resultContent;

        const updatedJsonString = JSON.stringify(jsonData, null, 2); // 2는 들여쓰기 수
        // 파일 쓰기
        fs.writeFile(
          `./user/${req.params.nickname}.json`,
          updatedJsonString,
          "utf8",
          (err) => {
            if (err) {
              console.error("파일 쓰기 오류:", err);
              return;
            }

            console.log("JSON 파일이 성공적으로 수정되었습니다.");
          }
        );

        res.send(resultContent);
      });
      // 책에 대한 질문 생성
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      res.send("질문을 생성하지 못했어요.");
    });
});

//req.body.chat에 사용자의 문장을 보내주면 대화 기록을 가져옴.
router.post("/api/talkabout/:nickname", (req, res) => {
  const chat = req.body.chat;

  fs.readFile(`./user/${req.params.nickname}.json`, "utf8", (err, data) => {
    if (err) {
      console.error("파일 읽기 오류:", err);
      res.send("정보 저장에 실패했어요.");
    }
    const jsonData = JSON.parse(data);

    jsonData.data.messages.push({
      role: "user",
      content: chat,
    });

    axios
      .post(
        "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-002",
        jsonData.data,
        {
          headers: {
            "X-NCP-CLOVASTUDIO-API-KEY":
              "NTA0MjU2MWZlZTcxNDJiY9B2x/lnHOLMzdeUJ8HUttYmOr+OiXujo+AAZZ4WjQoIeCCCw7dSHiLcvrjdeN5MWIh9wx4lofMExV4q1D5AW0TwS9PbKo+IdDMFnViLWgD/htfOlq+mGmk6onJPuvx4MkQYITkn00wj3KofhClDgYm+8CgxQLvlSWjtOF6taIRi2Vz0i4yFPCen1cuRl6/s5mxNj2n3CajOfKwgIyPXms0=",
            "X-NCP-APIGW-API-KEY": "b60LQZjYl5dUquwPam7iVaai0NVIEtDs497uvIom",
            "X-NCP-CLOVASTUDIO-REQUEST-ID": "aadb572132fd49f981874f7a55cb59a3",
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
        }
      )
      .then((response) => {
        const regex = /event:result\n(?:.|\n)*?content":"([^"]*)"/;
        const match = regex.exec(response.data);
        const resultContent = match ? match[1] : null;

        jsonData.data.messages.push({
          role: "assistant",
          content: resultContent,
        });
        jsonData.sum.conv =
          jsonData.sum.conv + "\r\n어시스턴트: " + resultContent;
        jsonData.sum.conv = jsonData.sum.conv + "\r\n사용자: " + chat;
        const updatedJsonString = JSON.stringify(jsonData, null, 2); // 2는 들여쓰기 수
        // 파일 쓰기
        fs.writeFile(
          `./user/${req.params.nickname}.json`,
          updatedJsonString,
          "utf8",
          (err) => {
            if (err) {
              console.error("파일 쓰기 오류:", err);
              return;
            }

            console.log("JSON 파일이 성공적으로 수정되었습니다.");

            if (jsonData.data.messages.length >= 10) {
              axios
                .post(
                  "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-002",
                  {
                    messages: [
                      {
                        role: "system",
                        content:
                          "- 사용자와 어시스턴트의 대화를 바탕으로 사용자의 의견을 요약한다.\n- 요약은 한 문단을 넘어서는 안되며, 사용자의 발언 이외의 다른 의견이 들어가서는 안된다.\n- 대화는 특정 도서에 대한 내용이며, 도서 명은 [BOOK] 토큰 사이에 주어진다.\n- 대화는 [CHAT] 토큰 사이에 주어진다.\n- 요약은 사용자가 어떤 생각을 했는지에 중점을 두고 이루어져야 한다.\n- 요약의 첫 문장은 '''당신은 [BOOK] 라는 책에 대해'''로 시작해야 한다.\n- 요약은 사용자의 의견에 긍정하거나 동의해야 동의해야 한다.",
                      },
                      {
                        role: "user",
                        content: `[BOOK] ${jsonData.sum.title} [BOOK]\r\n[CHAT] ${jsonData.sum.conv} [CHAT]`,
                      },
                    ],
                    topP: 0.8,
                    topK: 0,
                    maxTokens: 512,
                    temperature: 0.3,
                    repeatPenalty: 5.0,
                    stopBefore: [],
                    includeAiFilters: true,
                  },
                  {
                    headers: {
                      "X-NCP-CLOVASTUDIO-API-KEY":
                        "NTA0MjU2MWZlZTcxNDJiY9B2x/lnHOLMzdeUJ8HUttYmOr+OiXujo+AAZZ4WjQoIeCCCw7dSHiLcvrjdeN5MWIh9wx4lofMExV4q1D5AW0TwS9PbKo+IdDMFnViLWgD/htfOlq+mGmk6onJPuvx4MkQYITkn00wj3KofhClDgYm+8CgxQLvlSWjtOF6taIRi2Vz0i4yFPCen1cuRl6/s5mxNj2n3CajOfKwgIyPXms0=",
                      "X-NCP-APIGW-API-KEY":
                        "b60LQZjYl5dUquwPam7iVaai0NVIEtDs497uvIom",
                      "X-NCP-CLOVASTUDIO-REQUEST-ID":
                        "aadb572132fd49f981874f7a55cb59a3",
                      "Content-Type": "application/json",
                      Accept: "text/event-stream",
                    },
                  }
                )
                .then((response2) => {
                  const regex2 = /event:result\n(?:.|\n)*?content":"([^"]*)"/;
                  const match2 = regex2.exec(response2.data);
                  const resultContent2 = match2 ? match2[1] : null;

                  jsonData.data.messages.push({
                    role: "assistant",
                    content: resultContent2,
                  });
                  res.send(jsonData.data.messages.slice(1));
                });
            } else {
              res.send(jsonData.data.messages.slice(1));
            }
          }
        );
      })
      .catch((error) => {
        console.error("에러 발생:", error);
        res.send("질문을 생성하지 못했어요.");
      });
  });
});

module.exports = router;

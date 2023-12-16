const express = require("express");
const axios = require("axios");
const fs = require("fs");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("talkabout");
});

router.post("/book", (req, res) => {
  const bookname = req.body.bookname;
  console.log(bookname);
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

      fs.readFile("./user/hsp0509/1.json", "utf8", (err, data) => {
        if (err) {
          console.error("파일 읽기 오류:", err);
          res.send("정보 저장에 실패했어요.");
        }

        const jsonData = JSON.parse(data);

        jsonData.data.messages.push({
          role: "assistant",
          content: resultContent,
        });
        const updatedJsonString = JSON.stringify(jsonData, null, 2); // 2는 들여쓰기 수
        // 파일 쓰기
        fs.writeFile(
          "./user/hsp0509/1.json",
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

router.post("/chat", (req, res) => {
  const chat = req.body.chat;

  fs.readFile("./user/hsp0509/1.json", "utf8", (err, data) => {
    if (err) {
      console.error("파일 읽기 오류:", err);
      res.send("정보 저장에 실패했어요.");
    }
    const jsonData = JSON.parse(data);

    jsonData.data.messages.push({
      role: "user",
      content: chat,
    });

    console.log(jsonData.data);
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
        const updatedJsonString = JSON.stringify(jsonData, null, 2); // 2는 들여쓰기 수
        // 파일 쓰기
        fs.writeFile(
          "./user/hsp0509/1.json",
          updatedJsonString,
          "utf8",
          (err) => {
            if (err) {
              console.error("파일 쓰기 오류:", err);
              return;
            }

            console.log("JSON 파일이 성공적으로 수정되었습니다.");
            res.send(resultContent);
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

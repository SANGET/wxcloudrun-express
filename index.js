const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
// app.get("/", async (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

app.get("/api/component_access_token", async (req, res) => {
  const response = await axios.get(
    "http://127.0.0.1:8081/inner/component-access-token"
  );
  const data = response.data;
  res.send(data);
});

app.get("/api/authorizer_access_token", async (req, res) => {
  const appid = req.query.appid;
  const response = await axios.get(
    `http://127.0.0.1:8081/inner/authorizer-access-token?appid=${appid}`
  );
  const data = response.data;
  res.send(data);
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();

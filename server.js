import 'dotenv/config'
import express from 'express';
// import {
//   Pool,
//   neonConfig
// } from "@neondatabase/serverless";
import ws from 'ws';
import bodyParser from 'body-parser'
import * as GET from './api/get.js'
import * as POST from './api/post.js'
import * as DELETE from './api/delete.js'
import {
  neonConfig,
  client
} from './api/api.js'
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
neonConfig.webSocketConstructor = ws; // <-- this is the key bit
// const client = new Pool({
//   connectionString: 'postgresql://neondb_owner:pJ9EFKnv5Zsy@ep-icy-bird-a459klel.us-east-1.aws.neon.tech/neondb?sslmode=require', // 從 Neon Dashboard 取得
// });
(async () => {
  try {
    await client.connect();
    console.log("已連線到資料庫");
  } catch (error) {
    console.error("連線資料庫時出錯:", error);
  }
})();
const port = 3000;

app.get('/api/products', GET.getAllProduct);
app.get('/api/products/:id', GET.getProduct);
app.post('/api/addProduct', POST.addProduct);
app.get('/api/shoppingCart', GET.getShoppingCart);
app.get('/api/advertises', GET.getAdvertises);
app.post('/api/addAdvertises', POST.addAdvertises);
app.post('/api/addShoppingCart', POST.addShoppingCart);
app.delete('/api/deleteShoppingCart/:id', DELETE.deleteShoppintCart);

app.listen(port, () => console.log('Server ready on port 3000.'));

export default app

// // 安裝所需套件：
// // npm install express @neondatabase/serverless

// import express from "express";
// import { Client } from "@neondatabase/serverless";

// const app = express();
// const port = 3000;

// // 設定資料庫連線
// const client = new Client({
//   connectionString: "你的資料庫連線字串", // 從 Neon Dashboard 取得
// });

// // 啟動資料庫連線
// (async () => {
//   try {
//     await client.connect();
//     console.log("已連線到資料庫");
//   } catch (error) {
//     console.error("連線資料庫時出錯:", error);
//   }
// })();

// // 中介軟體設定
// app.use(express.json());

// // ====== REST API 實作 ======

// // 1. GET: 取得所有資料
// app.get("/users", async (req, res) => {
//   try {
//     const result = await client.query("SELECT * FROM users");
//     res.status(200).json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: "無法取得資料", details: error.message });
//   }
// });

// // 2. POST: 新增資料
// app.post("/users", async (req, res) => {
//   const { id, name } = req.body;
//   try {
//     await client.query("INSERT INTO users (id, name) VALUES ($1, $2)", [id, name]);
//     res.status(201).json({ message: "資料已新增" });
//   } catch (error) {
//     res.status(500).json({ error: "新增資料失敗", details: error.message });
//   }
// });

// // 3. PUT: 更新資料
// app.put("/users/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name } = req.body;
//   try {
//     const result = await client.query("UPDATE users SET name = $1 WHERE id = $2", [name, id]);
//     if (result.rowCount === 0) {
//       res.status(404).json({ error: "找不到指定的使用者" });
//     } else {
//       res.status(200).json({ message: "資料已更新" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "更新資料失敗", details: error.message });
//   }
// });

// // 4. DELETE: 刪除資料
// app.delete("/users/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await client.query("DELETE FROM users WHERE id = $1", [id]);
//     if (result.rowCount === 0) {
//       res.status(404).json({ error: "找不到指定的使用者" });
//     } else {
//       res.status(200).json({ message: "資料已刪除" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "刪除資料失敗", details: error.message });
//   }
// });

// // 啟動 Express 伺服器
// app.listen(port, () => {
//   console.log(`伺服器運行中，網址：http://localhost:${port}`);
// });

// // 關閉資料庫連線 (應在適當的地方執行，例如應用程式結束時)
// process.on("SIGINT", async () => {
//   await client.end();
//   console.log("已關閉資料庫連線");
//   process.exit();
// });
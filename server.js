import 'dotenv/config'
import express from 'express';
import {
  Pool,
  neonConfig
} from "@neondatabase/serverless";
import ws from 'ws';
import bodyParser from 'body-parser'
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
neonConfig.webSocketConstructor = ws; // <-- this is the key bit
const client = new Pool({
  connectionString: 'postgresql://neondb_owner:pJ9EFKnv5Zsy@ep-icy-bird-a459klel.us-east-1.aws.neon.tech/neondb?sslmode=require', // 從 Neon Dashboard 取得
});
(async () => {
  try {
    await client.connect();
    console.log("已連線到資料庫");
  } catch (error) {
    console.error("連線資料庫時出錯:", error);
  }
})();
const port = 3000;


const getProduct = async (req, res) => {
  const count = await client.query(`SELECT COUNT(*) FROM Products`);
  const result = await client.query(`SELECT * FROM Products`);
  const data = result.rows;
  return res.status(200).json({
    data: data
  });
};
const getAdvertises = async (req, res) => {
  const count = await client.query(`SELECT COUNT(*) FROM Advertises`);
  const result = await client.query(`SELECT * FROM Advertises`);
  const data = result.rows;
  return res.status(200).json({
    data: data
  });
};

const addProduct = async (req, res) => {
  const products = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: "請提供有效的使用者資料陣列"
    });
  }
  const ids = products.map(({
    id
  }, idx) => idx + count + 1);
  const names = products.map(({
    name
  }) => name);
  const describes = products.map(({
    describe
  }) => describe);
  const prices = products.map(({
    price
  }) => price);
  const img_names = products.map(({
    img_name
  }) => {
    return img_name
  });
  try {
    const query = `
      INSERT INTO Products (id, name, describe, price, img_name)
      SELECT * FROM UNNEST($1::int[], $2::text[], $3::text[], $4::int[], $5::text[][])
    `;
    await client.query(query, [ids, names, describes, prices, img_names]);

    res.status(201).json({
      message: "多筆資料已新增"
    });
  } catch (error) {
    res.status(500).json({
      error: "新增資料失敗",
      details: error.message
    });
  }
}

const addAdvertises = async (req, res) => {
  const advertises = req.body;
  if (!Array.isArray(advertises) || advertises.length === 0) {
    return res.status(400).json({
      error: "請提供有效的使用者資料陣列"
    });
  }
  const ids = advertises.map(({
    id
  }, idx) => idx + count + 1);
  const urls = advertises.map(({
    url
  }) => url)
  const imgs = advertises.map(({
    img
  }) => img)
  try {
    const query = `
      INSERT INTO Advertises (id, url, img)
      SELECT * FROM UNNEST($1::int[], $2::text[], $3::text[])
    `;
    await client.query(query, [ids, urls, imgs]);

    res.status(201).json({
      message: "多筆資料已新增"
    });
  } catch (error) {
    res.status(500).json({
      error: "新增資料失敗",
      details: error.message
    });
  }
}


app.get('/api/products', getProduct);
app.post('/api/addProduct', addProduct);
app.get('/api/advertises', getAdvertises);
app.post('/api/addAdvertises', addAdvertises);
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
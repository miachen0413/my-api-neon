import 'dotenv/config'
import express from 'express';
// import {
//   Pool,
//   neonConfig
// } from "@neondatabase/serverless";
import ws from 'ws';
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
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
// 註冊
app.options('*', (req, res) => {
  // res.header('Access-Control-Allow-Origin', 'http://your-frontend-domain.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.send();
});
app.post('/register', async (req, res) => {
  const {
    user_name,
    password
  } = req.body;
  if (!user_name || !password) {
    return res.status(400).send({
      message: '請輸入帳號密碼'
    });
  }

  // // 檢查用戶是否存在
  // try {
  //   const result = await client.query(`SELECT * FROM users WHERE user_name = $1`, [user_name])
  //   if (result.rows.length > 0) {
  //     return res.status(400).send({
  //       message: '使用者已存在'
  //     });
  //   }
  // } catch (error) {
  //   res.status(500).send({
  //     message: '錯誤',
  //     details: error.message
  //   });
  // }

  try {
    // 檢查用戶是否存在
    const result = await client.query(`SELECT * FROM users WHERE user_name = $1`, [user_name])
    if (result.rows.length > 0) {
      return res.status(400).send({
        message: '使用者已存在'
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const query = `
    INSERT INTO users (user_name, password) VALUES ($1, $2)
    `
    await client.query(query, [user_name, passwordHash])
    res.status(201).json({
      message: "註冊成功"
    })
  } catch (error) {
    res.status(500).json({
      error: "註冊失敗",
      details: error.message
    })
  }
});

// 登入
app.post('/api/login', async (req, res) => {
  const {
    user_name,
    password
  } = req.body;

  try {
    // 查找用戶
    const user = await client.query('SELECT user_name, password FROM users WHERE user_name = $1', [user_name]);
    if (user.rows.length === 0) {
      return res.status(401).send({
        message: '查無此用戶，請註冊新帳號。'
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).send({
        message: 'Invalid credentials.'
      });
    }

    // // 生成 JWT
    const token = jwt.sign({
      user_name: user.rows[0].user_name
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).send({
      message: 'Login successful.',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Internal server error.'
    });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(403).send({
      message: 'No token provided.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized.'
      });
    }
    req.user = decoded;
    next();
  });
};

// 登出（模擬）
app.post('/api/logout', authenticate, (req, res) => {
  // 登出可以是前端清除 Token 或在伺服器實作黑名單
  res.status(200).send({
    message: '登出成功'
  });
});

app.get('/api/products', GET.getAllProduct);
app.get('/api/products/:id', GET.getProduct);
app.post('/api/addProduct', POST.addProduct);
app.get('/api/shoppingCart', GET.getShoppingCart);
app.get('/api/advertises', GET.getAdvertises);
app.post('/api/addAdvertises', POST.addAdvertises);
app.post('/api/addShoppingCart', POST.addShoppingCart);
app.delete('/api/deleteShoppingCart', DELETE.deleteShoppintCart);
// app.get('/api/searchProduct', GET.searchProduct);

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
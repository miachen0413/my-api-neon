require("dotenv").config();

const express = require('express');
const app = express()
const {
  neon
} = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const port = 3000

const requestHandler = async (req, res) => {
  const result = await sql `SELECT version()`;
  const {
    version
  } = result[0];
  // res.writeHead(200, {
  //   "Content-Type": "text/plain"
  // });
  // res.end(version);
  return res.status(200).json({
    version
  })
};

app.get('/', requestHandler)
app.get('/bye', (req, res) => {
  res.send('bye')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
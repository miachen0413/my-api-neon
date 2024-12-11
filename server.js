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
  //   "Content-Type": "application/json"
  // });
  return res.status(200).json({
    version: version
  });
};

app.get('/', requestHandler)
// const express = require('express');
// const app = express();
// app.get('/', (req, res) => {
//   return res.send("Hello express")
// })
app.listen(3000, () => console.log('Server ready on port 3000.'));

module.export = app
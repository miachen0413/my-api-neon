import {
  client
} from './api.js'
export const getAllProduct = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // 預設第 1 頁
  const limit = parseInt(req.query.limit) || 10; // 每頁 10 筆
  const offset = (page - 1) * limit;
  const result = await client.query(`SELECT * FROM Products LIMIT $1 OFFSET $2`, [limit, offset]);
  const total_res = await client.query('SELECT COUNT(*) AS total FROM Products');
  const page_count = Math.ceil(parseInt(total_res.rows[0].total, 10) / limit)
  const data = result.rows;
  return res.status(200).json({
    data: data,
    page,
    limit,
    page_count
  });
};
export const getProduct = async (req, res) => {
  const {
    id
  } = req.params
  const result = await client.query(`SELECT * FROM Products WHERE id = ${id}`);
  const data = result.rows;
  return res.status(200).json({
    data: data
  });
};
export const getAdvertises = async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM Advertises`);
    const data = result.rows;
    return res.status(200).json({
      data: data
    });
  } catch (err) {
    console.log("Error:", err)
  }
};
export const getShoppingCart = async (req, res) => {
  const {
    user_id
  } = req.query
  try {
    const query = `
    SELECT 
    products.name AS product_name,
    products.price AS product_price,
    cart_items.count AS product_count
    FROM cart
    JOIN cart_items ON cart.cart_id = cart_items.cart_id
    JOIN products ON cart_items.product_id = products.id
    WHERE
    user_id = '${user_id}'
    `
    const result = await client.query(query);
    const data = result.rows;
    return res.status(200).json({
      data: data
    });
  } catch (err) {
    console.log("Error:", err)
  }
};
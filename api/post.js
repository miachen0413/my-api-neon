import {
  client
} from './api.js'

export const addProduct = async (req, res) => {
  const products = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      error: "請提供有效的使用者資料陣列"
    });
  }
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
      INSERT INTO Products (name, describe, price, img_name)
      SELECT * FROM UNNEST($1::text[], $2::text[], $3::int[], $4::text[][])
    `;
    await client.query(query, [names, describes, prices, img_names]);

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

export const addAdvertises = async (req, res) => {
  const advertises = req.body;
  if (!Array.isArray(advertises) || advertises.length === 0) {
    return res.status(400).json({
      error: "請提供有效的使用者資料陣列"
    });
  }
  const urls = advertises.map(({
    url
  }) => url)
  const imgs = advertises.map(({
    img
  }) => img)
  try {
    const query = `
      INSERT INTO Advertises (url, img)
      SELECT * FROM UNNEST($1::text[], $2::text[])
    `;
    await client.query(query, [urls, imgs]);

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

export const addShoppingCart = async (req, res) => {
  const shoppint_cart = req.body[0];
  const {
    product_id,
    user_id,
    count
  } = shoppint_cart;
  console.log("添加購物車")
  if (count === 0) {
    return res.status(400).json({
      error: "數量需要大於0",
      details: {}
    });
  }
  try {
    var result, cart_id
    const {
      rows
    } = await client.query(`SELECT cart_id FROM cart WHERE user_id = '${user_id}'`)
    if (rows.length === 0) {
      result = await client.query(`INSERT INTO Cart (user_id, created_at, updated_at)
        VALUES ($1, $2, $3) RETURNING *`, [user_id, 'NOW()', 'NOW()'])
      cart_id = result.rows[0].cart_id
    } else {
      cart_id = rows[0].cart_id
    }

    const query = `
      INSERT INTO cart_items (product_id, cart_id, count) VALUES ($1, $2, $3)
      ON CONFLICT (product_id, cart_id)
      DO UPDATE SET count = cart_items.count + $3
      RETURNING *
    `;
    result = await client.query(query, [product_id, cart_id, count]);

    res.status(201).json({
      message: "購物車已新增！",
      result: result.rows
    });
  } catch (error) {
    res.status(500).json({
      error: "新增資料失敗",
      details: error.message
    });
  }
}
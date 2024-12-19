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
  const shoppint_cart = req.body;
  let count = 0
  if (!Array.isArray(shoppint_cart) || shoppint_cart.length === 0) {
    return res.status(400).json({
      error: "請提供有效的使用者資料陣列"
    });
  }
  const product_ids = shoppint_cart.map(({
    product_id
  }) => product_id)
  const product_names = shoppint_cart.map(({
    product_name
  }) => product_name)
  const product_prices = shoppint_cart.map(({
    product_price
  }) => product_price)
  const product_counts = shoppint_cart.map(({
    product_count
  }) => product_count)
  const img_names = shoppint_cart.map(({
    img_name
  }) => img_name)
  try {
    const query = `
      INSERT INTO ShoopingCart (product_id, product_name, product_price, product_count, img_name)
      SELECT * FROM UNNEST($1::int[], $2::text[], $3::int[], $4::int[], $5::text[])
    `;
    const result = await client.query(query, [product_ids, product_names, product_prices, product_counts, img_names]);

    res.status(201).json({
      message: "多筆資料已新增",
      result
    });
  } catch (error) {
    res.status(500).json({
      error: "新增資料失敗",
      details: error.message
    });
  }
}
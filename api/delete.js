import {
  client
} from './api.js'

export const deleteShoppintCart = async (req, res) => {
  const {
    product_id,
    user_id
  } = req.body;
  console.log(req)
  try {
    const {
      rows
    } = await client.query(`SELECT cart_id FROM cart WHERE user_id = '${user_id}'`);
    const cart_id = rows[0].cart_id
    const result = await client.query("DELETE FROM cart_items WHERE product_id = $1 and cart_id = $2", [product_id, cart_id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        error: "購物車沒有此物件"
      });
    } else {
      res.status(200).json({
        message: "已移除購物車"
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "購物車移除失敗，請重新操作",
      details: error.message
    });
  }
}
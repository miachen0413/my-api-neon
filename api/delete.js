import {
  client
} from './api.js'

export const deleteShoppintCart = async (req, res) => {
  const {
    id
  } = req.params;
  console.log("id->", id)
  try {
    const result = await client.query("DELETE FROM ShoopingCart WHERE id = $1", [id]);
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
// import.js
import mongoose from "mongoose";
import fs from "fs";
import seat from "./models/seat.model.js";

async function importJSON() {
  try {
    // Kết nối MongoDB (chỉ ghi tên DB, không ghi tên collection)
    await mongoose.connect("mongodb://localhost:27017/movie_ticket_booking", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Đã kết nối MongoDB");

    // Đọc file JSON
    let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

    // Xử lý dữ liệu: bỏ timestamp cũ và chuyển đổi kiểu dữ liệu
    data = data.map(item => {
      // Xóa createdAt, updatedAt
      delete item.updatedAt;
      delete item.createdAt;

      // Xóa id cũ
      delete item.id;
      delete item._id;

      // Chuyển $oid thành ObjectId
      if (item.roomId && item.roomId.$oid) {
        item.roomId = new mongoose.Types.ObjectId(item.roomId.$oid);
      }

      // Chuyển $date thành Date
      if (item.someDateField && item.someDateField.$date) {
        item.someDateField = new Date(item.someDateField.$date);
      }

      return item;
    });

    // Import vào MongoDB
    await seat.insertMany(data);
    console.log("✅ Import thành công!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Lỗi import:", err);
  }
}

importJSON();

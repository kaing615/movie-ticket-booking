## 5. `models/`

**Chứa các schema/model (thường dùng mongoose) tương ứng với từng bảng/collection trong database.**

-   Mỗi file là một model/schema (User, Booking, Review, Chat,...).
-   Định nghĩa cấu trúc dữ liệu, các hàm thao tác DB.

**Ví dụ:**

-   `User.js`
-   `Booking.js`
-   `Review.js`

**Chứa file tạo dữ liệu mẫu**
Chạy file seed.js để tạo dữ liệu mẫu cho model, giúp tăng nhanh tốc độ phát triển và testing.

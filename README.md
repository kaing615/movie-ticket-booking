# movie-ticket-booking

## ⚡️ Khởi động nhanh dự án

### Clone code về máy

```bash
git clone https://github.com/kaing615/movie-ticket-booking
```

### Chạy bằng Docker Compose

```bash
docker compose up --build
```

### Chạy Local

Nên chạy bằng Docker để đồng bộ

#### Cài đặt backend

```bash
cd backend
cp .env.example .env        # Tạo file .env và điền biến môi trường (MongoDB, JWT, PORT)
npm install
npm run dev
```

#### Cài đặt frontend

```bash
cd frontend
npm install
npm run dev
```

### Cấu trúc thư mục

```bash
MentorMe/
├── backend/
│   ├── public/
│   ├── src/
│   ├── .env
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Chú ý workflow

### 1. Tạo nhánh riêng cho mỗi người

Ví dụ:

#### Tạo nhánh

```bash
git checkout main
git pull origin main
git checkout -b feature/tam-auth
```

#### Commit

```bash
git add .
git commit -m "Add login API"
git push -u origin feature/tam-auth
```

### 2. Khi hoàn thành 1 phần, lên GitHub tạo Pull Request (PR) từ nhánh feature/tam-auth về main

### 3. Lưu ý khi Merge

Nếu nhiều bạn cùng sửa chung 1 file, sẽ dễ bị merge conflict. Nên trao đổi rõ ai làm phần nào, hoặc tách rõ folder/module.

### 4. Đặt tên nhánh

feature/tennguoi-chucnang hoặc tennguoi-chucnang (dễ nhớ, đồng bộ là được).

## Tóm lại

- **KHÔNG push thẳng lên main.**

- **NÊN mỗi bạn 1 nhánh riêng, hoặc mỗi tính năng 1 nhánh.**

- **Tạo PR, review rồi merge vào main.**

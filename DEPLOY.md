# 🚀 Hướng dẫn Deploy lên GitHub Pages

## 📋 Checklist trước khi deploy

- ✅ Code đã được commit và push lên repository
- ✅ Build thành công (`npm run build:gh-pages`)
- ✅ GitHub Actions workflow đã được setup
- ✅ Repository settings đã được cấu hình

## 🔧 Các bước deploy

### 1. Tạo GitHub Repository

```bash
# Tạo repository mới trên GitHub với tên: frame-editor
# Hoặc sử dụng tên khác, nhớ cập nhật base-href trong package.json
```

### 2. Push code lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/frame-editor.git

# Add và commit files
git add .
git commit -m "Initial commit: Frame Editor app"

# Push lên main branch
git push -u origin main
```

### 3. Cấu hình GitHub Pages

1. **Vào repository Settings**
2. **Scroll xuống phần "Pages"**
3. **Source**: Chọn "GitHub Actions"
4. **Workflow sẽ tự động chạy** khi push code

### 4. Kiểm tra Deploy Status

1. **Vào tab "Actions"** trong repository
2. **Xem workflow "Deploy to GitHub Pages"**
3. **Chờ build và deploy hoàn tất** (khoảng 2-3 phút)
4. **Truy cập**: `https://YOUR_USERNAME.github.io/frame-editor/`

## 🔄 Auto Deploy

Mỗi khi push code lên `main` branch, GitHub Actions sẽ tự động:

1. **Install dependencies** (`npm ci`)
2. **Build production** (`npm run build:gh-pages`)
3. **Deploy lên GitHub Pages**

## 🛠️ Troubleshooting

### Build Failed
```bash
# Kiểm tra build local trước
npm run build:gh-pages

# Nếu có lỗi, fix và commit lại
git add .
git commit -m "Fix build issues"
git push origin main
```

### 404 Error
- Kiểm tra `base-href` trong `package.json` có đúng tên repository không
- Đảm bảo file `404.html` và `.nojekyll` có trong `public/`

### Assets không load
- Kiểm tra đường dẫn assets trong code
- Đảm bảo `angular.json` có config assets đúng

## 📝 Custom Domain (Optional)

Nếu muốn sử dụng domain riêng:

1. **Tạo file `CNAME`** trong `public/`:
```
yourdomain.com
```

2. **Cấu hình DNS** trỏ về GitHub Pages
3. **Update base-href** thành `/`

## 🎯 URLs sau khi deploy

- **Production**: `https://YOUR_USERNAME.github.io/frame-editor/`
- **Repository**: `https://github.com/YOUR_USERNAME/frame-editor`
- **Actions**: `https://github.com/YOUR_USERNAME/frame-editor/actions`

## 📊 Performance Tips

- Bundle size hiện tại: ~1.1MB (compressed: ~247KB)
- Lazy loading đã được setup cho browser chunk
- Assets được optimize tự động

## 🔐 Security

- Không có API keys hoặc secrets trong code
- LocalStorage được sử dụng cho custom frames
- CORS đã được handle đúng cách

---

**Lưu ý**: Thay `YOUR_USERNAME` bằng username GitHub thực tế của bạn.

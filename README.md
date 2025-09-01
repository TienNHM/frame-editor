# Frame Editor 🖼️

Ứng dụng chỉnh sửa ảnh với khung đẹp được xây dựng bằng Angular 20 và PrimeNG.

## ✨ Tính năng

- 📸 **Tải lên ảnh**: Hỗ trợ JPG, PNG, WEBP
- 🖼️ **Thư viện khung**: Nhiều khung đẹp theo chủ đề
- ⬆️ **Upload khung tùy chỉnh**: Tải lên khung riêng của bạn
- 🎨 **Chỉnh sửa**: Xoay, lật, zoom, di chuyển
- 💾 **Xuất ảnh**: Download với chất lượng cao
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🚀 Demo

**Live Demo**: [https://tiennhm.github.io/frame-editor/](https://tiennhm.github.io/frame-editor/)

## 🛠️ Công nghệ

- **Angular 20** - Framework chính
- **PrimeNG 20** - UI Components với Tailwind CSS
- **Fabric.js** - Canvas manipulation
- **TypeScript** - Type safety
- **SCSS** - Styling
- **GitHub Pages** - Deployment

## 📦 Cài đặt

```bash
# Clone repository
git clone https://github.com/tiennhm/frame-editor.git
cd frame-editor

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Mở http://localhost:4200
```

## 🏗️ Build & Deploy

### Development
```bash
npm run build
```

### GitHub Pages
```bash
# Build cho GitHub Pages
npm run build:gh-pages

# Hoặc push lên main branch để auto deploy
git push origin main
```

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── components/
│   │   ├── frame-gallery/     # Thư viện khung ảnh
│   │   ├── image-editor/      # Editor chính
│   │   ├── image-upload/      # Upload ảnh
│   │   └── header/           # Header navigation
│   ├── services/
│   │   ├── editor.service.ts  # Canvas operations
│   │   └── frame.service.ts   # Frame management
│   └── models/               # TypeScript interfaces
├── assets/
│   └── frames/              # Sample frames
└── styles.scss             # Global styles
```

## 🎯 Cách sử dụng

1. **Tải ảnh lên**: Click "Tải ảnh lên" và chọn file
2. **Chọn khung**: Browse thư viện hoặc upload khung riêng
3. **Chỉnh sửa**: Sử dụng tools để điều chỉnh ảnh
4. **Xuất ảnh**: Click "Tải xuống" để lưu kết quả

## 🔧 Cấu hình GitHub Pages

1. **Tạo repository** trên GitHub với tên `frame-editor`
2. **Push code** lên main branch
3. **Vào Settings** → Pages → Source: GitHub Actions
4. **Workflow tự động chạy** và deploy

## 📝 Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm run build:gh-pages` - Build cho GitHub Pages
- `npm test` - Run tests
- `npm run watch` - Build với watch mode

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem `LICENSE` để biết thêm thông tin.

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - Framework
- [PrimeNG](https://primeng.org/) - UI Library
- [Fabric.js](http://fabricjs.com/) - Canvas Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
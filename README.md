# Project Structure

```
vss-workflow-fe/
├── src/
│   ├── app/
│   │   ├── _helpers/
│   │   ├── _services/
│   │   ├── components/
│   │   ├── enums/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── routing/
│   │   ├── utils/
│   │   ├── _breakpoints.scss
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── quill.d.ts
│   ├── assets/
│   ├── environments/
│   ├── favicon.ico
│   ├── firebase-messaging-sw.js
│   ├── index.html
│   ├── main.ts
│   ├── manifest.webmanifest
│   ├── polyfills.ts
│   ├── styles.scss
│   └── test.ts
└── .gitignore
└── angular.json
└── package.json
└── README.md
```

## Mô tả thành phần chính

```agsl
app.module.ts: khai báo các module
```

![img.png](document%2Fimg.png)

# Thành phần cấu thành 1 chức năng

![img.png](document%2Ftinh-nang.png)

## Danh sách - tìm kiếm

```agsl
Phần danh sách gồm các tính năng chính:
- Form tìm kiếm / tìm kiếm nâng cao
- Tìm kiếm nhanh
- Hiển thị danh sách
Các tính năng optional:
- Export
- Import
- Other ...
``` 

tên module và tên file đa ngôn ngữ + tên file menu trùng nhau

"@c10t/nice-component-library": "file:../../NiceComponentLibrary_publish",

# Backend API Documentation

## نظرة عامة

هذا هو الباك اند المحسّن لتطبيق E-Commerce. يستخدم Express.js مع تخزين دائم للبيانات في ملفات JSON.

## الميزات

- ✅ تخزين دائم للبيانات (JSON files)
- ✅ API endpoints كاملة للمنتجات، المستخدمين، والطلبات
- ✅ نظام مصادقة وإذن
- ✅ التحقق من صحة البيانات (Validation)
- ✅ معالجة أخطاء محسّنة
- ✅ دعم Vercel deployment
- ✅ Fallback إلى localStorage في الفرونت اند

## البنية

```
server/
├── data/              # ملفات البيانات (JSON)
│   ├── products.json
│   ├── users.json
│   ├── orders.json
│   └── admin_emails.json
├── utils/             # أدوات مساعدة
│   ├── storage.js     # قراءة/كتابة البيانات
│   └── validation.js  # التحقق من البيانات
└── middleware/        # Middleware
    └── auth.js        # المصادقة والصلاحيات
```

## API Endpoints

### المنتجات (Products)

- `GET /api/products` - جلب جميع المنتجات
- `GET /api/products/latest` - جلب أحدث المنتجات
- `GET /api/products/:id` - جلب منتج محدد
- `POST /api/products` - إنشاء منتج جديد (Admin only)
- `PUT /api/products/:id` - تحديث منتج (Admin only)
- `DELETE /api/products/:id` - حذف منتج (Admin only)

### المستخدمين (Users)

- `GET /api/users` - جلب جميع المستخدمين (Admin only)
- `GET /api/users/:id` - جلب مستخدم محدد
- `POST /api/users/register` - تسجيل مستخدم جديد
- `POST /api/users/login` - تسجيل الدخول
- `PUT /api/users/:id` - تحديث بيانات المستخدم
- `DELETE /api/users/:id` - حذف مستخدم (Admin only)

### الطلبات (Orders)

- `GET /api/orders` - جلب جميع الطلبات (Admin only)
- `GET /api/orders/user/:userEmail` - جلب طلبات مستخدم محدد
- `GET /api/orders/:id` - جلب طلب محدد
- `POST /api/orders` - إنشاء طلب جديد
- `PUT /api/orders/:id/status` - تحديث حالة الطلب (Admin only)
- `DELETE /api/orders/:id` - حذف طلب (Admin only)

### الإدارة (Admin)

- `GET /api/admin/emails` - جلب قائمة المديرين (Admin only)
- `POST /api/admin/emails` - إضافة مدير جديد (Admin only)

### Health Check

- `GET /api/health` - فحص حالة السيرفر

## المصادقة

### Headers المطلوبة

للمستخدمين العاديين:
```
x-user-email: user@example.com
```

للمديرين:
```
x-user-email: admin@example.com
```

### المديرين المحميين

- `yahiapro400@gmail.com`
- `yahiacool2009@gmail.com`

## أمثلة الاستخدام

### تسجيل الدخول

```javascript
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const user = await response.json();
```

### إنشاء منتج جديد

```javascript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': 'admin@example.com'
  },
  body: JSON.stringify({
    title: 'New Product',
    price: 29.99,
    quantity: 10,
    category: 'clothing',
    description: 'Product description',
    image: 'https://example.com/image.jpg'
  })
});
```

### إنشاء طلب

```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': 'user@example.com'
  },
  body: JSON.stringify({
    userEmail: 'user@example.com',
    items: [
      {
        id: 1,
        name: 'Product Name',
        price: 29.99,
        quantity: 2,
        image: 'https://example.com/image.jpg'
      }
    ],
    total: 59.98,
    shipping: {
      fullName: 'John Doe',
      phone: '1234567890',
      // ... other shipping details
    }
  })
});
```

## التشغيل

### التطوير المحلي

```bash
npm run dev
```

هذا سيشغل:
- React dev server على port 3000
- Express server على port 3001

### الإنتاج

```bash
npm run build
npm start
```

## Vercel Deployment

المشروع جاهز للنشر على Vercel. ملف `vercel.json` مُكوّن بشكل صحيح.

## ملاحظات

- البيانات تُحفظ تلقائياً في ملفات JSON
- في حالة فشل API، الفرونت اند يستخدم localStorage كبديل
- كلمات المرور حالياً غير مشفرة (يُنصح بإضافة تشفير في المستقبل)
- المديرين المحميين لا يمكن حذفهم أو تعديلهم إلا من قبل أنفسهم

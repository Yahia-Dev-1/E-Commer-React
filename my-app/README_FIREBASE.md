# Firebase Backend للتجارة الإلكترونية

هذا المشروع يستخدم Firebase Realtime Database كـ backend للتجارة الإلكترونية، مما يوفر:

- ✅ قاعدة بيانات في الوقت الفعلي
- ✅ نظام مصادقة آمن
- ✅ مزامنة البيانات عبر الأجهزة
- ✅ قواعد أمان قوية
- ✅ إمكانية العمل بدون اتصال بالإنترنت

## الملفات المضافة

### 1. إعداد Firebase
```
src/firebase/
├── config.js              # تكوين Firebase
├── ecommerceService.js    # خدمة التجارة الإلكترونية
└── authService.js         # خدمة المصادقة
```

### 2. قواعد الأمان
```
firebase-rules.json        # قواعد أمان قاعدة البيانات
```

### 3. المكونات
```
src/components/
└── FirebaseExample.js     # مثال على الاستخدام
```

### 4. الأدلة
```
FIREBASE_SETUP_GUIDE.md    # دليل الإعداد الشامل
README_FIREBASE.md         # هذا الملف
```

## الميزات المتاحة

### 🔥 المنتجات
```javascript
// إضافة منتج جديد
await ecommerceService.addProduct({
  title: "منتج جديد",
  description: "وصف المنتج",
  price: 99.99,
  category: "إلكترونيات",
  quantity: 10
});

// جلب جميع المنتجات
const products = await ecommerceService.getAllProducts();

// الاستماع للتغييرات في الوقت الفعلي
const unsubscribe = ecommerceService.listenToProducts((products) => {
  console.log('تم تحديث المنتجات:', products);
});
```

### 👥 المستخدمين
```javascript
// تسجيل مستخدم جديد
await authService.register(email, password, name);

// تسجيل الدخول
const result = await authService.login(email, password);

// الاستماع لحالة المصادقة
authService.onAuthStateChange((authData) => {
  if (authData) {
    console.log('المستخدم مسجل الدخول:', authData.userData);
  } else {
    console.log('المستخدم غير مسجل الدخول');
  }
});
```

### 📦 الطلبات
```javascript
// إنشاء طلب جديد
await ecommerceService.createOrder({
  userId: user.id,
  items: cartItems,
  total: 150.00,
  shipping: shippingData
});

// جلب طلبات المستخدم
const userOrders = await ecommerceService.getUserOrders(userId);

// تحديث حالة الطلب
await ecommerceService.updateOrderStatus(orderId, 'shipped');
```

### 🛒 السلة
```javascript
// حفظ سلة المستخدم
await ecommerceService.saveUserCart(userId, cartItems);

// جلب سلة المستخدم
const cart = await ecommerceService.getUserCart(userId);

// حذف السلة
await ecommerceService.clearUserCart(userId);
```

## كيفية الاستخدام في المكونات

### 1. تحميل المنتجات مع الاستماع للتغييرات
```javascript
import React, { useState, useEffect } from 'react';
import ecommerceService from '../firebase/ecommerceService';

const ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // الاستماع للتغييرات في المنتجات
    const unsubscribe = ecommerceService.listenToProducts((productsData) => {
      setProducts(productsData);
      setLoading(false);
    });

    // تنظيف عند إلغاء المكون
    return () => unsubscribe();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

### 2. إدارة المصادقة
```javascript
import React, { useState, useEffect } from 'react';
import authService from '../firebase/authService';

const AuthComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((authData) => {
      setUser(authData?.userData || null);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await authService.login(email, password);
      console.log('تم تسجيل الدخول:', result);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>مرحباً، {user.name}!</p>
          <button onClick={() => authService.logout()}>
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>تسجيل الدخول</button>
      )}
    </div>
  );
};
```

## هيكل البيانات في Firebase

### المنتجات
```json
{
  "products": {
    "product_id_1": {
      "id": "product_id_1",
      "title": "منتج مميز",
      "description": "وصف المنتج",
      "price": 99.99,
      "category": "إلكترونيات",
      "quantity": 10,
      "image": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### المستخدمين
```json
{
  "users": {
    "user_id_1": {
      "id": "user_id_1",
      "email": "user@example.com",
      "name": "اسم المستخدم",
      "uid": "firebase_auth_uid",
      "isAdmin": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "orders": ["order_id_1", "order_id_2"]
    }
  }
}
```

### الطلبات
```json
{
  "orders": {
    "order_id_1": {
      "id": "order_id_1",
      "userId": "user_id_1",
      "items": [
        {
          "id": "product_id_1",
          "title": "منتج مميز",
          "price": 99.99,
          "quantity": 2
        }
      ],
      "total": 199.98,
      "status": "pending",
      "shipping": {
        "address": "عنوان الشحن",
        "city": "المدينة"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### السلة
```json
{
  "carts": {
    "user_id_1": {
      "items": [
        {
          "id": "product_id_1",
          "title": "منتج مميز",
          "price": 99.99,
          "quantity": 1
        }
      ],
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## قواعد الأمان

### المنتجات
- **القراءة**: متاحة للجميع
- **الكتابة**: المديرون فقط

### المستخدمين
- **القراءة**: المستخدم نفسه أو المديرون
- **الكتابة**: المستخدم نفسه أو المديرون

### الطلبات
- **القراءة**: المستخدمون يرون طلباتهم، المديرون يرون جميع الطلبات
- **الكتابة**: المستخدمون يمكنهم إنشاء طلبات، المديرون يمكنهم تحديثها

### السلة
- **القراءة/الكتابة**: المستخدم نفسه فقط

## نصائح للأداء

### 1. استخدام الاستماع بدلاً من الجلب المتكرر
```javascript
// ✅ جيد - الاستماع للتغييرات
const unsubscribe = ecommerceService.listenToProducts(setProducts);

// ❌ سيء - الجلب المتكرر
setInterval(async () => {
  const products = await ecommerceService.getAllProducts();
  setProducts(products);
}, 1000);
```

### 2. تصفية البيانات في قاعدة البيانات
```javascript
// ✅ جيد - تصفية في قاعدة البيانات
const userOrders = await ecommerceService.getUserOrders(userId);

// ❌ سيء - جلب جميع البيانات ثم التصفية
const allOrders = await ecommerceService.getAllOrders();
const userOrders = allOrders.filter(order => order.userId === userId);
```

### 3. استخدام التحديثات الجزئية
```javascript
// ✅ جيد - تحديث جزئي
await ecommerceService.updateProduct(productId, { quantity: newQuantity });

// ❌ سيء - تحديث كامل
const product = await ecommerceService.getProduct(productId);
product.quantity = newQuantity;
await ecommerceService.updateProduct(productId, product);
```

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في التكوين**
   ```
   Error: Firebase: Error (auth/invalid-api-key)
   ```
   **الحل**: تأكد من صحة بيانات التكوين في `config.js`

2. **مشاكل في القواعد**
   ```
   Error: Firebase: Error (database/permission-denied)
   ```
   **الحل**: تأكد من تطبيق قواعد الأمان الصحيحة

3. **مشاكل في المصادقة**
   ```
   Error: Firebase: Error (auth/user-not-found)
   ```
   **الحل**: تأكد من تفعيل "البريد الإلكتروني/كلمة المرور" في Firebase Console

### نصائح للتطوير:

1. استخدم وحدة تحكم المتصفح لاختبار الخدمات
2. تحقق من سجلات Firebase Console للأخطاء
3. استخدم `console.log` لتتبع البيانات
4. اختبر قواعد الأمان في Firebase Console

## التطوير المستقبلي

- [ ] إضافة Firebase Storage للصور
- [ ] إضافة Cloud Functions للمعالجة في الخادم
- [ ] إضافة Firebase Analytics للتتبع
- [ ] إضافة Firebase Cloud Messaging للإشعارات
- [ ] إضافة دعم المدفوعات
- [ ] إضافة نظام المراجعات والتقييمات

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يمكنك:

1. مراجعة [دليل الإعداد](FIREBASE_SETUP_GUIDE.md)
2. التحقق من [وثائق Firebase](https://firebase.google.com/docs)
3. مراجعة سجلات الأخطاء في Firebase Console 
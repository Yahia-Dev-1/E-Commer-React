# دليل إعداد EmailJS لإرسال الإيميلات

## الخطوة 1: إنشاء حساب EmailJS

1. اذهب إلى [EmailJS.com](https://www.emailjs.com/)
2. اضغط على "Sign Up" لإنشاء حساب جديد
3. أدخل بريدك الإلكتروني وكلمة المرور
4. قم بتأكيد الحساب عبر البريد الإلكتروني

## الخطوة 2: الحصول على User ID

1. بعد تسجيل الدخول، اذهب إلى "Account" في القائمة الجانبية
2. ستجد "User ID" في أعلى الصفحة
3. انسخ هذا الرقم (مثال: `user_abc123def456`)

## الخطوة 3: إعداد Email Service

1. اذهب إلى "Email Services" في القائمة الجانبية
2. اضغط على "Add New Service"
3. اختر نوع الخدمة (Gmail, Outlook, Yahoo, etc.)
4. أدخل بيانات حسابك الإلكتروني
5. احصل على "Service ID" (مثال: `service_xyz789`)

### إعداد Gmail:
- استخدم حساب Gmail الخاص بك
- قد تحتاج لتفعيل "Less secure app access" أو استخدام App Password

## الخطوة 4: إنشاء Email Template

1. اذهب إلى "Email Templates" في القائمة الجانبية
2. اضغط على "Create New Template"
3. أدخل اسم للقالب (مثال: "Order Notification")
4. في محتوى القالب، استخدم المتغيرات التالية:

```
Subject: {{subject}}

{{message}}

---
Sent from {{from_name}}
```

5. احصل على "Template ID" (مثال: `template_123abc`)

## الخطوة 5: تحديث الكود

### تحديث ملف `public/index.html`:

```javascript
emailjs.init("YOUR_USER_ID"); // استبدل بـ User ID الخاص بك

window.emailjsConfig = {
  serviceId: 'YOUR_SERVICE_ID', // استبدل بـ Service ID الخاص بك
  templateId: 'YOUR_TEMPLATE_ID', // استبدل بـ Template ID الخاص بك
  userId: 'YOUR_USER_ID' // استبدل بـ User ID الخاص بك
};
```

### مثال على التكوين النهائي:

```javascript
emailjs.init("user_abc123def456");

window.emailjsConfig = {
  serviceId: 'service_xyz789',
  templateId: 'template_123abc',
  userId: 'user_abc123def456'
};
```

## الخطوة 6: اختبار الإرسال

1. شغل المشروع: `npm start`
2. اذهب إلى صفحة Admin
3. جرب رفض أو حذف طلب
4. ستظهر رسالة تأكيد إرسال الإيميل

## ملاحظات مهمة:

### حدود EmailJS المجانية:
- 200 إيميل شهرياً مجاناً
- للاستخدام التجاري، قد تحتاج لخطة مدفوعة

### استكشاف الأخطاء:
- تأكد من أن جميع الـ IDs صحيحة
- تحقق من إعدادات حساب البريد الإلكتروني
- راجع Console في المتصفح للأخطاء

### بدائل أخرى:
- SendGrid
- AWS SES
- Nodemailer (للخادم)

## مثال على رسالة الإيميل:

```
Subject: Order Rejected - #12345

Dear Customer,

Your order #12345 has been rejected.

If you have any questions, please contact our support team.

Best regards,
Admin Team

---
Sent from E-Commerce Admin
```

## دعم فني:
إذا واجهت أي مشاكل، راجع:
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/) 
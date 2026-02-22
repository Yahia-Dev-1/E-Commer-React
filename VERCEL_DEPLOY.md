# دليل النشر على Vercel

## الخطوات السريعة

### 1. تثبيت Vercel CLI (إذا لم يكن مثبتاً)
```bash
npm i -g vercel
```

### 2. تسجيل الدخول إلى Vercel
```bash
vercel login
```

### 3. النشر
```bash
# النشر الأول (اختيار المشروع)
vercel

# النشر للإنتاج
vercel --prod
```

## النشر عبر GitHub (مُوصى به)

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول بحساب GitHub
3. اضغط على "Add New Project"
4. اختر المستودع `E-Commer-React`
5. Vercel سيكتشف الإعدادات تلقائياً من `vercel.json`
6. اضغط "Deploy"

## الإعدادات الحالية

- ✅ `vercel.json` مُكوّن بشكل صحيح
- ✅ الباك اند جاهز للعمل على Vercel
- ✅ الـ routes مُعرّفة بشكل صحيح
- ✅ الـ API endpoints تعمل على `/api/*`

## ملاحظات مهمة

1. **البيانات**: البيانات تُحفظ في ملفات JSON محلياً. في Vercel، البيانات ستكون مؤقتة (ephemeral) لأن الملفات تُحذف عند إعادة النشر.

2. **لحفظ البيانات بشكل دائم**: يُنصح باستخدام:
   - Vercel KV (Redis)
   - MongoDB Atlas
   - PostgreSQL
   - أو أي قاعدة بيانات خارجية

3. **Environment Variables**: يمكن إضافة متغيرات البيئة من لوحة تحكم Vercel:
   - `NODE_ENV=production`
   - أي متغيرات أخرى تحتاجها

## التحقق من النشر

بعد النشر، يمكنك التحقق من:
- ✅ الموقع الرئيسي يعمل
- ✅ API endpoints تعمل: `https://your-project.vercel.app/api/products`
- ✅ Health check: `https://your-project.vercel.app/api/health`

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. **تحقق من Logs**: في لوحة تحكم Vercel → Functions → Logs
2. **تحقق من Build Logs**: في صفحة Deployment
3. **تحقق من Routes**: تأكد أن `vercel.json` صحيح

## الملفات المهمة

- `vercel.json` - إعدادات Vercel
- `server.js` - الباك اند
- `package.json` - إعدادات المشروع
- `.vercelignore` - الملفات التي يجب تجاهلها

---

**جاهز للنشر! 🚀**

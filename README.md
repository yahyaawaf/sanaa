# موقع سناء مشهور — نسخة جاهزة لـ GitHub Pages

هذه النسخة معدلة لتعمل مباشرة على **GitHub Pages** دون الحاجة إلى تشغيل Node.js.

## النشر
1. أنشئ مستودعًا جديدًا على GitHub.
2. ارفع **محتويات هذا المجلد** إلى الفرع `main`.
3. افتح: **Settings → Pages**.
4. في **Build and deployment / Source** اختر **GitHub Actions**.
5. سيعمل ملف `.github/workflows/pages.yml` تلقائيًا وينشر الموقع.

## ما تم تعديله
- تحويل مسارات CSS وJavaScript والفيديو والصور إلى مسارات نسبية لتعمل مهما كان اسم المستودع.
- إزالة سكربت GPT Engineer الخارجي غير الضروري للتشغيل.
- تحويل رابط صورة HTTP إلى HTTPS لتجنب Mixed Content على GitHub Pages.
- استبدال عداد PostgreSQL/Express بعداد محلي يعمل في المتصفح، لأن GitHub Pages لا يشغّل خادم Node.js أو قاعدة PostgreSQL.
- الاحتفاظ بالخادم الأصلي داخل مجلد `backend/` للاستخدام لاحقًا على استضافة تدعم Node.js.
- عدم تضمين ملف `.env` الأصلي أو أي بيانات اتصال حساسة، وإضافة `backend/.env.example` بدلًا منه.

## ملاحظة عن عداد الزيارات
العداد في نسخة GitHub Pages الحالية محفوظ محليًا في المتصفح (`localStorage`) وليس عدادًا عالميًا لجميع الزوار. للحصول على عداد عالمي يلزم Backend أو خدمة خارجية للعداد.

## الخادم الأصلي
مجلد `backend/` يحتوي على:
- `server.js`
- `package.json`
- `package-lock.json`
- `.env.example`

ولا يتم نشره أو تشغيله بواسطة GitHub Pages.

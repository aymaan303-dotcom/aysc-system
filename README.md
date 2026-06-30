# تشغيل نظام AYSC محلياً ثم رفعه على Vercel

## 1) المتطلبات
- Node.js مثبت على جهازك (نزّله من nodejs.org لو مش موجود)

## 2) التثبيت والتشغيل محلياً

```bash
cd aysc-project
npm install
npm start
```

سيفتح المتصفح تلقائياً على http://localhost:3000
جرّب تسجيل الدخول بـ:
- البريد: admin@aysc.com
- كلمة المرور: (اللي اخترتها في Supabase)

## 3) الرفع على Vercel (للحصول على رابط دائم للموظفين)

أ) أنشئ حساب على vercel.com (مجاني) وسجّل دخول بـ GitHub

ب) ارفع المشروع على GitHub:
```bash
git init
git add .
git commit -m "AYSC system"
```
ثم أنشئ repository جديد على github.com وارفع الكود إليه

ج) من لوحة Vercel:
1. اضغط "Add New Project"
2. اختر الـ repository بتاعك
3. اضغط "Deploy"

سيعطيك Vercel رابطاً مثل: `aysc-system.vercel.app`
هذا هو الرابط اللي تشاركه مع الموظفين.

## ملاحظة أمان مهمة
ملف supabaseClient.js يحتوي على الـ anon key فقط (آمن للمشاركة العامة).
الحماية الفعلية للبيانات تتم عبر RLS Policies في Supabase التي أنشأناها سابقاً.

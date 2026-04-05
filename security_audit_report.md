# 🔒 تقرير الفحص الأمني الشامل — موقع د. أمين بلحاج

> **تاريخ الفحص:** 2026-04-04
> **نوع الفحص:** Penetration Testing + Code Audit
> **المستوى:** شامل (XSS, CSRF, IDOR, Injection, Auth Bypass, Data Exposure)

---

## 📊 ملخص النتائج

| المستوى | العدد | الوصف |
|---------|-------|-------|
| 🔴 **حرج (Critical)** | 3 | ثغرات تسمح بسرقة بيانات أو التحكم |
| 🟠 **عالي (High)** | 4 | ثغرات قابلة للاستغلال |
| 🟡 **متوسط (Medium)** | 3 | مشاكل يجب معالجتها |
| 🟢 **إيجابيات** | 6 | ممارسات أمنية جيدة موجودة |

---

## 🟢 الممارسات الأمنية الجيدة (ما هو سليم)

1. ✅ **تشفير AES-256-GCM** للبيانات الحساسة (الأسماء، الهواتف، أسباب الزيارة)
2. ✅ **Scrypt + Timing-Safe Comparison** لكلمات المرور (مقاوم لهجمات التوقيت)
3. ✅ **Security Headers** في `next.config.mjs` (X-Frame-Options: DENY, HSTS, XSS-Protection)
4. ✅ **Zod Validation** في نموذج المواعيد (التحقق من المدخلات)
5. ✅ **Audit Logs** لتتبع العمليات الحساسة
6. ✅ **عدم استخدام `dangerouslySetInnerHTML`** — لا يوجد مخاطر XSS مباشرة في React

---

## 🔴 ثغرات حرجة (Critical) — يجب إصلاحها فوراً

### 🔴 CVE-01: غياب التحقق من صلاحية "دكتور" في أغلب API Routes

> [!CAUTION]
> **الملفات المتأثرة:** `gallery/route.ts`, `settings/route.ts`, `testimonials/route.ts`, `videos/route.ts`

**المشكلة:** هذه الـ API Routes تتحقق فقط من أن المستخدم **مسجل الدخول** (`auth.getUser()`) لكنها **لا تتحقق أن دوره هو `doctor`**. أي مستخدم عادي (مريض) يمكنه:
- ❌ **حذف صور المعرض** عبر `DELETE /api/gallery?id=xxx`
- ❌ **تعديل إعدادات الموقع** عبر `PATCH /api/settings`
- ❌ **حذف التقييمات** عبر `DELETE /api/testimonials?id=xxx`
- ❌ **نشر/إخفاء التقييمات** عبر `PATCH /api/testimonials`

**الحل المطلوب:** إضافة فحص الدور في كل route حساس:
```typescript
// يجب إضافة هذا في كل API route خاص بالأدمن
const { data: profile } = await adminClient
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'doctor') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

### 🔴 CVE-02: الـ Contact API بدون حماية من Spam/Bot

> [!CAUTION]
> **الملف:** `contact/route.ts`

**المشكلة:** نموذج "اتصل بنا" (`POST /api/contact`) **لا يتطلب أي مصادقة ولا Rate Limiting ولا CAPTCHA**. يمكن لأي شخص أو Bot إرسال آلاف الرسائل:
```bash
# هجمة بسيطة يمكنها ملء قاعدة البيانات
for i in {1..10000}; do
  curl -X POST http://site.com/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"spam","email":"x@x.com","subject":"spam","message":"spam"}'
done
```

**الحل:** إضافة Rate Limiting + Honeypot field أو CAPTCHA.

---

### 🔴 CVE-03: الـ AI Chat API بدون Rate Limiting

> [!CAUTION]
> **الملف:** `ai/chat/route.ts`

**المشكلة:** أي شخص يمكنه إرسال مئات الطلبات للـ AI API مما يستنزف رصيدك في Gemini/OpenRouter:
```bash
# هجمة استنزاف الرصيد
for i in {1..500}; do
  curl -X POST http://site.com/api/ai/chat \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done
```

---

## 🟠 ثغرات عالية الخطورة (High)

### 🟠 CVE-04: تسريب تفاصيل الخطأ في الاستجابات

**الملف:** `contact/route.ts` (سطر 30)
```typescript
// ❌ يكشف تفاصيل الخطأ الداخلي للمهاجم
return NextResponse.json({ error: 'خطأ في معالجة الرسالة: ' + (error.message || '') })
```
**الخطر:** `error.message` قد يحتوي على تفاصيل قاعدة البيانات أو مسارات الملفات.
**الحل:** إخفاء تفاصيل الخطأ:
```typescript
return NextResponse.json({ error: 'خطأ في معالجة الرسالة' }, { status: 500 })
```

---

### 🟠 CVE-05: الـ Testimonials GET يكشف الكل عبر `?admin=true`

**الملف:** `testimonials/route.ts` (سطر 10)
```typescript
const isAdminMode = searchParams.get('admin') === 'true'
```
**الخطر:** أي شخص يمكنه إضافة `?admin=true` للرابط لرؤية **جميع التقييمات** بما فيها المخفية/غير المنشورة. لا يوجد تحقق من الهوية هنا.

---

### 🟠 CVE-06: غياب تنظيف المدخلات (Input Sanitization)

**الملفات:** `contact/route.ts`, `testimonials/route.ts`

**المشكلة:** البيانات المدخلة (الأسماء، الرسائل، التقييمات) تُخزن مباشرة بدون تنظيف. رغم أن React يحمي من XSS عند العرض، إلا أن البيانات الخبيثة تبقى في قاعدة البيانات ويمكن أن تُستغل إذا عُرضت في سياق آخر (مثل لوحة تحكم خارجية أو تقرير PDF).

---

### 🟠 CVE-07: مفتاح API مكشوف في الكود

**الملف:** `chat/route.ts` (سطر 7)
```typescript
const AI_MODEL = "google/gemini-flash-1.5-exp:free"
```
**ملاحظة:** المفتاح ذاته محمي في `.env.local` ✅ لكن تأكد أن `.env.local` **مضاف في `.gitignore`** قبل رفع الكود على GitHub.

---

## 🟡 ثغرات متوسطة (Medium)

### 🟡 CVE-08: عدم وجود CORS Configuration
لا يوجد تكوين صريح لـ CORS في API Routes. في بيئة الإنتاج (Vercel)، Next.js يتعامل مع هذا تلقائياً لنفس الدومين، لكن الأفضل تحديده صراحةً.

### 🟡 CVE-09: الـ Middleware لا يحمي صفحات الأدمن
الـ `middleware.ts` يقرأ حالة المصادقة فقط لتجديد الكوكيز لكنه **لا يمنع الوصول غير المصرح** لصفحة `/dashboard`. الحماية تعتمد فقط على الـ Layout (client-side) وهي قابلة للتجاوز.

### 🟡 CVE-10: غياب Content Security Policy (CSP)
الموقع لا يحتوي على CSP Header. هذا يسمح نظرياً بتحميل سكربتات خارجية في حال وجود ثغرة XSS مستقبلية.

---

## 🛠️ خطة الإصلاح المقترحة (بالترتيب)

| # | الثغرة | الأولوية | الإصلاح |
|---|--------|----------|---------|
| 1 | CVE-01 | 🔴 فوري | إضافة `requireDoctor()` helper لكل admin API |
| 2 | CVE-02 | 🔴 فوري | Rate Limiting للـ Contact form |
| 3 | CVE-03 | 🔴 فوري | Rate Limiting للـ AI Chat |
| 4 | CVE-04 | 🟠 سريع | إخفاء تفاصيل الأخطاء |
| 5 | CVE-05 | 🟠 سريع | التحقق من الهوية في testimonials admin mode |
| 6 | CVE-06 | 🟠 سريع | تنظيف المدخلات بـ DOMPurify |
| 7 | CVE-09 | 🟡 مهم | حماية `/dashboard` في Middleware |
| 8 | CVE-10 | 🟡 مهم | إضافة CSP Header |

---

> [!IMPORTANT]
> **هل تريد أن أبدأ بتنفيذ الإصلاحات فوراً؟** سأبدأ بالثغرات الحرجة (CVE-01 إلى CVE-03) ثم أنتقل للباقي. كل إصلاح سيكون سطور قليلة مدروسة بدون كسر أي شيء.


# 🧰 الهنجر — The Hangar (Digital Workshop)

> **ورشتك الرقمية، من الفكرة للإنجاز.**  
> دليل ومجمع أدوات المطورين وصناع المحتوى: أدوات الويب، التصميم والموكابس، الذكاء الاصطناعي، والمونتاج والصوتيات.

---

## 🌟 مميزات المشروع

- **43 أداة وموقع وبرنامج مكتبي** مصنفة بدقة في 4 مسارات:
  - 🌐 **الويب والتطوير:** Aceternity UI, shadcn/ui, Uiverse, v0.dev, Cursor AI, VS Code, Bolt.new, Tailwind UI...
  - 🎨 **الصور والتصميم والموكابس:** Shots.so, CleanPNG, Mockup World, Clipdrop, Upscayl (AI Upscaling), Midjourney, FLUX.1...
  - 🎬 **الفيديو والمونتاج:** CapCut, Kling AI, Runway Gen-3, DaVinci Resolve, Pexels Video, Submagic...
  - 🎙️ **الصوت والمؤثرات:** ElevenLabs, Adobe Podcast, Audacity, Freesound, Suno AI, Pixabay Music...
- **تصنيف التكلفة الثلاثي:**
  - 🟢 **عِدة ببلاش (Free & Open Source)**
  - 🟡 **جربها ببلاش (Free Tier / Trial)**
  - 🟣 **عِدة متكلفة (Pro & Premium)**
- **مسارات جاهزة (Roadmaps):** خطوات إرشادية مباشرة لتحقيق هدفك (عمل موقع، صورة منتج تجاري، فيديو، بودكاست).
- **مفضلة تفاعلية (Favorites):** حفظ الأدوات المفضلة محلياً في الذاكرة.
- **تطبيق مكتبي أصلي (Desktop App):** مشغل فائق الخفة بتقنية Microsoft Edge WebView2 (~40MB RAM).
- **مثبت ويندوز مستقل (Installer):** ملف `The_Hangar_Setup.exe` بحجم 1.4 ميجابايت فقط ينشئ اختصارات سطح المكتب وقائمة ابدأ وبرنامج إلغاء التثبيت.
- **نظام تحديث تلقائي (Auto-Updater):** فحص ذكي في الخلفية عبر `version.json` مع تثبيت صامت وإعادة تشغيل تلقائي.

---

## 🚀 تشغيل نسخة الويب محلياً (Web Development)

```bash
cd GOat
pnpm install
pnpm dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🛠️ بناء مثبت ويندوز المكتبي (Desktop Installer Build)

1. تصدير ملفات الويب السكونية:
```bash
cd GOat
pnpm build
```

2. نسخ ملفات `out/` إلى `desktop/ui/`.
3. تجميع ملف المثبت عبر مترجم C# المدمج في ويندوز:
```cmd
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /optimize+ /out:"The_Hangar_Setup.exe" /win32icon:"TheHangar.ico" /win32manifest:"app.manifest" /res:"TheHangar_Payload.zip",Payload.zip /r:System.dll,System.Windows.Forms.dll,System.Drawing.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll Installer.cs
```

---

## 🔄 نظام التحديث التلقائي (Auto-Update System)

يتحكم ملف [`version.json`](./version.json) في إشعار المستخدمين بالتحديثات:
```json
{
  "version": "1.0.0",
  "name": "The Hangar",
  "releaseDate": "2026-10-24",
  "releaseNotes": "الإصدار الرسمي الأول من الهنجر مع 43 أداة وموقع وبرنامج.",
  "downloadUrl": "https://github.com/AMOXMorad/Hanger/releases/download/v1.0.0/The_Hangar_Setup.exe",
  "mandatory": false
}
```

### لإطلاق تحديث جديد:
1. ارفع ملف `The_Hangar_Setup.exe` الجديد في GitHub Releases.
2. عدّل `"version": "1.1.0"` في `version.json` على المستودع وضع رابط الإصدار الجديد.
3. فور اتصال أي مستخدم بالإنترنت وتشغيل البرنامج، سيظهر له إشعار التحديث الفوري ويتم التثبيت الصامت بضغطة زر واحدة!

---

## 👤 المطور والإلهام
- **المطور:** مراد (Morad) — [@AMOXMorad](https://github.com/AMOXMorad)
- **الإلهام البصري:** عمار محمدي ([@ammar1080p](https://www.instagram.com/ammar1080p/)) — صاحب مشروع *The Pickles Fridge*.

---
Licensed under MIT.

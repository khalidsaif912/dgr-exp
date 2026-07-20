# dgr-exp — ألعاب الذاكرة (Netlify)

موقع ثابت: [dgr-exp.netlify.app](https://dgr-exp.netlify.app/)

## النشر

1. اربط هذا المستودع بموقع Netlify (Publish directory: `.`).
2. أو: `netlify deploy --prod --dir .`

## الأصول

صور البطاقات من مستودع [Games](https://github.com/khalidsaif912/Games) عبر jsDelivr (أسرع من raw.githubusercontent).

## السجلات

Firestore — لا تغيّر `gameId` في صفحات الألعاب.

## تحسينات الأداء

- خلفية تدرج خفيف بدون `wallpaper.png` وبدون `background-attachment: fixed`
- إزالة `backdrop-filter` الثقيل
- CDN + `manifest.json` للاختبار (بدون GitHub API token)

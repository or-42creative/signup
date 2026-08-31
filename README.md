# ערב סימוראי חגיגי · AnniverSimor — עמוד אישור הגעה

עמוד נחיתה סטטי (GitHub Pages) לאירוע "ערב סימוראי חגיגי" — יום ההכרזה על פלוגת סימור המתחדשת.
טופס אישור הגעה שמתחבר ל-Google Sheets ושולח מייל אישור לנרשם (עם ניווט Waze + הוספה ליומן).

**פרטי האירוע:** יום שני 7.9.2026 · 18:30 · אנדרטת סימור

## קבצים
- `index.html` — כל העמוד (עיצוב כהה/סמוראי + טופס). קובץ אחד, ללא תלויות.
- `Code.gs` — Google Apps Script (קליטת אישורים + מייל).
- `assets/coin.jpg` — גרפיקת המדליה (מרכז ההירו + תמונת שיתוף).

## שלב 1 — חיבור ל-Google Sheets
1. צרו Google Sheet חדש.
2. **Extensions ▸ Apps Script** → מחקו הכל → הדביקו את `Code.gs` → שמרו.
3. **Deploy ▸ New deployment ▸ Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**  ← חובה
4. **Deploy** → אשרו הרשאות (Advanced → Go to project → Allow).
5. העתיקו את ה-**Web app URL** (מסתיים ב-`/exec`).

בדיקה מהירה: פתיחת ה-URL בדפדפן צריכה להראות `{"ok":true,"msg":"Web app is live · ..."}`.

## שלב 2 — חיבור העמוד
ב-`index.html`, בתחתית הקובץ, החליפו:
```js
const SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```
בכתובת שהעתקתם. שמרו.

## שלב 3 — פרסום ל-GitHub Pages
```bash
git add . && git commit -m "update" && git push
```
Settings ▸ Pages ▸ Branch: main / (root). הכתובת: `https://<user>.github.io/signup/`

## שדות הטופס
שם · שם משפחה · אימייל · הגעה (אני מגיע בטוח / אני מגיע 90% / לצערי לא אגיע).
עמודות בגיליון: חותמת זמן · שם · שם משפחה · אימייל · הגעה.

## מיקום / Waze
הקישור ל-Waze מוגדר בשני הקבצים כחיפוש לפי השם "אנדרטת סימור"
(`const WAZE_URL` ב-index.html וב-Code.gs). להצמדה מדויקת יותר, החליפו לקואורדינטות:
`https://waze.com/ul?ll=32.0000,34.0000&navigate=yes`.

## הערות
- הטופס שולח ב-`no-cors` (הדרך התקנית מול Apps Script) — העמוד מציג "תודה" אחרי השליחה.
- שינית את `Code.gs`? צריך **Deploy ▸ Manage deployments ▸ Edit ▸ Version: New version**.
- מיילים נשלחים מחשבון ה-Google שהריץ את הסקריפט.

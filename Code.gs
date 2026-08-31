/**
 * ערב סימוראי חגיגי — פלוגת סימור המתחדשת · אישורי הגעה ל-Google Sheets + מייל אישור.
 *
 * התקנה (פעם אחת):
 * 1. פתחו Google Sheet חדש.
 * 2. Extensions ▸ Apps Script → מחקו הכל → הדביקו את הקובץ הזה → שמרו.
 * 3. Deploy ▸ New deployment ▸ סוג "Web app":
 *      Execute as: Me   |   Who has access: Anyone   (חובה!)
 *    Deploy → אשרו הרשאות.
 * 4. העתיקו את ה-Web app URL (מסתיים ב-/exec) והדביקו ב-index.html בשורת SCRIPT_URL.
 *
 * שינית את הקוד? Deploy ▸ Manage deployments ▸ Edit ▸ Version: New version.
 */

// ===================== הגדרות =====================
const SHEET_NAME  = 'אישורי הגעה';
const EVENT_NAME  = 'ערב סימוראי חגיגי — פלוגת סימור המתחדשת';
const EVENT_WHEN  = 'יום שני | 7.9.2026 | 18:30';
const EVENT_PLACE = 'אנדרטת סימור';
const SENDER_NAME = 'פלוגת סימור';
const WAZE_URL    = 'https://waze.com/ul?q=' + encodeURIComponent('אנדרטת סימור') + '&navigate=yes';
// קישור "הוספה ליומן Google" — יום שני 7.9.2026, 18:30–22:00 (שעון ישראל):
const CAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text='     + encodeURIComponent(EVENT_NAME) +
  '&dates=20260907T183000/20260907T220000' +
  '&ctz=Asia/Jerusalem' +
  '&location=' + encodeURIComponent(EVENT_PLACE) +
  '&details='  + encodeURIComponent('יומולדת לסימור.\n\nניווט ב-Waze: ' + WAZE_URL);
// אופציונלי: מייל לקבלת התראה על כל אישור (השאירו ריק לביטול):
const NOTIFY_EMAIL = '';
// ==================================================

const HEADERS = ['חותמת זמן', 'שם מלא', 'אימייל', 'הגעה'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data  = parseInput_(e);
    const sheet = getSheet_();
    sheet.appendRow([ new Date(), data.fullName || '', data.email || '', data.rsvp || '' ]);

    if (data.email) sendConfirmation_(data);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'אישור הגעה חדש · ' + EVENT_NAME,
        (data.fullName || '') + ' — ' + (data.rsvp || ''));
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  return json_({ ok: true, msg: 'Web app is live · ' + EVENT_NAME });
}

// ---------------- עוזרים ----------------
function parseInput_(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return (e && e.parameter) ? e.parameter : {};
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const current = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0] : [];
  if (current.join('|') !== HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** שליחת מייל אישור לנרשם (מותאם לפי סוג ההגעה). */
function sendConfirmation_(data) {
  const coming = (data.rsvp || '') !== 'לצערי לא אגיע';
  const name   = (data.fullName || '').trim().split(' ')[0];
  const hello  = name ? ('שלום ' + name + ',') : 'שלום,';
  const subject = (coming ? 'נתראה! · ' : 'תודה על העדכון · ') + EVENT_NAME;

  const comingHtml =
      '<p>רשמנו את האישור שלך (<strong>' + escapeHtml_(data.rsvp || '') + '</strong>).</p>' +
      '<p><strong>מתי:</strong> ' + escapeHtml_(EVENT_WHEN) + '<br>' +
         '<strong>איפה:</strong> ' + escapeHtml_(EVENT_PLACE) + '</p>' +
      '<p style="margin:22px 0">' +
        btn_(WAZE_URL, '🧭 ניווט ב-Waze', '#0b1220', '#7db2ff', '#1b3a6b') + '&nbsp;&nbsp;' +
        btn_(CAL_URL, '📅 הוספה ליומן', '#141416', '#eceae6', '#33333a') +
      '</p>';
  const notComingHtml =
      '<p>רשמנו שלא תגיע הפעם. חבל שלא נתראה — עד הפעם הבאה. 🐺</p>';

  const htmlBody =
    '<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;background:#0a0a0b;color:#eceae6;line-height:1.6;max-width:560px;margin:auto;padding:26px;border-radius:14px">' +
      '<h2 style="margin:0 0 6px;color:#e63946">' + (coming ? 'נרשמת, נתראה בקרב! 🔥' : 'תודה על העדכון 🙏') + '</h2>' +
      '<p>' + escapeHtml_(hello) + '</p>' +
      '<p>' + escapeHtml_(EVENT_NAME) + '</p>' +
      (coming ? comingHtml : notComingHtml) +
      '<hr style="border:none;border-top:1px solid #26262b;margin:22px 0">' +
      '<p style="font-size:12px;color:#8f8c86;letter-spacing:.1em">פלוגת סימור · גדוד 43</p>' +
    '</div>';

  const plainBody =
    hello + '\n\n' + EVENT_NAME + '\n' +
    (coming
      ? ('רשמנו את האישור שלך (' + (data.rsvp || '') + ').\n' +
         'מתי: ' + EVENT_WHEN + '\nאיפה: ' + EVENT_PLACE + '\n\n' +
         'ניווט ב-Waze: ' + WAZE_URL + '\nהוספה ליומן: ' + CAL_URL)
      : 'רשמנו שלא תגיע הפעם. עד הפעם הבאה.');

  MailApp.sendEmail({ to: data.email, subject: subject, htmlBody: htmlBody, body: plainBody, name: SENDER_NAME });
}

function btn_(href, text, bg, color, border) {
  return '<a href="' + href + '" style="display:inline-block;background:' + bg + ';color:' + color +
    ';text-decoration:none;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:11px;border:1px solid ' + border + '">' +
    text + '</a>';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function escapeHtml_(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

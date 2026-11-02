# CHW Consent – iPhone app

Fills the SCN020.001 *Request/Consent for Medical Procedure Treatment* form from a patient label. The practitioner adds the procedure and signs. The app then emails the PDF to the parent (to print, sign and bring on the day) and to admissions.

It runs entirely on the phone. Once installed it works offline, and no patient details are sent anywhere except the emails you choose to send.

## Files

| File | What it is |
| --- | --- |
| index.html | The app |
| core.js | Form positions, label reader, PDF builder |
| pdf-lib.min.js | PDF library (pdf-lib 1.17.1, MIT licence) |
| zxing.min.js | Barcode reader (@zxing/library 0.21.3, Apache 2.0 licence) |
| consent_form.pdf | The blank SCN020.001 form |
| form-preview.jpg | Image of the form for the on-screen preview |
| manifest.webmanifest, sw.js, icon-*.png, apple-touch-icon.png | Home-screen install and offline support |

## 1. Put it on a web address

The iPhone needs to load the app once from an **https://** address. After that it runs offline. Any static web host works; upload the whole folder as it is.

- **For clinical use:** ask SCHN ICT / eHealth NSW to host the folder on an approved internal or Azure static site.
- **For a quick personal trial:** drag the folder onto https://app.netlify.com/drop (free) or publish it with GitHub Pages. The address is public, but it only serves the blank form and the app; patient details never leave the phone.

## 2. Install on the iPhone

1. Open the address in **Safari**.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Open **Consent** from the home screen. Your name and the admissions email are remembered on that phone.

## 3. Use it

1. **Barcode:** tap **Scan barcode** and hold the label's barcode in the box (allow camera access the first time), or tap **Barcode from photo**. The barcode usually holds only the MRN.
2. **Label:** for the name, date of birth, sex and AMO, tap the *Label text* box, tap it again and choose **Scan Text** (on iOS 17 and later it may be under **AutoFill**). Point at the label and tap **Insert**. The app fills family name, given name, MRN, date of birth, sex and the AMO (read from `AMO: LASTNAME, Firstname` and printed as "Dr Firstname Lastname" in the form's M.O. box; it also fills the practitioner name if that is empty). The address is not used. Check every field against the label.
   - No Scan Text? Check Settings → General → Language & Region → **Live Text** is on (needs iPhone XS/XR or newer, iOS 15+).
   - Or open the **Camera** app, point at the label, tap the Live Text button, **Select All → Copy**, then tap **Paste** in the app.
3. **Procedure:** enter the *Practitioner name sending RFA*, then the procedure once, in full and without abbreviations; it prints in both the practitioner and parent sections. Add the condition. The date of the operation is optional.
4. **Sign** with your finger. Open *Preview the form* to check it.
5. **Send:** tap **Send with Outlook (PDF attached)** and choose **Outlook** in the share sheet. The PDF is attached straight from the app and nothing is saved on the phone. Both addresses are copied: paste them into To (move admissions to Cc if you like), type the subject **Consent form**, check and send.
6. Tap **New patient** to clear everything before the next patient.

## Checking before clinical use

- Scan the barcode on a few real CHW labels and note what it holds (MRN alone, or more). If it holds more than the MRN, tell me and the app can fill those fields from it too.
- Scan 10 real CHW labels and check every field. The label reader was written without a real CHW label to test against, so if a field is often wrong, send me the label text with the details changed and I'll adjust it.
- Print one filled form and check the text lines up on paper.
- Confirm with SCHN Privacy that emailing the form to a family's personal address is covered by local policy.

## Version 2 (version2/)

A tablet/PC layout of the prefill app with a live form preview, at `version2/` (e.g. `https://<your-site>/version2/`). It uses the blank form, preview image and pdf-lib from the main folder.

- **Scan label:** tap the box twice and choose **Scan Text** (or paste Live Text from the Camera app). It fills family name, given name, MRN, date of birth, sex, M.O. and address, and the practitioner name if empty. **Scan barcode** and **Barcode from photo** read the MRN. Everything is read on the phone.
- The PDF can only leave the app as an email attachment (**Attach PDF to email** opens the share sheet). There is no save-to-device button.
- One **Copy both email addresses** button copies the admissions and parent addresses together for the To line.
- Admissions defaults to SCHN-CHW-PatientBookingOffice@health.nsw.gov.au.
- `version2/CHW_Consent_Prefill_version2.html` is a single-file copy with the form built in, for opening directly in Microsoft Edge on a Windows PC.
- On iPhone, the share sheet still lists "Save to Files"; iOS provides that option and a web page cannot remove it.

## Updating

After changing any file, change `VERSION` in `sw.js` (e.g. `chw-consent-v2`). Phones pick up the new version the next time the app is opened online.

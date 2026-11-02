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
2. **Label:** for the name, date of birth and address, tap the *Label text* box, tap it again and choose **Scan Text** (on iOS 17 and later it may be under **AutoFill**). Point at the label and tap **Insert**. The fields fill in; check every one against the label.
   - No Scan Text? Check Settings → General → Language & Region → **Live Text** is on (needs iPhone XS/XR or newer, iOS 15+).
   - Or open the **Camera** app, point at the label, tap the Live Text button, **Select All → Copy**, then tap **Paste** in the app.
3. **Procedure:** enter it in full, without abbreviations, plus the condition and the date of the operation.
4. **Sign** with your finger. Open *Preview the form* to check it.
5. **Send:** tap *Email parent with PDF*, choose Mail or Outlook, and paste the address (Copy button) if it isn't filled in. Repeat for admissions.
6. Tap **New patient** to clear everything before the next patient.

## Checking before clinical use

- Scan the barcode on a few real CHW labels and note what it holds (MRN alone, or more). If it holds more than the MRN, tell me and the app can fill those fields from it too.
- Scan 10 real CHW labels and check every field. The label reader was written without a real CHW label to test against, so if a field is often wrong, send me the label text with the details changed and I'll adjust it.
- Print one filled form and check the text lines up on paper.
- Confirm with SCHN Privacy that emailing the form to a family's personal address is covered by local policy.

## Updating

After changing any file, change `VERSION` in `sw.js` (e.g. `chw-consent-v2`). Phones pick up the new version the next time the app is opened online.

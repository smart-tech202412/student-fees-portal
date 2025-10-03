# student-fees-portal
## the academy of education 

Quick hook — “Generate fee slips instantly for students who haven’t paid — store records in an Excel file.”

This repository contains a simple front-end Student Fee Portal built with HTML, CSS, and JavaScript. It lets you:

Look up students,

Mark payments (paid / unpaid),

Generate a printable fee slip for any unpaid student, and

Save/export the fee records into an Excel (.xlsx) file (client-side export).

Important note about storage: this project uses client-side export/download of Excel files (via JavaScript). That means records are saved as a downloaded file on the user’s machine (or re-uploaded manually). If you need a central, persistent database for many users (server-side storage, multi-user sync), you’ll need a backend (Node/Python/PHP) and a server-side spreadsheet/database.

Features

Simple responsive UI (HTML/CSS) for listing students and fees.

JavaScript logic to detect unpaid students and create a printable fee slip.

Generate and download Excel (.xlsx) containing the current fee records using SheetJS (or CSV fallback).

Printable fee slip template (A4) ready for print or PDF export.

Optional: upload/parse an existing Excel/CSV file to load student records.

Tech stack

HTML5

CSS3 (Flexbox / Grid)

JavaScript (ES6+)

Optional JS libraries:

SheetJS (xlsx)
 — for reading/writing Excel files in the browser

FileSaver.js — to trigger file download if required

No backend required for the basic workflow (works as a static site), but server support is recommended for centrally storing records.

Recommended project structure
student-fee-portal/
├─ index.html
├─ about.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js          # main app logic: load data, mark payments, generate slips, export Excel
│  └─ xlsx.full.min.js  # (optional) SheetJS library if used
├─ data/
│  └─ students.xlsx   # optional sample input (NOT auto-updated by client-side code)
├─ assets/
│  └─ logo.png
├─ README.md
└─ LICENSE

How it works (user flow)

Load or add student records

Option A: Upload an existing Excel/CSV file (optional).

Option B: Add students manually using the UI form (Name, Roll/ID, Class, Fee amount, Paid status).

View the student list

The UI shows students with their fee status: Paid or Unpaid.

Generate fee slip

For any unpaid student, click Generate Slip.

JavaScript renders a printable slip (student details, due amount, date, signature area).

Click Print to save as PDF or print on paper.

Save/export records

Click Export to Excel to download a .xlsx file containing current records.

Alternatively, Export CSV for compatibility.

(Optional) Re-import

The exported file can be re-uploaded later to restore records

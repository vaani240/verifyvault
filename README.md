VerifyVault — Document Authenticity & Verification System
"Replace blind trust with cryptographic proof."

VerifyVault is a full-stack web application that enables institutions to issue tamper-proof digital documents and allows anyone to verify them instantly using QR codes or verification codes — without login.

🧠 Problem Statement
Document fraud is a real and growing issue:
Fake certificates used for jobs and admissions
No reliable way to verify PDFs shared via WhatsApp
Existing solutions (DigiLocker, NAD) are not accessible to private institutions
Issuers cannot revoke documents once issued


💡 Solution
VerifyVault solves this using:
🔐 SHA-256 hashing for tamper detection
📱 QR-based instant verification (no login required)
👥 Three-role system (Issuer, Recipient, Verifier)
❌ Revocation system for issued documents


⚙️ Tech Stack
Frontend
React (Vite)
React Router
Axios
Backend
Node.js
Express.js
JWT Authentication
Multer (file upload)
Crypto (SHA-256 hashing)
QRCode
Database & Storage
MongoDB Atlas (Database)
Cloudinary (File + QR storage)
Deployment
Vercel (Frontend)
Render (Backend)


🔁 How It Works
📤 Document Upload Flow
Issuer logs in
Uploads document
File stored on Cloudinary
SHA-256 hash generated
Unique verification code created
QR code generated
Data saved in MongoDB



🔍 Verification Flow
When a user verifies:
❌ Not Found → Fake document
🚫 Revoked → Issuer cancelled it
⚠️ Tampered → Hash mismatch detected
✅ Genuine → Hash matches original


📊 Features
✔️ Tamper-proof documents using SHA-256
✔️ QR-based verification (no login required)
✔️ Role-based dashboards
✔️ Document revocation system
✔️ Secure cloud storage
✔️ Fully deployed production system
🧪 Performance
⚡ Verification time: < 2 seconds
📤 Upload time: < 5 seconds (≤5MB files)
🧾 Supports: PDF & Images

Future Scope
📱 Mobile App with QR Scanner
⛓️ Blockchain integration (Ethereum/Polygon)
🏛️ DigiLocker & NAD integration
📊 Verification analytics dashboard
📦 Bulk document issuance
🔏 Digital signatures (X.509)



📌 Key Highlight
VerifyVault is not just a project — it is a live, deployed system solving a real-world problem using cryptographic verification.



⭐ Final Note
Anyone can generate a PDF.
VerifyVault proves whether it’s real.

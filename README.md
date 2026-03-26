# LBSITW Hostel Admission and Management System

A full-stack Hostel Management System built with:
- **Frontend**: React.js (Vite)
- **Backend**: Python Flask
- **Database**: MySQL

---

## 📁 Project Structure

```
hostel management system/
├── backend/
│   ├── app.py               # Flask entry point
│   ├── config.py            # Configuration
│   ├── requirements.txt
│   ├── .env                 # Environment variables (edit this)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   └── student_application.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── admin_routes.py
│   │   ├── student_routes.py
│   │   └── application_routes.py
│   ├── services/
│   │   ├── admission_service.py
│   │   └── whatsapp_service.py
│   └── utils/
│       ├── auth.py
│       └── db_init.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── FeeStructurePage.jsx
│   │       ├── AdmissionFormPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── AdminDashboard.jsx
│   │       └── StudentDashboard.jsx
│   └── index.html
└── schema.sql
```

---

## ⚙️ Setup Instructions

### 1. MySQL Database

Open MySQL Workbench or MySQL CLI and run:

```sql
CREATE DATABASE hostel_db;
```

The tables will be auto-created when you run the Flask app the first time.

To load sample data:
```sql
USE hostel_db;
-- Run the INSERT statements from schema.sql
```

---

### 2. Backend Setup (Python Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Edit `.env` with your MySQL credentials:

```env
SECRET_KEY=super-secret-hostel-key
DATABASE_URL=mysql+pymysql://YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@localhost/hostel_db
```

Run the Flask server:

```bash
python app.py
```

The backend will run at: `http://localhost:5000`

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at: `http://localhost:5173`

---

## 🔑 Default Admin Credentials

| Field    | Value       |
|----------|-------------|
| Username | `admin`     |
| Password | `password123` |

---

## 🌐 Pages / Routes

| URL                  | Description                        |
|----------------------|------------------------------------|
| `/`                  | Home / Landing page                |
| `/fee-structure`     | Fee Structure page                 |
| `/apply`             | Hostel Admission Form              |
| `/login`             | Admin + Student Login              |
| `/admin`             | Admin Dashboard (protected)        |
| `/student-dashboard` | Student Dashboard (protected)      |

---

## 🔗 API Endpoints

| Method | Endpoint                              | Description               |
|--------|---------------------------------------|---------------------------|
| POST   | `/api/auth/admin/login`               | Admin login               |
| POST   | `/api/auth/student/login`             | Student login             |
| POST   | `/api/application/`                   | Submit application        |
| GET    | `/api/admin/applications`             | Get all applications      |
| GET    | `/api/admin/applications/:id`         | Get one application       |
| POST   | `/api/admin/applications/:id/approve` | Approve application       |
| POST   | `/api/admin/applications/:id/reject`  | Reject application        |
| GET    | `/api/admin/priority-list`            | Get sorted priority list  |
| GET    | `/api/student/dashboard`              | Student dashboard data    |
| POST   | `/api/student/change-password`        | Change student password   |

---

## 📱 WhatsApp Integration

WhatsApp messages are currently **mocked** in `backend/services/whatsapp_service.py`.

To activate real WhatsApp sending using **Twilio**:

1. Install: `pip install twilio`
2. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
3. Replace mock code in `whatsapp_service.py`:
   ```python
   from twilio.rest import Client
   import os

   def send_whatsapp_message(phone_number, message):
       client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
       client.messages.create(
           body=message,
           from_=os.getenv('TWILIO_WHATSAPP_FROM'),
           to=f'whatsapp:+91{phone_number}'
       )
   ```

---

## 🏆 Admission Priority Logic

Applications are ranked in this order:
1. **SC/ST** students → highest priority
2. **Higher distance** from college → next priority
3. **Medical priority (Yes)** → next
4. **Higher merit score** → final tiebreaker

Use the **"Generate Priority List"** button in Admin Portal to compute and view ranks.

---

## 🔒 Security Notes

- Admin login uses `werkzeug` password hashing (bcrypt)
- Student login uses generated plaintext password stored in DB (change to hashed in production)
- JWT tokens expire in 24 hours
- File uploads are restricted to images/PDFs (max 16 MB)

---

*Built for LBSITW Hostel, Poojappura, Thiruvananthapuram.*

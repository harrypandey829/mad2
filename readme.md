# 🏠 Household Services Application (V2)

A **Full-Stack Household Services Platform** that connects customers with service professionals for various home-related tasks such as cleaning, plumbing, electrical work, etc.  
This project is built using **Flask**, **Vue.js**, **SQLite**, **Redis**, and **Celery** — with a focus on role-based functionality and smooth user experience.

---

## 🚀 Features

### 👨‍💼 Admin Panel
- Create, update, delete, and read services.
- Verify customer and professional documents.
- Block or unblock users.
- Manage service categories and subcategories.

### 👨‍🔧 Professional Dashboard
- Register and verify as a service professional.
- View assigned jobs and update job status.
- Manage profile and availability.

### 👩‍💻 Customer Dashboard
- Browse and book household services.
- Track service status and history.
- Leave reviews for completed services.

### ⚙️ System Features
- RESTful APIs built using **Flask-RESTful**.
- Asynchronous task handling using **Celery** and **Redis**.
- Secure authentication and role-based access control.
- Responsive Vue.js frontend with Bootstrap UI.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Vue.js, Bootstrap |
| **Backend** | Flask, Flask-RESTful |
| **Database** | SQLite |
| **Task Queue** | Celery + Redis |
| **Other** | REST API, Role Management, JSON Web Tokens (JWT) |

---

## 📁 Project Structure

Household-Services-App/
│
├── backend/
│ ├── app.py
│ ├── models.py
│ ├── routes/
│ ├── services/
│ ├── database/
│ ├── celery_worker.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── components/
│ ├── views/
│ ├── router/
│ ├── store/
│ └── package.json
│
├── README.md
└── LICENSE


---

## ⚡️ Installation and Setup

### 🧩 1. Clone the Repository
```bash
git clone https://github.com/your-username/household-services-app.git
cd household-services-app


🖥️ 2. Backend Setup

cd backend
python -m venv venv
source venv/bin/activate   # (use venv\Scripts\activate on Windows)
pip install -r requirements.txt
python app.py

🗄️ 3. Start Redis Server

Make sure Redis is installed and running.

For Windows (using WSL or installed Redis):
redis-server
Redis acts as the message broker and result backend for Celery tasks.


🚀 4. Start Celery Worker

celery -A app.celery worker --loglevel=info
Visit 👉 http://127.0.0.1:5000/


⏰ 5. Run Celery Beat (for scheduled tasks)

If your project has periodic or scheduled jobs (like auto-cleanups or email reminders), run Celery Beat in a separate terminal:


celery -A app.celery beat --loglevel=info



🧑‍💻 Author

Hari Om Pandey
👥 Team: Solo 
📧[LinkedIn Profile](https://www.linkedin.com/in/hariom-pandey-4700862a2/)

⭐ If you like this project, don’t forget to star the repo!

🪪 License

This project is licensed under the MIT License — see the LICENSE
 file for details.



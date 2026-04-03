# 💧 HydroGPT Ultra

**HydroGPT Ultra** is a state-of-the-art hydration tracking system powered by FastAPI and AI. It goes beyond simple water logging by calculating "Hydration Efficiency" (accounting for different beverage types) and providing intelligent insights via Gemeni AI.

---

## 🚀 Features

- **🧠 AI-Powered Insights**: Get personalized hydration advice based on your weight, activity, and intake patterns.
- **📈 Efficient Tracking**: Automatically adjusts hydration value based on beverage type (e.g., Water: 100%, Coffee: 80%, Juice: 90%).
- **🏆 Social Leaderboard**: Compete with friends to see who stays most hydrated relative to their personalized goals.
- **⚖️ Personalized Goals**: Automatic calculation of daily water needs based on weight (standard: 35ml/kg) or custom goals.
- **⚡ High Performance**: Built with **FastAPI**, featuring asynchronous endpoints and type safety.
- **📜 Swagger UI**: Interactive API documentation available at `/docs`.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI
- **Database**: SQLAlchemy (SQLite for dev, PostgreSQL-ready)
- **AI**: Google Generative AI (Gemini)
- **Auth**: JWT-based authentication with `python-jose` and `passlib`
- **Deployment**: Gunicorn / Uvicorn (Procfile included)

---

## 📋 Prerequisites

- Python 3.9+
- A Google AI (Gemini) API Key

---

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/hydrogpt-ultra.git
   cd hydrogpt-ultra
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   DATABASE_URL=sqlite:///./water_intake.db
   SECRET_KEY=your_secret_key_here
   GOOGLE_API_KEY=your_gemini_api_key
   ```

5. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`.

---

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📂 Project Structure

```text
fastapi-backend/
├── app/
│   ├── db/          # Database configuration
│   ├── models/      # SQLAlchemy models
│   ├── routes/      # API endpoints (user, water, ai, social)
│   ├── schemas/     # Pydantic models (Request/Response)
│   ├── services/    # Business logic (AI, Auth)
│   └── main.py      # Application entry point
├── static/          # Static assets/Frontend
├── .env             # Environment secrets
├── Procfile         # Deployment config
└── requirements.txt # Project dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

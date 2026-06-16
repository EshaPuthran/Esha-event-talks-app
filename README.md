# BigQuery Release Pulse 🚀

**BigQuery Release Pulse** is a premium, real-time web application that aggregates, categorizes, and displays the latest official Google Cloud BigQuery Release Notes. Built with **Python Flask** on the backend and modern vanilla **HTML5**, **CSS3**, and **JavaScript** on the frontend. It features instant filtering, dynamic categorization, and direct sharing integration with **X (Twitter)**.

---

## 🎨 Visual Preview & Aesthetics

The user interface is crafted with high-end modern design principles:
* **Dark Mode Native:** Deep Indigo/Charcoal color scheme that echoes cloud database environments.
* **Glassmorphism:** Elegant panels featuring backdrop blur filters, glowing borders, and smooth shadows.
* **Micro-Animations:** Fluid transition animations on card loading, hovering, search state changes, and sync actions.

---

## ⚡ Key Features

* **Real-Time Feed Aggregation:** Fetches and parses the official Google Cloud BigQuery release notes XML feed dynamically.
* **Smart Categorization:** Automatically analyses release text to flag and color-code updates under **Feature** (Purple), **Changed** (Yellow), **Deprecated** (Red), or **General Update** (Slate) badges.
* **Client-Side Quick Search:** Instant keyword matching across update titles, dates, and description contents.
* **Interactive X Composer:** A built-in modal that structures a ready-to-share Tweet, automatically handles X's 280-character constraints, truncates description snippets intelligently, and redirects to the official X composer.
* **Clipboard Copy Utility:** Fast copying of formatted plain-text update cards with modern Toast alerts.

---

## 📂 Project Structure

```
Esha-event-talks-app/
├── static/
│   ├── css/
│   │   └── styles.css      # Core Design Tokens, Typography, and Glassmorphic Styles
│   └── js/
│       └── app.js          # API Client, State, Searching, and Twitter Composer logic
├── templates/
│   └── index.html          # Semantic HTML Page & Modal Overlay structures
├── app.py                  # Python Flask server & XML feed parsing proxy
├── .gitignore              # Configured paths for Python, Venv, and OS metadata
└── README.md               # Project documentation (this file)
```

---

## 🛠️ Setup & Running Locally

### Prerequisites
* Python 3.10 or higher installed.

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone https://github.com/EshaPuthran/Esha-event-talks-app.git
   cd Esha-event-talks-app
   ```

2. **Create and activate a virtual environment:**
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install Flask requests feedparser
   ```

4. **Launch the Flask application:**
   ```bash
   python app.py
   ```

5. **Open your web browser and navigate to:**
   👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).

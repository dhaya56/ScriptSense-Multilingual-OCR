# ScriptSense – Multilingual AI-Powered OCR System

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)](https://www.sqlite.org/)

**ScriptSense** is a full-stack, end-to-end AI system designed to digitize printed and handwritten text from images. It intelligently routes input through specialized OCR pipelines (PP-OCRv3 for printed text, TrOCR for handwritten), performs multilingual translation, and generates accessible digital formats including audio (TTS) and formatted documents.

This project demonstrates a robust integration of computer vision, Natural Language Processing (NLP), and scalable web application architecture.

---

## Table of Contents
- [Key Capabilities](#-key-capabilities)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Usage](#-usage)
- [Notes on Excluded Files](#-notes-on-excluded-files)

---

## Key Capabilities

The system transforms raw image input into structured, usable data through a multi-stage pipeline:

* **Hybrid OCR Engine**: 
    * **Printed Text**: Processed using **PP-OCRv3** for high-speed, high-accuracy extraction.
    * **Handwritten Text**: Processed using **TrOCR** (Transformer-based Optical Character Recognition).
* **Multilingual Support**: Supports English and multiple Indic languages with seamless translation via **IndicTrans2**.
* **Advanced Preprocessing**: Automated noise removal, binarization, and skew correction to handle low-quality real-world images.
* **Intelligent Post-Processing**:
    * **Spello**: For spelling correction.
    * **LanguageTool**: For grammar refinement.
* **Document Generation**: Exports recognized text into downloadable **PDF** and **DOCX** formats with proper font rendering.
* **Text-to-Speech (TTS)**: Converts extracted text into audio for accessibility.
* **Full-Stack Web App**: Secure user authentication (JWT), file management, and a responsive React UI.

---

## System Architecture

The application follows a clean **Client-Server** architecture:

1.  **Frontend (React + Vite)**: Handles user interaction, image uploading, and real-time result visualization.
2.  **Backend (Flask)**: Exposes RESTful APIs to handle OCR inference, translation logic, and file generation.
3.  **Persistence (SQLite)**: Stores user credentials and history (configured for lightweight deployment).
4.  **External Toolkits**: Integrates `IndicTransToolkit` for specialized translation tasks.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS |
| **Backend** | Flask, Python, SQLAlchemy |
| **OCR Models** | PP-OCRv3 (Printed), TrOCR (Handwritten) |
| **NLP & Translation** | IndicTrans2, Spello, LanguageTool |
| **Database** | SQLite |
| **Authentication** | JWT (JSON Web Tokens) |

---

## Project Structure

```text
ai_ocr_project/
├── IndicTransToolkit/          # External toolkit (installed manually)
├── backend/
│   ├── app/
│   │   ├── static/             # Runtime results generated
│   │   ├── templates/          # Flask templates (kept for structure)
│   │   ├── auth.py
│   │   ├── models.py
│   │   ├── ocr_engine.py
│   │   ├── ocr_router.py
│   │   ├── routes.py
│   │   └── utils.py
│   ├── fonts/                  # NotoSans fonts for multilingual output
│   ├── database/               # SQLite DB (created at runtime)
│   ├── instance/               # Flask runtime config
│   ├── src/
│   │   └── IndicTransToolkit/  # Backend-accessible copy
│   ├── static                  # Runtime outputs (uploads, audio, results)
│   ├── en.pkl
│   ├── hi.pkl
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/              # Pages on the web
│   │   ├── components/         # React components
│   │   ├── utils/              # .js files necessary for authentication
│   │   ├── assets/             # Fonts, logo, background video
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind Configuration
│   └── vite.config.js          # Vite Configuration
├── .gitignore
└── README.md



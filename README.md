# EchoPerfect 🌙 - AI Phonetic Coach

![Version](https://img.shields.io/badge/version-1.0.0-blueviolet)
![Powered By](https://img.shields.io/badge/Powered%20by-Gemini%203%20Flash-orange)
![Produced By](https://img.shields.io/badge/Produced%20by-Tsukineko%20AI-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

**EchoPerfect** は、Googleの最新AIモデル **Gemini 3 Flash** を活用した、リアルタイム英語発音矯正アプリです。
「月ねこAI」がプロデュースする、クールで少し辛口なパーソナルコーチング体験を提供します。

## 📸 Screen Shot

<img width="1965" height="1191" alt="image" src="https://github.com/user-attachments/assets/f08cfa8e-943f-49a4-9e6f-8232ac20aeb2" />


## ✨ Key Features

*   **Real-time Analysis:** ユーザーの発音を即座に解析し、100点満点でスコアリング。
*   **Pinpoint Advice:** 「舌の位置」や「唇の動き」まで、物理的な改善点を具体的に指摘。
*   **Native Shadowing:** 任意のテキストを入力し、AI生成音声（Native）と聞き比べが可能。
*   **Moon Cat Coach:** 月ねこAIキャラクターによる、親しみやすくも的確なサポート。
*   **Phrase Library:** 定番フレーズや自分の履歴からワンタップで練習を開始できるライブラリ機能。

## 🛠️ Tech Stack

This project uses a hybrid architecture for speed and scalability.

*   **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
*   **Backend:** [Python 3.9+](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
*   **AI Model:** [Google Gemini 3 Flash (Preview)](https://deepmind.google/technologies/gemini/)
*   **Speech Synthesis:** gTTS (Google Text-to-Speech)
*   **Deployment:** [Vercel](https://vercel.com/) (Serverless Functions)

## ⚠️ デプロイとスケーラビリティに関する注記

本アプリケーションは、**Vercel Hobby Plan**（Serverless Functionsのタイムアウトが**10秒**）での動作に最適化されています。
*   **現在の制限:** タイムアウト内で処理を完了させるため、録音は短いフレーズ（最大5〜10秒）に制限されています。
*   **将来的な拡張性:** より長い音声処理や高い同時接続数が必要な本番環境では、タイムアウト制限を回避するために **Google Cloud Run** や AWS Lambda へのバックエンド移行を推奨します。

## 📂 Project Structure

```bash
echoperfect/
├── api/                  # Python Backend (FastAPI)
│   ├── index.py          # Main application entry point
│   └── ...
├── app/                  # Frontend Application (Next.js)
│   ├── components/       # UI Components (Recorder, Player, Modal)
│   ├── page.tsx          # Main Page Logic
│   └── ...
├── public/               # Static Assets (Images, Icons)
├── next.config.mjs       # Next.js Configuration
├── requirements.txt      # Python Dependencies
└── vercel.json           # Vercel Deployment Config
```

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: v18 or higher
*   **Python**: v3.9 or higher
*   **Google Gemini API Key**: [Get it here](https://aistudio.google.com/)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/your-username/echoperfect.git
    cd echoperfect
    ```

2.  **Setup Backend (Python)**
    It is recommended to use a virtual environment.
    ```bash
    # Create virtual environment
    python -m venv venv
    
    # Activate (Windows)
    .\venv\Scripts\activate
    # Activate (Mac/Linux)
    # source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Setup Frontend (Node.js)**
    ```bash
    npm install
    ```

4.  **Environment Variables**
    Create a `.env` file in the root directory and add your API key:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```

5.  **Run Development Server**
    This command starts both the Next.js frontend and FastAPI backend concurrently.
    ```bash
    npm run dev
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend API: `http://localhost:3000/api/*` (Rewrites handled by Next.js/Vercel)

## 🌙 About "Moon Cat AI" (Tsukineko AI)

Produced by **月ねこAI (Moon Cat AI)**.
We are exploring the possibilities of Generative AI and Web Marketing.

---

© 2025 EchoPerfect - Created for the future of language learning.

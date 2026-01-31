# Logo Maker - AI-Powered Logo Generator

A modern web application that uses Google's Gemini AI to generate professional SVG logos from text prompts or by vectorizing uploaded reference images.

## ✨ Features

- **Brand Revival Mode**: Upload existing logos/images and get vectorized versions with improved design
- **Forge Identity Mode**: Describe your vision in text and let AI create a unique logo from scratch
- **SVG Vector Output**: Download professional vector graphics (SVG format)
- **Dark/Light Mode**: Beautiful UI with theme switching
- **Responsive Design**: Works on desktop and mobile devices
- **Local Backend API**: Secure API key handling through your own server

## 🛠 Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime environment
- **Express** - Web server
- **@google/generative-ai** - Google Gemini API client

## 📁 Project Structure

```
Logo-maker/
├── backend/                 # Backend API server
│   ├── server.js           # Express server with Gemini integration
│   ├── check-models.js     # Utility to list available Gemini models
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (API key)
├── Frontend/               # React frontend application
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── index.tsx      # Entry point
│   │   ├── main.tsx       # React DOM renderer
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.css        # Global styles
│   │   └── vite-env.d.ts  # Vite type declarations
│   ├── components/
│   │   ├── Header.tsx     # Navigation header with theme toggle
│   │   └── LogoUploader.tsx  # Image upload component
│   ├── services/
│   │   └── geminiService.ts  # API service layer
│   ├── public/
│   │   └── vite.svg       # Vite logo
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
├── README.md               # This file
└── TODO.md                 # Development tasks
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   cd /path/to/Logo-maker
   ```

2. **Set up the Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:

   ```env
   API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

3. **Set up the Frontend**
   ```bash
   cd ../Frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm start
   ```

   The server will run on `http://localhost:3001`

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd Frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📖 How to Use

### Brand Revival Mode (Modernize)

1. Click **"Brand Revival"** mode
2. Upload one or more reference images of your existing logo
3. Add style guidance in the text area (e.g., "Keep the lion icon but make it geometric")
4. Click **"Revive Identity"**
5. Download your vectorized SVG logo

### Forge Identity Mode (Create New)

1. Click **"Forge Identity"** mode
2. Describe your vision in the Creative Brief (e.g., "A minimalist falcon representing speed")
3. Optionally upload rough sketches for inspiration
4. Click **"Generate Brand"**
5. Download your new SVG logo

## 🔧 Configuration

### Backend Environment Variables

| Variable  | Description                | Default  |
| --------- | -------------------------- | -------- |
| `API_KEY` | Your Google Gemini API key | Required |
| `PORT`    | Backend server port        | `3001`   |

### Model Configuration

The backend uses `gemini-1.5-flash` model by default. To change models:

1. Run `node backend/check-models.js` to see available models
2. Update the model name in `backend/server.js`:
   ```javascript
   const model = genAI.getGenerativeModel({
     model: "gemini-1.5-flash", // Change this
     requestOptions: { timeout: 60000 },
   });
   ```

## 🔐 API Documentation

### POST `/api/generate-logo`

Generate an SVG logo based on mode and input.

**Request Body:**

```json
{
  "mode": "create" | "modernize",
  "userPrompt": "Your design brief",
  "base64Images": ["data:image/png;base64,..."]
}
```

**Response:**

```json
{
  "image": "data:image/svg+xml;base64,PHN2Zy..."
}
```

**Error Response:**

```json
{
  "message": "Error description",
  "details": "Detailed error info"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad request (missing parameters)
- `429` - Rate limited (too many requests)
- `500` - Server error

## 🐛 Troubleshooting

### "API Key not found"

- Check that `backend/.env` contains the correct `API_KEY` value
- Restart the backend server after adding the key

### "AI generated text instead of visual code"

- The AI may have returned a description instead of SVG
- Check server logs for the full response
- Try rephrasing your prompt to be more specific about SVG output

### "Global Usage Limit Reached" (429)

- Gemini API has rate limits
- Wait 60 seconds before trying again

### CORS Errors

- Ensure the backend is running on port 3001
- The frontend is configured to connect to `http://localhost:3001`

## 📝 Development

### Adding New Features

1. **Frontend changes**: Edit files in `Frontend/src/`
2. **Backend changes**: Edit `backend/server.js`
3. **Styles**: Modify `Frontend/src/App.css` or use Tailwind classes

### Running Tests

```bash
# Frontend tests
cd Frontend
npm run test

# Backend tests
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons

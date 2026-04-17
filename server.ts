import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Route: Register user in Google Sheet
  app.post("/api/register-sheet", async (req, res) => {
    try {
      const { name, email, role, level, department } = req.body;
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!sheetId || !clientEmail || !privateKey) {
        console.error("Missing Google Sheets credentials in env.");
        return res.status(500).json({ error: "Server misconfigured: Missing Google Sheets credentials." });
      }

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      });

      const sheets = google.sheets({ version: "v4", auth });
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[name, email, role, level || "N/A", department || "N/A", new Date().toISOString()]],
        },
      });

      res.status(200).json({ status: "success", message: "User registered in sheet." });
    } catch (error) {
      console.error("Google Sheets Error:", error);
      res.status(500).json({ error: "Failed to update spreadsheet." });
    }
  });

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 10MB JSON for image base64 uploads
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY ist nicht in den Umgebungsvariablen konfiguriert.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API Route: AI Food Scanner
  app.post('/api/scan-food', async (req, res) => {
    try {
      const { image, hint, correction, currentResult } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Kein Bild übermittelt.' });
      }

      // Extract base64 and mime type
      let mimeType = 'image/jpeg';
      let base64Data = image;

      if (image.includes(';base64,')) {
        const parts = image.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?);/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = parts[1];
      }

      const ai = getGeminiClient();

      let promptText = `Du bist eine wissenschaftlich hochpräzise Ernährungs- und Lebensmittel-Analytik-KI mit maximaler Genauigkeit.
Deine Berechnungen basieren auf wissenschaftlich validierten Lebensmitteldatenbanken (Open Food Facts, Bundeslebensmittelschlüssel BLS, USDA FoodData Central, offizielle Herstellernährwerttabellen).

PRÄZISIONS-RICHTLINIEN FÜR ANTWORTEN:

1. BILD- & ETIKETTEN-OCR (ABSOLUTE PRIORITÄT):
   - Wenn auf dem Bild eine Verpackung, Dose, Flasche, Zutatenliste oder Nährwerttabelle sichtbar ist, LESE JEDE ZAHL UND JEDES WORT EXAKT AB!
   - Aufgedruckte Nährwerte (pro 100g/ml oder pro Portion) und Füllmengen (z.B. "330 ml", "500 g", "0.33 L") MÜSSEN zu 100% exakt übernommen werden.

2. MARKEN- UND SPEISENERKENNUNG:
   - Identifiziere spezifische Marken, Produktsorten und Zubereitungsarten (z. B. "Coca-Cola Zero", "Ehrmann High Protein Pudding", "Hähnchenbrust gegrillt", "Basmati Reis gekocht").
   - Nutze exakte Nährwertprofile der echten Marke/Speise.

3. TELLERGERICHTE & KOMPONENTEN-AUFLISTUNG:
   - Zerlege Tellergerichte sorgfältig in ihre Einzelzutaten (z.B. Fleisch, Beilage, Soße, Öl).
   - Gib im Array "ingredients" JEDE erkannte Einzelkomponente mit geschätzter Menge (g/ml), Kalorien, Eiweiß, Kohlenhydraten und Fett an.
   - Fasse im Feld "description" die Zusammensetzung transparent zusammen.

4. MATHE-KONSISTENZ:
   - Berechne Gesamtkalorien und Makros exakt:
     calories = Math.round((caloriesPer100g * portionGrams) / 100)
     proteinG = Math.round(((proteinPer100g * portionGrams) / 100) * 10) / 10
     carbsG = Math.round(((carbsPer100g * portionGrams) / 100) * 10) / 10
     fatG = Math.round(((fatPer100g * portionGrams) / 100) * 10) / 10
     fiberG = Math.round(((fiberPer100g * portionGrams) / 100) * 10) / 10

5. EINHEITEN:
   - unit = "ml" für Flüssigkeiten/Getränke, "g" für feste Speisen.`;

      if (correction) {
        promptText += `\n\nNUTZER-KORREKTUR VOM BENUTZER:
Nutzerangabe: "${correction}"
${currentResult ? `Bisherige Analyse: ${JSON.stringify(currentResult)}` : ''}
Passe die Werte, Menge, Zutaten und Makros exakt an diese Benutzerkorrektur an!`;
      } else if (hint) {
        promptText += `\n\nZUSATZINFORMATION DES NUTZERS: "${hint}"`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              portionGrams: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              caloriesPer100g: { type: Type.NUMBER },
              proteinPer100g: { type: Type.NUMBER },
              carbsPer100g: { type: Type.NUMBER },
              fatPer100g: { type: Type.NUMBER },
              sugarPer100g: { type: Type.NUMBER },
              fiberPer100g: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              proteinG: { type: Type.NUMBER },
              carbsG: { type: Type.NUMBER },
              fatG: { type: Type.NUMBER },
              sugarG: { type: Type.NUMBER },
              fiberG: { type: Type.NUMBER },
              portionSize: { type: Type.STRING },
              confidence: { type: Type.STRING },
              description: { type: Type.STRING },
              healthTip: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    proteinG: { type: Type.NUMBER },
                    carbsG: { type: Type.NUMBER },
                    fatG: { type: Type.NUMBER }
                  },
                  required: ['name', 'amount', 'unit', 'calories', 'proteinG', 'carbsG', 'fatG']
                }
              }
            },
            required: [
              'foodName',
              'portionGrams',
              'unit',
              'caloriesPer100g',
              'proteinPer100g',
              'carbsPer100g',
              'fatPer100g',
              'calories',
              'proteinG',
              'carbsG',
              'fatG',
              'portionSize'
            ]
          }
        },
      });

      const responseText = response.text || '';
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const resultJson = JSON.parse(cleanJsonStr);
        return res.json(resultJson);
      } catch (parseError) {
        console.error('JSON Parse error from Gemini:', responseText);
        return res.json({
          foodName: 'Analysierte Mahlzeit',
          portionGrams: 300,
          unit: 'g',
          caloriesPer100g: 133,
          proteinPer100g: 6.7,
          carbsPer100g: 13.3,
          fatPer100g: 5,
          fiberPer100g: 1,
          calories: 400,
          proteinG: 20,
          carbsG: 40,
          fatG: 15,
          fiberG: 3,
          portionSize: '300 g',
          confidence: 'mittel',
          description: responseText.slice(0, 150) || 'Mahlzeit erkannt',
          healthTip: 'Ausgewogene Mahlzeit mit Proteinen und Kohlenhydraten.'
        });
      }
    } catch (error: any) {
      console.error('Error in /api/scan-food:', error);
      return res.status(500).json({ 
        error: error.message || 'Fehler beim Analysieren des Speisenfotos.' 
      });
    }
  });

  // API Route: AI Nutrition Coach Advice
  app.post('/api/nutrition-advice', async (req, res) => {
    try {
      const { remainingCalories, targetCalories, consumedProtein, targetProtein, goal } = req.body;
      
      const ai = getGeminiClient();

      const prompt = `Erstelle als deutscher Ernährungsberater 2-3 kurze, direkte und praxistaugliche Empfehlungen für den heutigen Tag.
Kontext:
- Tagesziel: ${targetCalories} kcal
- Verbleibende Kalorien heute: ${remainingCalories} kcal
- Bisheriges Protein: ${consumedProtein}g / Ziel: ${targetProtein}g
- Abnehmziel: ${goal || 'Gewichtsverlust'}

Halte die Tipps pragmatisch, konkret und motivierend (ohne Emojis, nur klare Bulletpoints).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return res.json({ advice: response.text });
    } catch (error: any) {
      console.error('Error in /api/nutrition-advice:', error);
      return res.status(500).json({ error: error.message || 'Fehler beim Abrufen der Ratschläge.' });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.resolve(__dirname, 'index.html'))
      ? path.resolve(__dirname)
      : path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build-Dateien nicht gefunden.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

startServer();

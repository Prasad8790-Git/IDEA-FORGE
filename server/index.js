import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json({ limit: '1mb' }));

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, location: String, preferredLanguage: { type: String, default: 'en' }, createdAt: { type: Date, default: Date.now },
}));
const SoilDetails = mongoose.models.SoilDetails || mongoose.model('SoilDetails', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, soilType: String, pH: Number, nitrogen: Number, phosphorus: Number, potassium: Number,
  location: String, createdAt: { type: Date, default: Date.now },
}));
const ChatHistory = mongoose.models.ChatHistory || mongoose.model('ChatHistory', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, question: String, response: String, language: String, timestamp: { type: Date, default: Date.now },
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' }));

app.post('/api/users', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Profiles can be saved when MongoDB is connected.' });
  const { id, name = '', location = '', preferredLanguage = 'en' } = req.body || {};
  try {
    const user = id && mongoose.isValidObjectId(id)
      ? await User.findByIdAndUpdate(id, { name, location, preferredLanguage }, { new: true })
      : await User.create({ name, location, preferredLanguage });
    res.json({ id: user.id });
  } catch { res.status(400).json({ error: 'Could not save the profile.' }); }
});

app.get('/api/weather', async (req, res) => {
  if (!process.env.OPENWEATHER_API_KEY) return res.status(503).json({ error: 'Weather is unavailable. Add an OpenWeather API key to the server configuration.' });
  const location = String(req.query.location || '').trim();
  if (!location) return res.status(400).json({ error: 'Enter a town or city to check the weather.' });
  try {
    const currentUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    currentUrl.search = new URLSearchParams({ q: location, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' });
    const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
    forecastUrl.search = new URLSearchParams({ q: location, appid: process.env.OPENWEATHER_API_KEY, units: 'metric', cnt: '40' });
    const [currentResponse, forecastResponse] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
    if (!currentResponse.ok) return res.status(currentResponse.status === 404 ? 404 : 502).json({ error: currentResponse.status === 404 ? 'Location not found. Check the spelling and try again.' : 'Weather provider could not return current conditions.' });
    const current = await currentResponse.json();
    const forecast = forecastResponse.ok ? await forecastResponse.json() : null;
    const days = new Map();
    for (const item of forecast?.list || []) {
      const date = item.dt_txt.slice(0, 10);
      const day = days.get(date) || { date, temps: [], rainfall: 0, description: item.weather?.[0]?.description || '' };
      day.temps.push(item.main.temp);
      day.rainfall += item.rain?.['3h'] || 0;
      days.set(date, day);
    }
    res.json({ location: current.name, country: current.sys?.country, current: { temperature: current.main.temp, feelsLike: current.main.feels_like, humidity: current.main.humidity, description: current.weather?.[0]?.description, icon: current.weather?.[0]?.icon, windSpeed: current.wind?.speed }, forecast: [...days.values()].slice(0, 5).map(d => ({ date: d.date, low: Math.min(...d.temps), high: Math.max(...d.temps), rainfall: Number(d.rainfall.toFixed(1)), description: d.description })) });
  } catch { res.status(502).json({ error: 'Could not reach the weather service. Please try again later.' }); }
});

app.get('/api/mandi', async (req, res) => {
  const { crop = '', state = '', district = '' } = req.query;
  const apiKey = process.env.DATA_GOV_API_KEY;
  const resourceId = process.env.MANDI_RESOURCE_ID;
  if (!apiKey || !resourceId) return res.status(503).json({ error: 'Mandi prices are unavailable until a data.gov.in API key and resource ID are configured.' });
  try {
    const url = new URL(`https://api.data.gov.in/resource/${encodeURIComponent(resourceId)}`);
    url.search = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: '30', ...(crop ? { 'filters[commodity]': crop } : {}), ...(state ? { 'filters[state]': state } : {}), ...(district ? { 'filters[district]': district } : {}) });
    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: 'The mandi price provider could not return data.' });
    const data = await response.json();
    res.json({ records: (data.records || []).map(row => ({ crop: row.commodity, market: row.market, district: row.district, state: row.state, date: row.arrival_date, minPrice: row.min_price, maxPrice: row.max_price, modalPrice: row.modal_price, unit: '₹ / quintal' })) });
  } catch { res.status(502).json({ error: 'Could not reach the mandi price service. Please try again later.' }); }
});

app.post('/api/recommendations', (req, res) => {
  const { soilType, pH, nitrogen, phosphorus, potassium } = req.body || {};
  if (!soilType || pH === undefined || Number.isNaN(Number(pH))) return res.status(400).json({ error: 'Provide a soil type and valid pH value.' });
  const value = Number(pH);
  const acidity = value < 5.5 ? 'strongly acidic' : value < 6.5 ? 'slightly acidic' : value <= 7.5 ? 'near neutral' : 'alkaline';
  const cropSet = soilType.toLowerCase().includes('clay') ? ['Rice', 'Wheat', 'Sugarcane'] : soilType.toLowerCase().includes('sandy') ? ['Groundnut', 'Millet', 'Watermelon'] : soilType.toLowerCase().includes('loam') ? ['Maize', 'Pulses', 'Vegetables'] : ['Millet', 'Pulses', 'Groundnut'];
  const crops = cropSet.map((name, i) => ({ name, reason: `${name} can suit ${soilType.toLowerCase()} soil. Your pH is ${acidity}; check local season, water access, and a soil test before planting.`, confidence: 'General guidance' }));
  const tips = [value < 5.5 ? 'Ask a local soil lab or agriculture officer whether lime is suitable before applying it.' : value > 7.5 ? 'A soil test can help identify whether the alkaline pH limits nutrient availability.' : 'Maintain soil organic matter with locally suitable compost or crop residues.'];
  if ([nitrogen, phosphorus, potassium].some(v => v !== undefined && v !== '')) tips.push('Use the NPK values with a local soil-test recommendation before choosing fertilizer amounts.');
  res.json({ crops, tips, note: 'These are general starting points, not a substitute for local seasonal advice or a soil test.' });
});

app.post('/api/chat', async (req, res) => {
  const { question, language = 'en', location = '', context = {} } = req.body || {};
  if (!String(question || '').trim()) return res.status(400).json({ error: 'Type a question before sending.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'The AI assistant is unavailable until a Gemini API key is configured.' });
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are a careful agricultural advisor. Reply in the requested language, use simple practical language, and explain reasons. Use only provided weather, soil, and market facts; never invent forecasts or prices. If data is missing, say so clearly. For serious crop disease or uncertain chemical treatment, recommend a local agricultural expert. Advice is general and does not replace professional guidance.' }] }, contents: [{ role: 'user', parts: [{ text: `Reply in language code ${language}. Farmer location: ${location || 'not provided'}. Available context (may be empty): ${JSON.stringify(context)}. Question: ${question}` }] }] }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'The AI service could not answer right now. Please try again.' });
    const answer = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim();
    if (!answer) return res.status(502).json({ error: 'The AI service returned an empty answer. Please try again.' });
    if (mongoose.connection.readyState === 1) ChatHistory.create({ userId: mongoose.isValidObjectId(req.body.userId) ? req.body.userId : undefined, question, response: answer, language }).catch(() => {});
    res.json({ answer });
  } catch { res.status(502).json({ error: 'Could not reach the AI service. Please try again later.' }); }
});

app.post('/api/soil', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Soil profiles can be saved when MongoDB is connected.' });
  try {
    const soil = await SoilDetails.create(req.body);
    res.status(201).json({ soil });
  } catch { res.status(400).json({ error: 'Could not save soil details. Check the values and try again.' }); }
});

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(clientDist, 'index.html'), error => error && next()));

app.listen(port, () => console.log(`Agri assistant API listening on http://localhost:${port}`));
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(() => console.warn('MongoDB unavailable; app will run without persistence.'));

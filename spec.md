# SPEC.md

# 1. Project Overview

**Project Name:** Multilingual Agritech & Resource Advisory Assistant

**Project Description:**

The Multilingual Agritech & Resource Advisory Assistant is an AI-powered web application designed to help farmers make better farming decisions.

It provides useful agricultural advice using weather forecasts, mandi prices, and soil information.

Farmers can ask questions through text or voice and receive simple answers in their preferred regional language.

The main goal is to make agricultural information easily accessible to every farmer.

# 2. Problem Statement

Farmers often face difficulties with:
- Getting accurate weather information.
- Knowing current market prices for crops.
- Understanding soil conditions.
- Choosing suitable crops for their land.
- Identifying the right planting and harvesting times.
- Protecting crops from weather conditions and diseases.
- Accessing agricultural information in their regional language.

Our application solves these problems through a simple AI-powered assistant.

# 3. Target Users

- Small and medium-scale farmers.
- Rural farming communities.
- Agriculture students.
- Agricultural advisors.

# 4. Main Features

## 4.1 AI Farming Assistant
- Farmers can ask farming-related questions.
- AI provides simple and understandable answers.
- Suggests suitable crops based on soil and location.
- Provides planting and harvesting recommendations.
- Suggests basic crop protection methods.

## 4.2 Weather Information
- Display current weather conditions.
- Show upcoming weather forecasts.
- Provide temperature and rainfall information.
- Give weather-based farming suggestions.
- Alert farmers about heavy rainfall or extreme weather when reliable forecast data is available.

## 4.3 Mandi Price Information
- Display crop prices from available mandi data sources.
- Allow farmers to search for crops.
- Show market name, location, date, and price.
- Help farmers compare available market prices.

## 4.4 Soil Information
- Allow farmers to enter soil details manually.
- Collect soil type, pH value, and available NPK values.
- Suggest suitable crops based on soil information.
- Provide basic soil improvement recommendations.

## 4.5 Multilingual Support
- Support English, Telugu, Hindi, and other selected regional languages.
- Allow farmers to select their preferred language.
- Display AI responses in the selected language.
- Use simple words that farmers can easily understand.

## 4.6 Voice Assistant
- Allow farmers to ask questions using a microphone.
- Convert speech into text.
- Generate AI responses.
- Read answers aloud using text-to-speech.
- Provide text interaction as an alternative.

# 5. User Interface

Create a simple, clean, mobile-friendly interface.

### Main Dashboard
Display:
- Welcome message.
- Location selection.
- Current weather.
- Quick mandi price information.
- Soil information section.
- AI farming assistant.

### AI Assistant Page
- Chat interface.
- Text input field.
- Microphone button.
- Send button.
- Language selection.
- AI response area.

### Crop Recommendation Page
- Select soil type.
- Enter soil pH.
- Enter NPK values (optional).
- Enter location.
- Display recommended crops.
- Show reasons for each recommendation.

### Mandi Prices Page
- Crop search.
- State and district selection.
- Market information.
- Crop price details.

### Weather Page
- Current weather.
- 5-day forecast when supported by the API.
- Rainfall information.
- Farming recommendations.

# 6. Technology Stack

Use the following technologies:

**Frontend**
- React.js
- Vite
- Tailwind CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**AI Integration**
- Google Gemini API

**External APIs**
- Weather API for weather forecasts.
- Government mandi price API or Agmarknet/data.gov.in for market prices, where accessible.
- Soil data API if available; otherwise allow manual soil input.

**Voice Features**
- Browser Speech Recognition API where supported.
- Browser Speech Synthesis API for voice responses.

# 7. Basic Application Workflow

1. Farmer opens the application.
2. Farmer selects their preferred language.
3. Farmer enters their location.
4. Dashboard displays available weather information.
5. Farmer enters soil details if available.
6. Farmer checks crop prices in nearby markets.
7. Farmer asks a question using text or voice.
8. Backend collects relevant weather, soil, and market information.
9. Gemini AI analyzes the available information.
10. AI generates a simple response in the selected language.
11. Farmer receives the response through text or voice.

# 8. AI Assistant Instructions

The Gemini AI assistant should behave like a helpful agricultural advisor.

It should:
- Use simple language.
- Provide practical farming suggestions.
- Consider location, weather, soil, and crop information when available.
- Explain why a particular crop or farming method is recommended.
- Avoid making unsupported claims.
- Never invent weather forecasts or mandi prices.
- Clearly mention when information is unavailable.
- Recommend consulting local agricultural experts for serious crop diseases or uncertain chemical treatments.

# 9. Database Structure

Create the following basic MongoDB collections:

### Users
- Name
- Location
- Preferred language
- Created date

### SoilDetails
- User ID
- Soil type
- Soil pH
- Nitrogen
- Phosphorus
- Potassium

### ChatHistory
- User ID
- Question
- AI response
- Language
- Timestamp

# 10. Important Requirements

- Responsive design for mobile and desktop.
- Simple interface suitable for farmers.
- Easy-to-use buttons and navigation.
- Secure API key management using environment variables.
- Backend API integration.
- Proper error handling.
- Loading indicators.
- Handle unavailable API data gracefully.
- Support regional language text.
- Voice features should work where browser support is available.

# 11. Project Limitations

- Weather and mandi information depend on external API availability.
- Some regional languages may have limited voice recognition support.
- Soil recommendations depend on the accuracy of the entered soil information.
- AI recommendations are advisory and should not replace professional agricultural guidance.
- Do not display fake or randomly generated market prices or weather information.

# 12. Final Deliverables

Build a complete working web application with:

1. Responsive React frontend.
2. Node.js and Express backend.
3. MongoDB database integration.
4. Gemini AI integration.
5. Weather API integration.
6. Mandi price integration where accessible.
7. Soil-based crop recommendation feature.
8. Multilingual text assistant.
9. Voice input and output.
10. README.md with installation and setup instructions.
11. .env.example file.
12. Clear project folder structure.

# 13. Development Instructions for Codex

- First understand this entire specification.
- Create a clean and organized project structure.
- Build the frontend and backend separately.
- Implement features step by step.
- Connect APIs using backend routes.
- Never expose API keys in frontend code.
- Use reusable React components.
- Make sure the application runs without errors.
- If an external API requires credentials, document the required environment variables.
- Do not use mock data as real weather or mandi information.
- Test the main application workflow before completing the project.

**Final Goal:**

Build a simple, reliable, multilingual AI farming assistant that helps farmers understand weather, soil conditions, crop prices, and make better farming decisions through text and voice.
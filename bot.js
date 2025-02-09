require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const API_KEY = process.env.WEATHER_API_KEY;
const API_URL = process.env.WEATHER_API_URL;
const REQUEST_TIMEOUT = 5000; // 5 seconds timeout

bot.onText(/\/weather$/, (msg) => {
    bot.sendMessage(msg.chat.id, '🚨 GET WEATHER OF ANY CITY 🚨\n\n💬 How to use (Type):\n1️⃣ /weather cityname\n2️⃣ (Ex) /weather chicago');
});

bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1];
    const processingMsg = await bot.sendMessage(chatId, '🔄 Processing...');

    try {
        const response = await axios.get(`${API_URL}?key=${API_KEY}&q=${city}`, { timeout: REQUEST_TIMEOUT });
        const data = response.data;

        const weatherInfo = `🌤️ Weather in ${data.location.name}, ${data.location.region}, ${data.location.country}:\n\n🌡️ Temperature: ${data.current.temp_c}°C\n☁️ Condition: ${data.current.condition.text}\n💧 Humidity: ${data.current.humidity}%\n💨 Wind Speed: ${data.current.wind_kph} km/h`;

        bot.editMessageText(weatherInfo, { chat_id: chatId, message_id: processingMsg.message_id });
    } catch (error) {
        bot.editMessageText(`❌ We don't have weather for this ${city} city`, { chat_id: chatId, message_id: processingMsg.message_id });
    }
});
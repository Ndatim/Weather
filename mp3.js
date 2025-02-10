require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// MP3 command
bot.onText(/\/mp3$/, (msg) => {
    bot.sendMessage(msg.chat.id, '🎵 CONVERT VIDEO TO MP3 🎵\n\n💬 How to use (Type):\n1️⃣ /mp3 <YouTube URL>\n2️⃣ (Ex) /mp3 https://www.youtube.com/watch?v=example');
});

bot.onText(/\/mp3 (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const videoUrl = match[1];
    const processingMsg = await bot.sendMessage(chatId, '🔄 Processing...');

    try {
        // Validate YouTube URL
        if (!ytdl.validateURL(videoUrl)) {
            throw new Error('Invalid YouTube URL');
        }

        // Download video and convert to MP3
        const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
        const outputFilePath = `./${Date.now()}.mp3`;

        ffmpeg(videoStream)
            .audioBitrate(128)
            .save(outputFilePath)
            .on('end', () => {
                // Send MP3 file
                bot.sendAudio(chatId, outputFilePath)
                    .then(() => {
                        // Delete the file after sending
                        fs.unlinkSync(outputFilePath);
                        bot.deleteMessage(chatId, processingMsg.message_id);
                    })
                    .catch((err) => {
                        throw err;
                    });
            })
            .on('error', (err) => {
                throw err;
            });
    } catch (error) {
        bot.editMessageText(`❌ Error: ${error.message}`, { chat_id: chatId, message_id: processingMsg.message_id });
    }
});
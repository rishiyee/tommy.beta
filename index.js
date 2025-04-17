const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');  // Ensure you're using puppeteer-core if you're using a headless browser

const app = express();

let userStatus = {};

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// Add a function to launch puppeteer with no-sandbox flag
async function launchPuppeteer() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Necessary flags for running in a root environment
    });
    const page = await browser.newPage();
    await page.goto('http://example.com');  // Example URL, change to your needs
    await browser.close();
}

client.on('message', async (message) => {
    const userPhone = message.from;

    // Your logic to handle first-time users or check if user is interacting with the bot
    if (!userStatus[userPhone]) {
        userStatus[userPhone] = true;

        await client.sendMessage(userPhone, 'Hello! Here are the images of our cottages:');

        const roomFolders = [
            { name: 'Deluxe Lawn View', folder: 'deluxe_lawn_view', emoji: '👆' },
            { name: 'Premium Mountain View', folder: 'premium_mountain_view', emoji: '🏞️👆' },
            { name: 'Pool Villa', folder: 'pool_villa', emoji: '🏊‍♂️👆' },
            { name: 'Deluxe Pool & Forest View', folder: 'deluxe_pool_forest_view', emoji: '🌲👆' },
            { name: 'Honeymoon Suite', folder: 'honeymoon_suite', emoji: '💑👆' },
            { name: 'Premium Pool & Mountain View', folder: 'premium_pool_mountain_view', emoji: '⛰️👆' }
        ];

        for (const room of roomFolders) {
            const folderPath = path.join(__dirname, 'images', room.folder);

            const files = fs.readdirSync(folderPath).filter(file =>
                file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
            );

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const media = await MessageMedia.fromFilePath(filePath);
                await client.sendMessage(userPhone, media);
            }

            await client.sendMessage(userPhone, `*${room.name}* ${room.emoji}`);
        }

        await sendRoomRates(userPhone);

        await client.sendMessage(userPhone, 'Our team will now take over and manage further queries. Please stay tuned.');
    }
});

async function sendRoomRates(userPhone) {
    const rates = ` 
🌟 *Room Rates for Our Cottages* 🌟

1️⃣ *Premium Mountain View* – ₹8,500/night  
2️⃣ *Premium Pool & Mountain View* – ₹8,500/night  
3️⃣ *Deluxe Pool & Forest View* – ₹8,000/night  
4️⃣ *Deluxe Lawn View* – ₹8,000/night  
5️⃣ *Honeymoon Suite* – ₹13,000/night  
6️⃣ *Pool Villa* – ₹15,000/night

✅ All rooms include modern amenities for your comfort.  
📞 Contact us for booking assistance!
    `;
    await client.sendMessage(userPhone, rates);
}

// Initialize the WhatsApp client
client.initialize();

// Express server setup
app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
    
    // Optionally, you can call Puppeteer to perform an action when the server is up
    launchPuppeteer().catch(error => console.error('Puppeteer launch failed:', error));
});

const puppeteer = require('puppeteer-core'); // or 'puppeteer' if you want to use the full version
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Initialize WhatsApp client
let userStatus = {};
const client = new Client({
    authStrategy: new LocalAuth()
});

// Puppeteer launch function
async function launchPuppeteer() {
    try {
        // Make sure to pass correct flags for a cloud environment
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--no-zygote',
                '--disable-software-rasterizer',
            ],
            executablePath: '/usr/bin/chromium-browser' // This may need to be changed based on your environment
        });
        const page = await browser.newPage();
        await page.goto('http://example.com'); // Replace with your URL
        await browser.close();
    } catch (error) {
        console.error('Error launching Puppeteer:', error);
    }
}

// Launch Puppeteer (to ensure it's working)
launchPuppeteer().catch(err => console.log('Error running Puppeteer:', err));

// Event listener for QR code generation
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Event listener when the client is ready and authenticated
client.on('ready', () => {
    console.log('Client is ready!');
});

// Event listener for incoming messages
client.on('message', async (message) => {
    const userPhone = message.from;

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

client.initialize();

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

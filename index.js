const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // ✅ Fix for Railway or root environments
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ WhatsApp bot is ready!');

    const adminNumber = '911234567890@c.us'; // Replace with your admin number
    await client.sendMessage(adminNumber, '🤖 Bot is online and ready!');

    const chats = await client.getChats();
    for (const chat of chats) {
        if (chat.unreadCount > 0) {
            const messages = await chat.fetchMessages({ limit: chat.unreadCount });
            for (const msg of messages) {
                console.log(`📥 Unread from ${chat.name || chat.id.user}: "${msg.body}"`);
                await handleMessage(msg);
            }
        }
    }
});

client.on('message', async (message) => {
    await handleMessage(message);
});

async function handleMessage(message) {
    const userPhone = message.from;
    const userText = message.body.trim().toLowerCase();

    console.log(`📥 Message received from ${userPhone}: "${userText}"`);

    if (userText === 'test') {
        const reply = 'Live ✅';
        await client.sendMessage(userPhone, reply);
        console.log(`📤 Replied to ${userPhone}: "${reply}"`);
        return;
    }

    const greetings = ['hi', 'hello', 'hai', 'helo', 'hlo'];
    const isGreeting = greetings.some(greet => userText.includes(greet));

    if (isGreeting) {
        const greetingMsg = 'Hello! Here are the images of our cottages:';
        await client.sendMessage(userPhone, greetingMsg);
        console.log(`📤 Replied to ${userPhone}: "${greetingMsg}"`);

        await delay(10000); // ⏱️ 10-second delay after greeting

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
                console.log(`📤 Sent image: ${file} from ${room.folder}`);
            }

            const roomMsg = `*${room.name}* ${room.emoji}`;
            await client.sendMessage(userPhone, roomMsg);
            console.log(`📤 Replied to ${userPhone}: "${roomMsg}"`);
        }

        await sendRoomRates(userPhone);

        const handoverMsg = 'Our team will now take over and manage further queries. Please stay tuned.';
        await client.sendMessage(userPhone, handoverMsg);
        console.log(`📤 Replied to ${userPhone}: "${handoverMsg}"`);
    }
}

async function sendRoomRates(userPhone) {
    const rates = `
🌟 *Room Rates for Our Cottages* 🌟

1️⃣ *Premium Mountain View* – ₹8,500/night  
2️⃣ *Premium Pool & Mountain View* – ₹8,500/night  
3️⃣ *Deluxe Pool & Forest View* – ₹8,000/night  
4️⃣ *Deluxe Lawn View* – ₹8,000/night  
5️⃣ *Honeymoon Suite* – ₹15,000/night  
6️⃣ *Pool Villa* – ₹13,000/night

✅ All rooms include modern amenities for your comfort.  
📞 Contact us for booking assistance!
    `;
    await client.sendMessage(userPhone, rates);
    console.log(`📤 Sent room rates to ${userPhone}`);
}

client.initialize();

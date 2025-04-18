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

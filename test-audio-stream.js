require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Create a test token
const token = jwt.sign(
    {
        id: 1,
        email: 'zd2740451@gmail.com',
        voipms_client_id: '630997',
        company: 'zisha',
        role: 'client'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
);

async function testAudioStream() {
    console.log('Testing audio stream endpoint...\n');
    
    try {
        // First get the messages to get a valid message_num
        console.log('Step 1: Getting voicemail messages...');
        const messagesResponse = await axios.get('http://localhost:8000/api/voicemail/messages', {
            params: {
                mailbox: '101',
                folder: 'INBOX'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const messages = messagesResponse.data.data.messages;
        console.log(`Found ${messages.length} messages\n`);
        
        if (messages.length === 0) {
            console.log('No messages to test');
            return;
        }
        
        const firstMessage = messages[0];
        console.log(`Testing with message: ${firstMessage.message_num}`);
        console.log(`From: ${firstMessage.callerid}`);
        console.log(`Date: ${firstMessage.date}\n`);
        
        // Now get the audio file
        console.log('Step 2: Fetching audio file...');
        const audioResponse = await axios.get(
            `http://localhost:8000/api/voicemail/messages/${firstMessage.message_num}/file`,
            {
                params: {
                    mailbox: '101',
                    folder: 'INBOX'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'arraybuffer' // Important: get binary data
            }
        );
        
        console.log('\n✅ SUCCESS! Audio endpoint working correctly:');
        console.log(`Content-Type: ${audioResponse.headers['content-type']}`);
        console.log(`Content-Length: ${audioResponse.headers['content-length']} bytes`);
        console.log(`Data type: ${audioResponse.data.constructor.name}`);
        console.log(`First 20 bytes: ${Buffer.from(audioResponse.data).slice(0, 20).toString('hex')}`);
        
        if (audioResponse.headers['content-type'] === 'audio/mpeg') {
            console.log('\n✨ Perfect! Your frontend can now use the URL directly in <audio> tag');
            console.log(`Example: <audio src="/api/voicemail/messages/${firstMessage.message_num}/file?mailbox=101&folder=INBOX" controls />`);
        } else {
            console.log('\n⚠️  Warning: Content-Type is not audio/mpeg');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAudioStream();

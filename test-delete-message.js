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

async function testDeleteMessage() {
    console.log('Testing delete voicemail message...\n');
    
    try {
        // First get the messages to see current count
        console.log('Step 1: Getting current messages...');
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
            console.log('No messages to delete');
            return;
        }
        
        const firstMessage = messages[0];
        console.log(`Will delete message: ${firstMessage.message_num}`);
        console.log(`From: ${firstMessage.callerid}`);
        console.log(`Date: ${firstMessage.date}\n`);
        
        // Now delete the message
        console.log('Step 2: Deleting message...');
        const deleteResponse = await axios.delete(
            `http://localhost:8000/api/voicemail/messages/${firstMessage.message_num}`,
            {
                params: {
                    mailbox: '101',
                    folder: 'INBOX'
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('\n✅ Delete response:');
        console.log(JSON.stringify(deleteResponse.data, null, 2));
        
        // Check messages again
        console.log('\nStep 3: Checking messages after delete...');
        const afterResponse = await axios.get('http://localhost:8000/api/voicemail/messages', {
            params: {
                mailbox: '101',
                folder: 'INBOX'
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const afterMessages = afterResponse.data.data.messages;
        console.log(`Now have ${afterMessages.length} messages (was ${messages.length})\n`);
        
        if (afterMessages.length < messages.length) {
            console.log('✨ Message successfully deleted!');
        } else {
            console.log('⚠️  Message count unchanged - delete may not have worked');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testDeleteMessage();

require('dotenv').config();
const voipmsClient = require('./src/VoipmsClient');

async function testAudioFile() {
    try {
        console.log('Testing getVoicemailMessageFile API...\n');
        
        // First get messages to find a message number
        console.log('Step 1: Getting voicemail messages...');
        const messages = await voipmsClient.getVoicemailMessages({
            client: '630997',
            mailbox: '101',
            folder: 'INBOX'
        });
        
        console.log('Messages response:');
        console.log(JSON.stringify(messages, null, 2));
        
        if (messages.status === 'success' && messages.messages && messages.messages.length > 0) {
            const firstMessage = messages.messages[0];
            console.log(`\nFound ${messages.messages.length} messages`);
            console.log(`\nTesting with first message:`, firstMessage);
            
            // Now try to get the audio file
            console.log('\nStep 2: Getting audio file...');
            const audioFile = await voipmsClient.getVoicemailMessageFile({
                client: '630997',
                mailbox: '101',
                folder: 'INBOX',
                message_num: firstMessage.message_num || '0'
            });
            
            console.log('\nAudio file response:');
            console.log(JSON.stringify(audioFile, null, 2));
        } else {
            console.log('\nNo messages found');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAudioFile();

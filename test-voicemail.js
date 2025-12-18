require('dotenv').config();
const voipmsClient = require('./src/VoipmsClient');

async function testVoicemail() {
    try {
        console.log('Testing getVoicemails API...\n');
        
        // Test with your client ID
        const result = await voipmsClient.getVoicemails({
            client: '630997'
        });
        
        console.log('API Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.status === 'success' && result.voicemails) {
            console.log('\n=== VOICEMAIL BOXES ===');
            result.voicemails.forEach(vm => {
                console.log(`\nMailbox: ${vm.voicemail}`);
                console.log(`Name: ${vm.name || 'N/A'}`);
                console.log(`Email: ${vm.email || 'N/A'}`);
                console.log(`New Messages: ${vm.new || 0}`);
                console.log(`Old Messages: ${vm.old || 0}`);
                console.log(`Enabled: ${vm.enabled || 'N/A'}`);
            });
        } else {
            console.log('\nNo voicemails found or error occurred');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testVoicemail();

const nodemailer = require('nodemailer');
const colors = require('colors');

// Test SendGrid email configuration
async function testSendGridEmail() {
    try {
        console.log('🧪 Testing SendGrid Email Service...\n'.cyan.bold);

        // Get SendGrid API key from environment or command line
        const apiKey = process.env.EMAIL_SENDGRID_API_KEY || process.argv[2];
        const testEmail = process.argv[3] || 'atharvthakare011@gmail.com';

        if (!apiKey || !apiKey.startsWith('SG.')) {
            console.log('❌ Please provide your SendGrid API key:'.red);
            console.log('Usage: node test-sendgrid-email.js "SG.your-api-key-here" "test@email.com"'.green);
            console.log('\nTo get your API key:'.yellow);
            console.log('1. Go to https://sendgrid.com');
            console.log('2. Login → Settings → API Keys');
            console.log('3. Create API Key → Copy the key starting with "SG."');
            process.exit(1);
        }

        console.log('🔧 Configuring SendGrid transporter...'.blue);

        // Create SendGrid transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: apiKey
            }
        });

        console.log('📡 Verifying connection...'.blue);

        // Verify connection
        await transporter.verify();
        console.log('✅ SendGrid connection successful!'.green);

        console.log(`📧 Sending test email to: ${testEmail}`.blue);

        // Send test email
        const info = await transporter.sendMail({
            from: 'noreply@campusvote.com', // Can be any email with SendGrid
            to: testEmail,
            subject: '🎉 CampusVote Email Test - SendGrid Working!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px;">🎉 Success!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">SendGrid Email Service is Working</p>
                    </div>
                    
                    <div style="padding: 40px; background: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">✅ Your CampusVote Email is Ready!</h2>
                        
                        <div style="background: #e8f5e8; border: 2px solid #4caf50; border-radius: 10px; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0; color: #2e7d32; font-weight: bold; font-size: 16px;">
                                🚀 Your voting application can now send emails!
                            </p>
                        </div>
                        
                        <h3 style="color: #667eea; margin-top: 30px;">📋 What this means:</h3>
                        <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                            <li>✅ <strong>OTP verification emails</strong> will work</li>
                            <li>✅ <strong>Password reset emails</strong> will work</li>
                            <li>✅ <strong>Registration confirmations</strong> will work</li>
                            <li>✅ <strong>Election notifications</strong> will work</li>
                        </ul>
                        
                        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 30px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #856404;">📝 Configuration Details:</h4>
                            <p style="margin: 0; color: #856404; font-family: monospace; font-size: 14px;">
                                Service: SendGrid SMTP<br>
                                From: noreply@campusvote.com<br>
                                API Key: ${apiKey.substring(0, 10)}...****<br>
                                Test Time: ${new Date().toLocaleString()}
                            </p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                            <strong>Next Step:</strong> Deploy your CampusVote application!<br>
                            <em>This email confirms your email service is properly configured.</em>
                        </p>
                    </div>
                    
                    <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">🗳️ CampusVote - Digital Democracy Platform</p>
                        <p style="margin: 5px 0 0 0; opacity: 0.7;">Test email sent via SendGrid</p>
                    </div>
                </div>
            `
        });

        console.log('\n🎉 TEST EMAIL SENT SUCCESSFULLY!'.green.bold);
        console.log(`📧 Message ID: ${info.messageId}`.yellow);
        console.log(`📬 Check your inbox: ${testEmail}`.yellow);
        
        console.log('\n✅ SendGrid Configuration Summary:'.cyan.bold);
        console.log(`Service: SendGrid SMTP`.green);
        console.log(`API Key: ${apiKey.substring(0, 15)}...`.green);
        console.log(`From Email: noreply@campusvote.com`.green);
        console.log(`Test Email: ${testEmail}`.green);
        
        console.log('\n🚀 Your CampusVote application is ready to send emails!'.green.bold);
        console.log('You can now proceed with deployment.'.green);

        return true;

    } catch (error) {
        console.error('\n❌ SendGrid email test failed:'.red.bold);
        console.error(error.message.red);

        console.log('\n💡 Common Solutions:'.yellow.bold);
        if (error.message.includes('Invalid API Key')) {
            console.log('• Check your SendGrid API key is correct and starts with "SG."'.yellow);
            console.log('• Make sure you copied the full API key from SendGrid dashboard'.yellow);
        }
        if (error.message.includes('authentication')) {
            console.log('• Verify your SendGrid account is verified and active'.yellow);
            console.log('• Check if API key has "Mail Send" permissions'.yellow);
        }
        if (error.message.includes('Network')) {
            console.log('• Check your internet connection'.yellow);
            console.log('• Try again in a few moments'.yellow);
        }

        console.log('\n📋 SendGrid Setup Reminder:'.cyan);
        console.log('1. Go to: https://app.sendgrid.com/settings/api_keys');
        console.log('2. Create API Key with "Mail Send" permission');
        console.log('3. Copy the key starting with "SG."');
        console.log('4. Run: node test-sendgrid-email.js "SG.your-key" "your-email"');

        return false;
    }
}

// Command line help
if (process.argv.includes('--help')) {
    console.log('SendGrid Email Testing Script for CampusVote'.cyan.bold);
    console.log('\nUsage:');
    console.log('node test-sendgrid-email.js "SG.your-api-key" "test-email@domain.com"'.green);
    console.log('\nExample:');
    console.log('node test-sendgrid-email.js "SG.abc123..." "atharvthakare011@gmail.com"'.green);
    process.exit(0);
}

// Run the test
testSendGridEmail();
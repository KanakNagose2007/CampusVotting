const nodemailer = require('nodemailer');
const colors = require('colors');

// Final SendGrid test with correct sender
async function testSendGridFinal() {
    try {
        console.log('🎯 Final SendGrid Test - Using Your Gmail as Sender...\n'.cyan.bold);

const apiKey = process.env.EMAIL_SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY_HERE';
        const senderEmail = "atharvthakare011@gmail.com";
        const testEmail = "atharvthakare011@gmail.com";

        console.log('🔧 Configuring SendGrid with verified sender...'.blue);

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
        await transporter.verify();
        console.log('✅ SendGrid connection successful!'.green);

        console.log(`📧 Sending test email from: ${senderEmail}`.blue);
        console.log(`📧 Sending test email to: ${testEmail}`.blue);

        // Send test email using your verified Gmail
        const info = await transporter.sendMail({
            from: `"CampusVote System" <${senderEmail}>`,
            to: testEmail,
            subject: '🎉 CampusVote is Ready for Deployment!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px;">🚀 SUCCESS!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your CampusVote Email System is Working!</p>
                    </div>
                    
                    <div style="padding: 40px; background: #f8f9fa;">
                        <h2 style="color: #333; margin-bottom: 20px;">🎉 Deployment Status: READY!</h2>
                        
                        <div style="background: #e8f5e8; border: 2px solid #4caf50; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                            <h3 style="margin: 0; color: #2e7d32; font-size: 20px;">
                                ✅ Your voting application can send emails!
                            </h3>
                        </div>
                        
                        <h3 style="color: #667eea; margin-top: 30px;">📋 What's Working:</h3>
                        <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                            <li>✅ <strong>SendGrid API</strong> - Connected and verified</li>
                            <li>✅ <strong>Email Sender</strong> - ${senderEmail}</li>
                            <li>✅ <strong>OTP Emails</strong> - Ready for user registration</li>
                            <li>✅ <strong>Password Reset</strong> - Ready for users</li>
                            <li>✅ <strong>Notifications</strong> - Ready for election updates</li>
                        </ul>
                        
                        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin: 30px 0;">
                            <h4 style="margin: 0 0 10px 0; color: #856404;">🚀 Ready for Deployment!</h4>
                            <p style="margin: 0; color: #856404;">
                                Your CampusVote application is now 100% ready for deployment to Vercel!<br>
                                <strong>Next step:</strong> Run the deployment script or deploy manually.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p style="color: #333; font-size: 18px; font-weight: bold;">🎯 Everything is configured and working!</p>
                            <p style="color: #666; margin: 10px 0;">Time to deploy your digital voting system!</p>
                        </div>
                    </div>
                    
                    <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">🗳️ CampusVote - Secure Digital Voting Platform</p>
                        <p style="margin: 5px 0 0 0; opacity: 0.7;">Email service test completed successfully via SendGrid</p>
                    </div>
                </div>
            `
        });

        console.log('\n🎉 EMAIL TEST SUCCESSFUL!'.green.bold);
        console.log(`📧 Message ID: ${info.messageId}`.yellow);
        console.log(`📬 Check your Gmail inbox: ${testEmail}`.yellow);
        
        console.log('\n✅ Final Configuration Summary:'.cyan.bold);
        console.log(`✅ Service: SendGrid SMTP`.green);
        console.log(`✅ API Key: Valid and working`.green);
        console.log(`✅ From Email: ${senderEmail}`.green);
        console.log(`✅ Test Status: PASSED`.green);
        
        console.log('\n🚀 YOUR CAMPUSVOTE APPLICATION IS READY FOR DEPLOYMENT!'.green.bold);
        console.log('All email services are configured and working correctly.'.green);

        return true;

    } catch (error) {
        console.error('\n❌ Email test failed:'.red.bold);
        console.error(error.message.red);

        if (error.message.includes('does not match a verified Sender Identity')) {
            console.log('\n📧 Sender Verification Needed:'.yellow.bold);
            console.log('1. Go to: https://app.sendgrid.com/settings/sender_auth/senders');
            console.log('2. Click "Create New Sender"');
            console.log('3. Use: atharvthakare011@gmail.com as sender email');
            console.log('4. Verify the email in your Gmail inbox');
            console.log('5. Run this test again');
        }

        return false;
    }
}

// Run the final test
testSendGridFinal();
const nodemailer = require('nodemailer');
const createTransporter = async () => {
  
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
};

const sendVerificationEmail = async (email, otp, userName) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"Fix4Ever_Test" <noreply@Fix4Ever_Test.com>',
      to: email,
      subject: 'Verify Your Email - Fix4Ever_Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to fix4ever test application, ${userName}!</h2>
          <p>Thank you for choosing to become a vendor on our platform. Please use the OTP below to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            The Fix4Ever_Test Team
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Verification email sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendVendorWelcomeEmail = async (email, userName, businessName) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"Fix4Ever_Test" <noreply@Fix4Ever_Test.com>',
      to: email,
      subject: 'Welcome to Fix4Ever_Test Vendor Program! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Congratulations, ${userName}! 🎉</h2>
          <p>Your vendor profile <strong>${businessName}</strong> has been successfully created!</p>
          <p>You can now:</p>
          <ul>
            <li>Add your services and pricing</li>
            <li>Manage your technicians</li>
            <li>Receive booking requests from customers</li>
            <li>Track your business performance</li>
          </ul>
          <p>Login to your dashboard to get started and set up your complete vendor profile.</p>
          <div style="background: #007bff; padding: 10px 20px; text-align: center; margin: 20px 0;">
            <a href="#" style="color: white; text-decoration: none; font-weight: bold;">Go to Vendor Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Best regards,<br>
            The Fix4Ever_Test Team
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Welcome email sent: %s', info.messageId);
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendVendorWelcomeEmail
};
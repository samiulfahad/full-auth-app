const nodemailer = require("nodemailer");

const mailer = async (email, subject, msg) => {
  try{
    let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: 'samiul_fahad@bcscracker.com',
      pass: 'MwV82FpHmPNw'
    },
    });
    let info = await transporter.sendMail({
        from: '"NodeJS Auth by Samiul Fahad" <samiul_fahad@bcscracker.com>',
        to: email, 
        subject: subject,
        html: msg,
    });
    }
    catch (err) {
        console.log('Error in sending email');
        console.log(err);
    }
}

module.exports = mailer
const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

    var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "534d0cf68c5597",
          pass: "9efc17a19938db"
        }
    });

    // send mail with defined transport object //sendmail take in email, subject and message
    let mail_message = await transporter.sendMail({
        from: '"API_Development" <noreply@apidevelopment.io>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message // plain text body
    
    });
    // const info = (mail_message)
    

    console.log("Message sent: %s", mail_message.messageId);

}

module.exports = { sendEmail }
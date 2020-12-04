const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

    var transporter = nodemailer.createTransport({
        host: "MAIL_TRAP",
        port: MAIL_TRAP_PORT,
        auth: {
          user: "MAIL_TRAP_USERNAME",
          pass: "MAIL_TRAP_PASSWORD"
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

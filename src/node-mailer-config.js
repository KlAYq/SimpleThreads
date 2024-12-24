const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: "mcfacebook911@gmail.com",
    pass: "among us",
  }
})

async function sendConfirmMail(email, token){
  try {
    await transporter.sendMail({
      from : {
        name: "Patch Login Center",
        address: process.env.MAIL_USER
      },
      to : email,
      subject : "[Patch] Confirm account registration",
      text: "Confirm account registration by clicking the link below: ",
      html: "<a href='localhost:4000/confirmation_key/"+ token + "' target='_blank'>Click here</a>" +
        "<div>localhost:4000/confirmation_key/"+ token + "</div>"
    });
  } catch (error){
    console.error(error);
  }
}

module.exports = sendConfirmMail;


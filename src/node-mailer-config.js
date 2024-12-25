const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
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
      html: `<a href='localhost:4000/confirmation_key/${token}' target='_blank'>Click here</a> <br>` +
        `<button href='localhost:4000/confirmation_key/${token}'>Click here</button><br>` +
        `<div>localhost:4000/confirmation_key/${token}</div>`
    });
  } catch (error){
    console.error(error);
  }
}

async function sendResetMail(email, token){
  try {
    await transporter.sendMail({
      from : {
        name: "Patch Login Center",
        address: process.env.MAIL_USER
      },
      to : email,
      subject : "[Patch] Reset account password",
      text: "You can reset password via this link: ",
      html: `<a href='localhost:4000/account-settings/change-password/${token}' target='_blank'>Click here</a> <br>` +
        `<button href='localhost:4000/account-settings/change-password/${token}'>Click here</button><br>` +
        `<div>localhost:4000/account-settings/change-password/${token}</div>`
    });
  } catch (error){
    console.error(error);
  }
}




module.exports = {sendConfirmMail, sendResetMail};


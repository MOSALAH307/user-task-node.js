"use strict";
import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.SENDEMAILPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const info = await transporter
    .sendMail({
      from: `"Trello team" <${process.env.EMAIL}>`, // sender address
      to,
      subject,
      text,
      html,
    })
    .catch((error) => {
      console.log("send email error");
      console.log(error);
    });
  return info
};

export default sendEmail;

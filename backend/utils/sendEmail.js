const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: {
      email: process.env.MAIL_USER,   // still your Gmail internally
      name: "Expense Tool"           // THIS is what users will see
    },
    replyTo: process.env.MAIL_USER,  // replies go to your Gmail
    subject,
    html,
  };

  await sgMail.send(msg);
};
  
const nodemailer = require("nodemailer");

const EmailSettings = require(
  "../modules/settings/email/emailSettings.model"
);

const {
  decrypt: decryptValue,
} = require("./crypto.helper");

// =========================================
// Create Transporter
// =========================================

const createTransporter = async () => {
  const settings = await EmailSettings.findOne({
    isActive: true,
  });

  // Database Settings
  if (
    settings &&
    settings.enableEmailNotifications
  ) {
    return {
      transporter:
        nodemailer.createTransport({
          host: settings.smtpHost,

          port: settings.smtpPort,

          secure:
            settings.smtpSecure,

          auth: {
            user: settings.smtpEmail,

            pass: decryptValue(
              settings.smtpPassword
            ),
          },
        }),

      senderName:
        settings.senderName,

      senderEmail:
        settings.senderEmail,
    };
  }

  // .env Fallback
  return {
    transporter:
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,

        port: Number(
          process.env.SMTP_PORT
        ),

        secure:
          process.env.SMTP_SECURE ===
          "true",

        auth: {
          user: process.env.SMTP_EMAIL,

          pass: process.env.SMTP_PASSWORD,
        },
      }),

    senderName:
      process.env.SMTP_SENDER_NAME ||
      "HRMS",

    senderEmail:
      process.env.SMTP_EMAIL,
  };
};

// =========================================
// Send Email
// =========================================

const sendEmail = async (
  to,
  subject,
  html
) => {
  const {
    transporter,
    senderName,
    senderEmail,
  } = await createTransporter();

  await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
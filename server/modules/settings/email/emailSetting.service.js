const nodemailer = require("nodemailer");

const EmailSettings = require("./emailSettings.model");

const {
  EMAIL_SETTINGS_MESSAGES,
  EMAIL_PROVIDERS,
} = require("./emailSettings.constants");

const {
  encrypt: encryptValue,
  decrypt: decryptValue,
} = require("../../../utils/crypto.helper");

//get email settings
const getEmailSettings = async () => {
  const settings = await EmailSettings.findOne({
    isActive: true,
  }).select("-smtpPassword");

  if (!settings) {
    return null;
  }

  return settings;
};

//create update settings
const createOrUpdateEmailSettings = async (
  data,
  userId
) => {
  let settings = await EmailSettings.findOne({
    isActive: true,
  });

  if (!settings) {
    settings = new EmailSettings();
  }

  settings.provider = data.provider;

  settings.smtpHost = data.smtpHost;

  settings.smtpPort = data.smtpPort;

  settings.smtpEmail = data.smtpEmail;

  settings.senderName = data.senderName;

  settings.senderEmail = data.senderEmail;

  settings.smtpSecure =
    data.smtpSecure ?? false;

  settings.enableEmailNotifications =
    data.enableEmailNotifications ?? true;

  // Preserve old password if empty
  if (
    data.smtpPassword &&
    data.smtpPassword.trim() !== ""
  ) {
    settings.smtpPassword =
      encryptValue(data.smtpPassword);
  }

  settings.updatedBy = userId;

  await settings.save();

  return settings;
};

//send test email
const sendTestEmail = async (
  email
) => {
  const settings =
    await EmailSettings.findOne({
      isActive: true,
    });

  if (!settings) {
    throw new Error(
      EMAIL_SETTINGS_MESSAGES.SETTINGS_NOT_FOUND
    );
  }

  if (
    !settings.enableEmailNotifications
  ) {
    throw new Error(
      EMAIL_SETTINGS_MESSAGES.EMAIL_NOT_ENABLED
    );
  }

  if (
    settings.provider !==
    EMAIL_PROVIDERS.SMTP
  ) {
    throw new Error(
      EMAIL_SETTINGS_MESSAGES.INVALID_PROVIDER
    );
  }

  const transporter =
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
    });

  await transporter.sendMail({
    from: `"${settings.senderName}" <${settings.senderEmail}>`,

    to: email,

    subject: "HRMS Test Email",

    html: `
      <h2>Email Configuration Successful</h2>

      <p>
      Congratulations 🎉
      </p>

      <p>
      Your SMTP settings are working correctly.
      </p>
    `,
  });

  return {
    message:
      EMAIL_SETTINGS_MESSAGES.TEST_EMAIL_SENT,
  };
};

module.exports = {
  getEmailSettings,
  createOrUpdateEmailSettings,
  sendTestEmail,
};
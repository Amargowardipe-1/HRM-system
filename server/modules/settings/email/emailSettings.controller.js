const emailSettingsService = require(
  "./emailSetting.service"
);

// Get Email Settings

const getEmailSettings = async (
  req,
  res,
  next
) => {
  try {
    const settings =
      await emailSettingsService.getEmailSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// Create / Update Email Settings

const createOrUpdateEmailSettings =
  async (req, res, next) => {
    try {
      const settings =
        await emailSettingsService.createOrUpdateEmailSettings(
          req.body,
          req.user.id
        );

      res.status(200).json({
        success: true,
        message:
          "Email settings saved successfully.",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

// Send Test Email

const sendTestEmail = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await emailSettingsService.sendTestEmail(
        req.body.email
      );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmailSettings,
  createOrUpdateEmailSettings,
  sendTestEmail,
};
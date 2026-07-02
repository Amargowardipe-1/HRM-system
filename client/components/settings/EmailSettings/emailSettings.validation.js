export const emailSettingsRules = {
  provider: [
    { required: true, message: "Provider is required." }
  ],
  smtpHost: [
    { required: true, message: "SMTP Host is required." }
  ],
  smtpPort: [
    { required: true, message: "SMTP Port is required." },
    {
      validator: (_, value) => {
        if (value === undefined || value === null || value === "") {
          return Promise.resolve();
        }
        if (isNaN(Number(value))) {
          return Promise.reject(new Error("SMTP Port must be numeric."));
        }
        return Promise.resolve();
      }
    }
  ],
  smtpEmail: [
    { required: true, message: "SMTP Email is required." },
    { type: "email", message: "Please enter a valid SMTP Email." }
  ],
  senderName: [
    { required: true, message: "Sender Name is required." }
  ],
  senderEmail: [
    { required: true, message: "Sender Email is required." },
    { type: "email", message: "Please enter a valid Sender Email." }
  ],
  smtpPassword: []
};

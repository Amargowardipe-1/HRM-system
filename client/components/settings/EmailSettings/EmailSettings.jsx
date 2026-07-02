"use client";

import { useState, useEffect } from "react";
import { Skeleton, notification } from "antd";
import { getEmailSettings, updateEmailSettings, sendTestEmail } from "./emailSettings.api";
import { EmailSettingsForm } from "./EmailSettingsForm";
import { TestEmailModal } from "./TestEmailModal";

export default function EmailSettings({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getEmailSettings(token);
      setSettings(data);
    } catch (err) {
      api.error({
        message: "Failed to Load Settings",
        description: err.response?.data?.message || err.message || "An error occurred while fetching email configurations.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const updated = await updateEmailSettings(formData, token);
      setSettings(updated);
      api.success({
        message: "Settings Saved",
        description: "Email configuration parameters have been successfully updated.",
        placement: "topRight",
      });
    } catch (err) {
      api.error({
        message: "Failed to Save Settings",
        description: err.response?.data?.message || err.message || "Could not update email configurations.",
        placement: "topRight",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (recipientEmail) => {
    try {
      const result = await sendTestEmail(recipientEmail, token);
      api.success({
        message: "Test Email Sent",
        description: result.message || `A verification email has been successfully sent to ${recipientEmail}.`,
        placement: "topRight",
      });
    } catch (err) {
      api.error({
        message: "Failed to Send Test Email",
        description: err.response?.data?.message || err.message || "Could not transmit test email. Check server configuration.",
        placement: "topRight",
      });
      throw err; // Throw to prevent modal auto-closure on failure
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <Skeleton active paragraph={{ rows: 4 }} />
        <hr className="border-slate-100" />
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="grid gap-6">
        <EmailSettingsForm
          initialValues={settings}
          isSaving={saving}
          onSave={handleSave}
          onOpenTestModal={() => setIsTestModalOpen(true)}
        />

        <TestEmailModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          onSend={handleSendTestEmail}
        />
      </div>
    </>
  );
}

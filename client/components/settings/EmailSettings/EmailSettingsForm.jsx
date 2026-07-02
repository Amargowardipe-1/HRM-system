"use client";

import { Form, Input, Select, Switch, Button, Row, Col, Card } from "antd";
import { useEffect } from "react";
import { Server, User, Key, Settings, Send, ShieldAlert } from "lucide-react";
import { emailSettingsRules } from "./emailSettings.validation";

export function EmailSettingsForm({
  initialValues,
  isSaving,
  onSave,
  onOpenTestModal,
}) {
  const [form] = Form.useForm();

  // Reset form when initial values load
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        smtpPassword: "", // Never prefill password from backend
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    // If password is left empty, remove it from the submission payload
    const submissionData = { ...values };
    if (!submissionData.smtpPassword) {
      delete submissionData.smtpPassword;
    }
    await onSave(submissionData);
    // Clear password field after successful update
    form.setFieldsValue({ smtpPassword: "" });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={isSaving}
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
      requiredMark="optional"
    >
      <Card
        title={
          <div className="flex items-center gap-2.5 py-1">
            <div className="grid w-9 h-9 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-text">Mail Delivery Server</h3>
              <p className="text-[11px] text-brand-muted font-normal mt-0.5">
                Configure outgoing SMTP mailing parameters for HRMS transaction notifications.
              </p>
            </div>
          </div>
        }
        className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        actions={[
          <div key="actions" className="px-6 py-4 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 rounded-b-3xl border-t border-slate-100">
            <Button
              type="default"
              icon={<Send size={14} className="mr-1.5 inline" />}
              onClick={onOpenTestModal}
              disabled={isSaving}
              className="min-h-[42px] px-5 rounded-xl font-bold border-slate-200 hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer flex items-center justify-center"
            >
              Send Test Email
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              className="min-h-[42px] px-6 rounded-xl font-bold shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center"
            >
              Save Settings
            </Button>
          </div>
        ]}
      >
        <div className="grid gap-6 p-2">
          {/* Provider Selection */}
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="provider"
                label={<span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mail Provider</span>}
                rules={emailSettingsRules.provider}
              >
                <Select placeholder="Select Provider" className="min-h-[40px] rounded-lg">
                  <Select.Option value="SMTP">SMTP Server</Select.Option>
                  <Select.Option value="SES" disabled>Amazon SES (Coming Soon)</Select.Option>
                  <Select.Option value="SendGrid" disabled>SendGrid (Coming Soon)</Select.Option>
                  <Select.Option value="Resend" disabled>Resend (Coming Soon)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <hr className="border-slate-100" />

          {/* SMTP Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
              <Server size={16} className="text-slate-400" /> SMTP Host Settings
            </h4>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={16}>
                <Form.Item
                  name="smtpHost"
                  label={<span className="text-xs font-bold text-slate-500">SMTP Host / Server Address</span>}
                  rules={emailSettingsRules.smtpHost}
                >
                  <Input placeholder="e.g. smtp.gmail.com" className="min-h-[40px] rounded-lg" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="smtpPort"
                  label={<span className="text-xs font-bold text-slate-500">SMTP Port</span>}
                  rules={emailSettingsRules.smtpPort}
                >
                  <Input placeholder="e.g. 587" className="min-h-[40px] rounded-lg" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="smtpEmail"
                  label={<span className="text-xs font-bold text-slate-500">SMTP Username / Email</span>}
                  rules={emailSettingsRules.smtpEmail}
                >
                  <Input placeholder="e.g. info@company.com" className="min-h-[40px] rounded-lg" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="smtpPassword"
                  label={<span className="text-xs font-bold text-slate-500">SMTP Password</span>}
                  rules={emailSettingsRules.smtpPassword}
                >
                  <Input.Password
                    placeholder="Leave empty to keep existing password"
                    className="min-h-[40px] rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <hr className="border-slate-100" />

          {/* Sender Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Default Envelope Details
            </h4>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="senderName"
                  label={<span className="text-xs font-bold text-slate-500">Display Name / Sender Name</span>}
                  rules={emailSettingsRules.senderName}
                >
                  <Input placeholder="e.g. HR Department" className="min-h-[40px] rounded-lg" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="senderEmail"
                  label={<span className="text-xs font-bold text-slate-500">Sender Email Address</span>}
                  rules={emailSettingsRules.senderEmail}
                >
                  <Input placeholder="e.g. noreply@company.com" className="min-h-[40px] rounded-lg" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <hr className="border-slate-100" />

          {/* Switches */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
              <ShieldAlert size={16} className="text-slate-400" /> Connection & Policy Configuration
            </h4>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={12}>
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30">
                  <div className="grid gap-0.5">
                    <span className="text-sm font-extrabold text-slate-800">Secure Protocol (SSL/TLS)</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Encrypt connections using SSL/TLS protocols (typically port 465).
                    </span>
                  </div>
                  <Form.Item name="smtpSecure" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30">
                  <div className="grid gap-0.5">
                    <span className="text-sm font-extrabold text-slate-800">Enable Email Notifications</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Deliver welcome, leave, and payroll updates to employee mailboxes.
                    </span>
                  </div>
                  <Form.Item name="enableEmailNotifications" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Card>
    </Form>
  );
}

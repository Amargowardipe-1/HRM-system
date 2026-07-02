"use client";

import { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { Mail } from "lucide-react";

export function TestEmailModal({ isOpen, onClose, onSend }) {
  const [form] = Form.useForm();
  const [isSending, setIsSending] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSending(true);
      await onSend(values.email);
      form.resetFields();
      onClose();
    } catch (err) {
      // Form validation failed or API failed
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-slate-800">
          <Mail className="text-brand-primary" size={18} />
          Send Test Email
        </div>
      }
      open={isOpen}
      onOk={handleOk}
      confirmLoading={isSending}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isSending}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSending}
          onClick={handleOk}
          style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
        >
          Send
        </Button>,
      ]}
    >
      <div className="py-2">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Enter a recipient email address to send a sample message and verify that the configured SMTP settings are fully functional.
        </p>
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            name="email"
            label={<span className="text-xs font-bold text-slate-600">Email Address</span>}
            rules={[
              { required: true, message: "Recipient email is required." },
              { type: "email", message: "Please enter a valid email address." },
            ]}
          >
            <Input
              prefix={<Mail size={14} className="text-slate-400 mr-1" />}
              placeholder="e.g. receiver@example.com"
              disabled={isSending}
              className="min-h-[40px] rounded-lg"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

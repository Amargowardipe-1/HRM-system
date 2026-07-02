import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function getEmailSettings(token = null) {
  const response = await axios.get(`${API_BASE_URL}/api/settings/email`, {
    headers: getHeaders(token),
  });
  return response.data.data;
}

export async function updateEmailSettings(data, token = null) {
  const response = await axios.put(`${API_BASE_URL}/api/settings/email`, data, {
    headers: getHeaders(token),
  });
  return response.data.data;
}

export async function sendTestEmail(email, token = null) {
  const response = await axios.post(
    `${API_BASE_URL}/api/settings/email/test`,
    { email },
    { headers: getHeaders(token) }
  );
  return response.data;
}

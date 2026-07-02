const welcomeTemplate = (name, email, password, role, loginUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Welcome to HRMS</title>
</head>
<body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<table width="600" style="background:#ffffff; margin:40px auto; padding:40px; border-radius:12px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
<tr>
<td>
<h2 style="margin-bottom:10px; color:#0f172a; font-size:24px; font-weight:800;">Welcome to the Team! 🎉</h2>
<p style="color:#475569; font-size:15px; line-height:24px;">
Hello <strong>${name}</strong>,
</p>
<p style="color:#475569; font-size:15px; line-height:24px;">
Your employee profile has been successfully created. We are absolutely thrilled to welcome you to our family as an <strong>${role}</strong>!
</p>
<p style="color:#475569; font-size:15px; line-height:24px; margin-bottom: 25px;">
You can access the HRM dashboard using the following credentials:
</p>

<table width="100%" style="background:#f8fafc; border-radius:8px; border: 1px solid #f1f5f9; margin-bottom: 30px; padding: 20px;">
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold; width: 120px;">Portal URL:</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:semibold;"><a href="${loginUrl}" style="color:#10b981; text-decoration:none; font-weight:bold;">${loginUrl}</a></td>
</tr>
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold;">Username (Email):</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:bold; font-family: monospace;">${email}</td>
</tr>
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold;">Password:</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:bold; font-family: monospace; letter-spacing: 0.5px;">${password}</td>
</tr>
</table>

<p style="text-align:center; margin:35px 0;">
<a href="${loginUrl}" style="background:#10b981; color:#fff; padding:14px 32px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:bold; font-size:14px; box-shadow: 0 4px 10px rgba(16,185,129,0.2);">
Login to Dashboard
</a>
</p>

<p style="color:#64748b; font-size:12px; line-height:18px; margin-top:35px;">
Security Notice: For safety, please change your password as soon as you log in by visiting your Profile settings page.
</p>

<hr style="border:0; border-top:1px solid #f1f5f9; margin: 30px 0;">

<p style="font-size:12px; color:#94a3b8; font-weight:semibold;">
Best Regards,<br>
HRMS Administration
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;
};

module.exports = welcomeTemplate;

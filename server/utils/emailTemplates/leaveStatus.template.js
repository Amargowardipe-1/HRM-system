const leaveStatusTemplate = (name, leaveType, startDate, endDate, status, approverName) => {
  const isApproved = status === "Approved";
  const statusColor = isApproved ? "#10b981" : "#ef4444";
  const statusIcon = isApproved ? "✅" : "❌";
  const startDateStr = new Date(startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const endDateStr = new Date(endDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Leave Request ${status}</title>
</head>
<body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<table width="600" style="background:#ffffff; margin:40px auto; padding:40px; border-radius:12px; border: 1px solid #eef2f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
<tr>
<td>
<h2 style="margin-bottom:10px; color:#0f172a; font-size:22px; font-weight:800;">Leave Request Update</h2>
<p style="color:#475569; font-size:15px; line-height:24px;">
Hello <strong>${name}</strong>,
</p>
<p style="color:#475569; font-size:15px; line-height:24px;">
Your request for <strong>${leaveType}</strong> leave has been reviewed.
</p>

<table width="100%" style="background:#f8fafc; border-radius:8px; border: 1px solid #f1f5f9; margin-bottom: 25px; padding: 20px;">
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold; width: 120px;">Leave Type:</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:semibold;">${leaveType}</td>
</tr>
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold;">Duration:</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:semibold;">${startDateStr} to ${endDateStr}</td>
</tr>
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold;">Status:</td>
<td style="padding: 6px 0; color:${statusColor}; font-size:14px; font-weight:bold;">
<span style="font-size:15px; margin-right:4px;">${statusIcon}</span> ${status}
</td>
</tr>
<tr>
<td style="padding: 6px 0; color:#64748b; font-size:13px; font-weight:bold;">Reviewed By:</td>
<td style="padding: 6px 0; color:#0f172a; font-size:14px; font-weight:semibold;">${approverName || "HR / Admin"}</td>
</tr>
</table>

<p style="color:#475569; font-size:15px; line-height:24px;">
If you have any questions or require modifications, please contact the HR department.
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

module.exports = leaveStatusTemplate;

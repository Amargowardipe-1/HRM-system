const resetPasswordTemplate = (
  name,
  resetUrl
) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reset Password</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f4f4f4;
font-family:Arial,sans-serif;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
>

<tr>

<td align="center">

<table
width="600"
style="
background:#ffffff;
margin:40px auto;
padding:40px;
border-radius:10px;
"
>

<tr>
<td>

<h2
style="
margin-bottom:20px;
color:#222;
"
>
Reset Your Password
</h2>

<p>
Hello <strong>${name}</strong>,
</p>

<p>
We received a request to reset your password.
Click the button below.
</p>

<p
style="
text-align:center;
margin:35px 0;
"
>

<a
href="${resetUrl}"

style="
background:#2563eb;
color:#fff;
padding:14px 30px;
text-decoration:none;
border-radius:6px;
display:inline-block;
"

>

Reset Password

</a>

</p>

<p>
This link will expire in
<strong>15 minutes</strong>.
</p>

<p>
If you didn't request a password reset,
you can safely ignore this email.
</p>

<hr>

<p
style="
font-size:12px;
color:#888;
"
>

HRMS Team

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

module.exports = resetPasswordTemplate;
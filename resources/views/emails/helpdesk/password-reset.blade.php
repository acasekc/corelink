<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🔑 Password Reset
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Reset your helpdesk account password
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hello {{ $user->name }},
                            </p>
                            <p style="color: #b0b0b0; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                We received a request to reset your password. Click the button below to choose a new password. This link will expire in 60 minutes.
                            </p>

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $resetUrl }}"
                                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                                            If the button doesn't work, copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 8px 0 0; color: #a78bfa; font-size: 13px; word-break: break-all; font-family: monospace;">
                                            {{ $resetUrl }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f0f1e; padding: 25px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                This is an automated message from the Corelink Helpdesk.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

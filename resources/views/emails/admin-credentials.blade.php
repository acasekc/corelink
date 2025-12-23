<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Admin Credentials</title>
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
                                🔐 Admin Access Granted
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Welcome to Corelink Admin
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
                                Your admin account has been created. Use the credentials below to log in to the Discovery Admin dashboard.
                            </p>
                            
                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #2a2a4e;">
                                                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
                                                    <p style="margin: 5px 0 0; color: #a78bfa; font-size: 16px; font-family: monospace;">{{ $user->email }}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px 0 0;">
                                                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Password</span>
                                                    <p style="margin: 5px 0 0; color: #34d399; font-size: 18px; font-family: monospace; letter-spacing: 2px;">{{ $password }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url('/admin/login') }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Login to Admin Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Note -->
                            <div style="margin-top: 30px; padding: 15px; background-color: rgba(251, 191, 36, 0.1); border-left: 3px solid #fbbf24; border-radius: 0 8px 8px 0;">
                                <p style="color: #fbbf24; font-size: 14px; margin: 0;">
                                    ⚠️ <strong>Security Note:</strong> Please change your password after your first login.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #0f172a; text-align: center;">
                            <p style="color: #64748b; font-size: 13px; margin: 0;">
                                This email was sent by Corelink Discovery System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

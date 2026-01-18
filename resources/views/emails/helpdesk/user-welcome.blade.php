<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Corelink Helpdesk</title>
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
                                👋 Welcome to Helpdesk
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Your account has been created
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
                                An account has been created for you on the Corelink Helpdesk portal. You can use this account to submit and track support tickets.
                            </p>
                            
                            @if($project)
                            <p style="color: #b0b0b0; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                                You have been added to the <strong style="color: #a78bfa;">{{ $project->name }}</strong> project.
                            </p>
                            @endif
                            
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
                                                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</span>
                                                    <p style="margin: 5px 0 0; color: #34d399; font-size: 18px; font-family: monospace; letter-spacing: 2px;">{{ $password }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #422006; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #fcd34d; font-size: 14px;">
                                            ⚠️ <strong>Important:</strong> You will be required to change your password on first login.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url('/helpdesk/login') }}" 
                                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                                            Log In Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f0f1e; padding: 25px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                If you didn't expect this email, please contact support.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

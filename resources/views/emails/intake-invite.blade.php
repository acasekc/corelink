<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your CoreLink Project Intake</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 620px; margin: 0 auto; padding: 20px; background: #f9fafb;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Let's start your project</h1>
    </div>

    <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        @if($invite->prospect_name)
            <p style="font-size: 16px; margin-top: 0;">Hi {{ $invite->prospect_name }},</p>
        @else
            <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
        @endif

        <p style="font-size: 15px;">
            Thanks for considering CoreLink for your website project. To help us understand exactly what
            you need, we've put together a short intake form. It walks through your goals, scope, and
            timeline so we can give you an accurate plan from day one.
        </p>

        <p style="font-size: 15px;">
            It takes about 10–15 minutes. You can save your progress and come back anytime.
        </p>

        <div style="text-align: center; margin: 32px 0;">
            <a href="{{ $url }}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Open the intake form
            </a>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-top: 8px; text-align: center; word-break: break-all;">
            Or paste this link into your browser: <br>
            <a href="{{ $url }}" style="color: #3b82f6;">{{ $url }}</a>
        </p>

        @if($invite->expires_at)
            <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; text-align: center;">
                This link expires on {{ $invite->expires_at->format('F j, Y') }}.
            </p>
        @endif

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;">

        <p style="font-size: 13px; color: #6b7280; margin: 0;">
            Questions? Just reply to this email.
        </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>{{ config('app.name') }}</p>
    </div>
</body>
</html>

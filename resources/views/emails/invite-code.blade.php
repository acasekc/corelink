<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>You're Invited</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited! 🎉</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            You've been invited to share your project vision with us. Our AI-powered discovery assistant will help you articulate your ideas and create a comprehensive project plan.
        </p>

        <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Invite Code</p>
            <p style="font-size: 28px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 2px;">{{ $invite->code }}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $url }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Discovery Session
            </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
            <strong>What to expect:</strong>
        </p>
        <ul style="font-size: 14px; color: #6b7280; padding-left: 20px;">
            <li>A friendly conversation about your project idea</li>
            <li>Questions to help clarify your vision</li>
            <li>A personalized summary of your project requirements</li>
        </ul>

        @if($invite->expires_at)
        <p style="font-size: 13px; color: #9ca3af; margin-top: 20px;">
            ⏰ This invite expires on {{ $invite->expires_at->format('F j, Y') }}
        </p>
        @endif

        @if($invite->max_uses)
        <p style="font-size: 13px; color: #9ca3af;">
            📝 This invite can be used {{ $invite->max_uses - $invite->uses_count }} more time(s)
        </p>
        @endif
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>{{ config('app.name') }}</p>
    </div>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Intake received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 620px; margin: 0 auto; padding: 20px; background: #f9fafb;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">We've got it</h1>
    </div>

    <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-top: 0;">
            Thanks {{ $intake->data['contact_name'] ?? 'for submitting your intake' }} — we received your project details for
            <strong>{{ $intake->business_name }}</strong>.
        </p>

        <p style="font-size: 15px;">
            One of our team will review what you sent over and get back to you within 1–2 business days,
            usually with an initial scoping call to walk through your project together.
        </p>

        @if($intake->helpdesk_ticket_number)
            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                Your reference number: <strong>{{ $intake->helpdesk_ticket_number }}</strong>
            </p>
        @endif

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;">

        <p style="font-size: 13px; color: #6b7280; margin: 0;">
            If anything's changed or you want to add more context, just reply to this email.
        </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>{{ config('app.name') }}</p>
    </div>
</body>
</html>

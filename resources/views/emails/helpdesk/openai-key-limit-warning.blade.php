<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $type === 'suspended' ? 'OpenAI Key Suspended' : 'OpenAI Key Limit Reached' }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        @if($type === 'suspended')
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🚫 OpenAI Key Suspended
                            </h1>
                        @else
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ⚠️ OpenAI Key Limit Reached
                            </h1>
                        @endif
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                {{ $config->project->name ?? 'Unknown Project' }}
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                @if($type === 'suspended')
                                    The OpenAI API key <strong style="color: #ffffff;">{{ $key->name }}</strong> has exceeded its grace threshold and has been <strong style="color: #ef4444;">suspended</strong>. Requests using this key will be blocked until the spend limits are raised by an admin.
                                @else
                                    The OpenAI API key <strong style="color: #ffffff;">{{ $key->name }}</strong> has reached its max spend limit. It will continue working during the grace period, but will be suspended if spending reaches the grace threshold.
                                @endif
                            </p>

                            <!-- Key Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Key Name</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">{{ $key->name }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Current Spend</span><br>
                                                    <span style="color: {{ $type === 'suspended' ? '#ef4444' : '#f59e0b' }}; font-size: 22px; font-weight: 700;">${{ number_format((float) $key->spend_usd, 2) }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Max Spend Limit</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${{ number_format((float) $key->max_spend_usd, 2) }}</span>
                                                </td>
                                            </tr>
                                            @php $graceAmount = (float) ($key->grace_amount_usd ?? 0); @endphp
                                            @if($graceAmount > 0)
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Grace Amount</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">+${{ number_format($graceAmount, 2) }} (suspend at ${{ number_format((float) $key->max_spend_usd + $graceAmount, 2) }})</span>
                                                </td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            @if($type === 'suspended')
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 25px;">
                                To reactivate this key, log into the admin panel and either raise the max spend or grace amount above the current spend, or manually reactivate the key.
                            </p>
                            @else
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 25px;">
                                No action is required right now — the key will continue to work within the grace period. If the grace threshold is reached without limit adjustments, the key will be automatically suspended.
                            </p>
                            @endif
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #0f0f1a; text-align: center;">
                            <p style="color: #475569; font-size: 13px; margin: 0;">
                                CoreLink Helpdesk &bull; OpenAI API Billing
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

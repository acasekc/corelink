<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Helpdesk Activity Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="640" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📬 Helpdesk Activity Digest</h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                {{ $totalEvents }} {{ $totalEvents === 1 ? 'update' : 'updates' }} across {{ $ticketCount }} {{ $ticketCount === 1 ? 'ticket' : 'tickets' }}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px;">
                            @foreach ($tickets as $ticket)
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 24px; border-bottom: 1px solid #334155;">
                                            <p style="margin: 0 0 8px; color: #a78bfa; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">
                                                {{ $ticket['project_name'] }}
                                            </p>
                                            <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                                                {{ $ticket['ticket_number'] }} · {{ $ticket['ticket_title'] }}
                                            </h2>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px;">
                                            @foreach ($ticket['events'] as $event)
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: {{ $loop->last ? '0' : '18px' }};">
                                                    <tr>
                                                        <td style="vertical-align: top; padding-right: 16px; width: 120px;">
                                                            <span style="display: inline-block; padding: 6px 10px; border-radius: 999px; background-color: #312e81; color: #c4b5fd; font-size: 12px; font-weight: 600;">
                                                                {{ $event['label'] }}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <p style="margin: 0; color: #e2e8f0; font-size: 15px; font-weight: 600;">
                                                                {{ $event['description'] }}
                                                            </p>
                                                            @if (! empty($event['meta']))
                                                                <p style="margin: 6px 0 0; color: #93c5fd; font-size: 13px;">
                                                                    {{ $event['meta'] }}
                                                                </p>
                                                            @endif
                                                            @if (! empty($event['excerpt']))
                                                                <p style="margin: 10px 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                                                                    {{ $event['excerpt'] }}
                                                                </p>
                                                            @endif
                                                            @if (! empty($event['created_at']))
                                                                <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
                                                                    {{ $event['created_at'] }}
                                                                </p>
                                                            @endif
                                                        </td>
                                                    </tr>
                                                </table>
                                            @endforeach

                                            @if (! empty($ticket['ticket_id']))
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 18px;">
                                                    <tr>
                                                        <td>
                                                            <a href="{{ url('/helpdesk/tickets/' . $ticket['ticket_id']) }}"
                                                               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                                                View Ticket
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            @endif
                                        </td>
                                    </tr>
                                </table>
                            @endforeach
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                            <p style="margin: 0; color: #64748b; font-size: 13px;">
                                This digest groups helpdesk activity to keep your inbox a little less spicy.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

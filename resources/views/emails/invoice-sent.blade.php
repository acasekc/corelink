<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #1a56db;
            font-size: 24px;
            font-weight: bold;
        }
        .invoice-box {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #1a56db;
        }
        .invoice-details {
            margin-top: 15px;
        }
        .invoice-details table {
            width: 100%;
        }
        .invoice-details td {
            padding: 5px 0;
        }
        .invoice-details .label {
            color: #666;
            width: 120px;
        }
        .total-box {
            background: #1a56db;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .total-box .amount {
            font-size: 28px;
            font-weight: bold;
        }
        .total-box .label {
            font-size: 14px;
            opacity: 0.9;
        }
        .btn {
            display: inline-block;
            background: #1e3a5f;
            color: #ffffff !important;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 10px 0;
        }
        .btn:hover {
            background: #0f2942;
        }
        .action-box {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #666;
            text-align: center;
        }
        .note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 15px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">CoreLink Development</div>
    </div>

    <p>Hello{{ $invoice->billing_name ? ', '.$invoice->billing_name : '' }}!</p>

    <p>An invoice has been generated for <strong>{{ $projectName }}</strong>.</p>

    <div class="invoice-box">
        <div class="invoice-number">Invoice #{{ $invoice->invoice_number }}</div>
        <div class="invoice-details">
            <table>
                <tr>
                    <td class="label">Invoice Date:</td>
                    <td>{{ ($invoice->issue_date ?? $invoice->created_at)->format('F j, Y') }}</td>
                </tr>
                @if($invoice->due_date)
                <tr>
                    <td class="label">Due Date:</td>
                    <td>{{ $invoice->due_date->format('F j, Y') }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label">Project:</td>
                    <td>{{ $projectName }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="total-box">
        <div class="label">Amount Due</div>
        <div class="amount">${{ number_format($invoice->balance_due, 2) }}</div>
    </div>

    <div class="action-box">
        <a href="{{ $publicUrl }}" class="btn">View Invoice</a>
        <p style="font-size: 13px; color: #666; margin-top: 15px;">
            Click the button above to view your invoice online and make a payment.
        </p>
    </div>

    @if($invoice->notes)
    <div class="note">
        <strong>Note:</strong> {{ $invoice->notes }}
    </div>
    @endif

    <div class="footer">
        <p>
            Thank you for your business!<br>
            If you have any questions about this invoice, please contact us at<br>
            <a href="mailto:info@corelink.dev">info@corelink.dev</a>
        </p>
        <p style="margin-top: 20px; font-size: 11px; color: #999;">
            CoreLink Development<br>
            Web & Mobile Application Development
        </p>
    </div>
</body>
</html>

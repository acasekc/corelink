<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .container {
            padding: 40px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .header-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a56db;
            margin-bottom: 5px;
        }
        .company-info {
            font-size: 11px;
            color: #666;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .invoice-number {
            font-size: 14px;
            color: #666;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
        }
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-sent { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-partial { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-void { background: #f3f4f6; color: #6b7280; }

        .billing-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .billing-box {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .billing-label {
            font-size: 11px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .billing-value {
            font-size: 13px;
            line-height: 1.2;
        }
        .billing-value strong {
            display: inline;
            font-size: 14px;
        }

        .dates-section {
            margin-bottom: 30px;
        }
        .dates-table {
            width: auto;
        }
        .dates-table td {
            padding: 3px 20px 3px 0;
        }
        .dates-table td:first-child {
            font-weight: bold;
            color: #666;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            padding: 12px 10px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
        }
        .items-table th.text-right {
            text-align: right;
        }
        .items-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 12px 10px;
            vertical-align: top;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .item-description {
            font-weight: 500;
        }
        .item-details {
            font-size: 10px;
            color: #666;
            margin-top: 4px;
        }
        .item-type {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            text-transform: uppercase;
            background: #f1f5f9;
            color: #475569;
        }

        .totals-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .totals-spacer {
            display: table-cell;
            width: 60%;
        }
        .totals-box {
            display: table-cell;
            width: 40%;
        }
        .totals-table {
            width: 100%;
        }
        .totals-table td {
            padding: 6px 0;
        }
        .totals-table td:last-child {
            text-align: right;
        }
        .totals-table .subtotal-row td {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .totals-table .total-row td {
            padding-top: 10px;
            font-size: 16px;
            font-weight: bold;
        }
        .totals-table .balance-row td {
            padding-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #1a56db;
        }
        .totals-table .paid-row td {
            color: #059669;
        }

        .payments-section {
            margin-bottom: 30px;
        }
        .payments-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .payments-table {
            width: 100%;
            border-collapse: collapse;
        }
        .payments-table th {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 10px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
        }
        .payments-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 10px;
            font-size: 11px;
        }

        .notes-section {
            margin-bottom: 30px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 5px;
        }
        .notes-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        .notes-content {
            font-size: 11px;
            color: #666;
            white-space: pre-wrap;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <img src="{{ public_path('images/logo_blue.png') }}" alt="CoreLink" style="height: 100px; margin-bottom: 10px;">
                <div class="company-info">
                    Web & Mobile Application Development<br>
                    info@corelink.dev
                </div>
            </div>
            <div class="header-right">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#{{ $invoice->invoice_number }}</div>
                <div class="status-badge status-{{ $invoice->status }}">
                    {{ ucfirst($invoice->status) }}
                </div>
            </div>
        </div>

        <!-- Billing Section -->
        <div class="billing-section">
            <div class="billing-box">
                <div class="billing-label">Bill To</div>
                <div class="billing-value">
                    <strong>{{ $invoice->billing_name ?: $project->client_name ?: $project->name }}</strong><br>
                    @if($invoice->billing_email ?: $project->client_email)
                        {{ $invoice->billing_email ?: $project->client_email }}<br>
                    @endif
                    @if($invoice->billing_address ?: $project->client_address)
                        {!! nl2br(e($invoice->billing_address ?: $project->client_address)) !!}
                    @endif
                </div>
            </div>
            <div class="billing-box">
                <div class="billing-label">Project</div>
                <div class="billing-value">
                    <strong>{{ $project->name }}</strong>
                </div>
            </div>
        </div>

        <!-- Dates -->
        <div class="dates-section">
            <table class="dates-table">
                <tr>
                    <td>Invoice Date:</td>
                    <td>{{ $invoice->created_at->format('F j, Y') }}</td>
                </tr>
                @if($invoice->due_date)
                <tr>
                    <td>Due Date:</td>
                    <td>{{ $invoice->due_date->format('F j, Y') }}</td>
                </tr>
                @endif
                @if($invoice->sent_at)
                <tr>
                    <td>Sent:</td>
                    <td>{{ $invoice->sent_at->format('F j, Y') }}</td>
                </tr>
                @endif
            </table>
        </div>

        <!-- Line Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Description</th>
                    <th class="text-right" style="width: 15%;">Qty</th>
                    <th class="text-right" style="width: 15%;">Rate</th>
                    <th class="text-right" style="width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->lineItems as $item)
                <tr>
                    <td>
                        <div class="item-description">{{ $item->category?->name ?: $item->description }}</div>
                        <div class="item-details">
                            <span class="item-type">{{ strtoupper($item->type) }}</span>
                        </div>
                    </td>
                    <td class="text-right">
                        {{ number_format($item->quantity, 2) }}
                        @if($item->type === 'time')
                            hrs
                        @endif
                    </td>
                    <td class="text-right">${{ number_format($item->rate, 2) }}</td>
                    <td class="text-right">${{ number_format($item->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-spacer"></div>
            <div class="totals-box">
                <table class="totals-table">
                    <tr class="subtotal-row">
                        <td>Subtotal</td>
                        <td>${{ number_format($invoice->subtotal, 2) }}</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                    <tr>
                        <td>Discount{{ $invoice->discount_description ? ' ('.$invoice->discount_description.')' : '' }}</td>
                        <td>-${{ number_format($invoice->discount_amount, 2) }}</td>
                    </tr>
                    @endif
                    @if($invoice->credit_amount > 0)
                    <tr>
                        <td>Credit{{ $invoice->credit_description ? ' ('.$invoice->credit_description.')' : '' }}</td>
                        <td>-${{ number_format($invoice->credit_amount, 2) }}</td>
                    </tr>
                    @endif
                    @if($invoice->tax_rate > 0)
                    <tr>
                        <td>Tax ({{ $invoice->tax_rate }}%)</td>
                        <td>${{ number_format($invoice->tax_amount, 2) }}</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td>Total</td>
                        <td>${{ number_format($invoice->total, 2) }}</td>
                    </tr>
                    @if($invoice->paid_amount > 0)
                    <tr class="paid-row">
                        <td>Paid</td>
                        <td>-${{ number_format($invoice->paid_amount, 2) }}</td>
                    </tr>
                    @endif
                    <tr class="balance-row">
                        <td>Balance Due</td>
                        <td>${{ number_format($invoice->balance_due, 2) }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Payments -->
        @if($invoice->payments->count() > 0)
        <div class="payments-section">
            <div class="payments-title">Payment History</div>
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->payments as $payment)
                    <tr>
                        <td>{{ $payment->created_at->format('M j, Y') }}</td>
                        <td>{{ ucfirst(str_replace('_', ' ', $payment->method)) }}</td>
                        <td>{{ $payment->reference_number ?: '-' }}</td>
                        <td style="text-align: right;">${{ number_format($payment->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Notes -->
        @if($invoice->notes)
        <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">{{ $invoice->notes }}</div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            Thank you for your business!<br>
            Questions? Contact us at info@corelink.dev
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $invoice->invoice_number }} | CoreLink Development</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f3f4f6;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .invoice-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
            color: white;
            padding: 30px;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
        }
        .invoice-number {
            font-size: 14px;
            opacity: 0.9;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-paid {
            background: #10b981;
            color: white;
        }
        .status-sent, .status-partial {
            background: #f59e0b;
            color: white;
        }
        .status-overdue {
            background: #ef4444;
            color: white;
        }
        .status-draft {
            background: #6b7280;
            color: white;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
        }
        .total-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .total-amount {
            font-size: 36px;
            font-weight: bold;
            margin-top: 5px;
        }
        .content {
            padding: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-bottom: 30px;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
        .info-section h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .info-section p {
            color: #1f2937;
        }
        .line-items {
            margin: 30px 0;
        }
        .line-items table {
            width: 100%;
            border-collapse: collapse;
        }
        .line-items th {
            text-align: left;
            padding: 12px 8px;
            border-bottom: 2px solid #e5e7eb;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
        }
        .line-items th:last-child {
            text-align: right;
        }
        .line-items td {
            padding: 16px 8px;
            border-bottom: 1px solid #f3f4f6;
        }
        .line-items td:last-child {
            text-align: right;
            font-weight: 500;
        }
        .line-items .description {
            color: #1f2937;
        }
        .line-items .meta {
            font-size: 13px;
            color: #6b7280;
        }
        .totals {
            margin-top: 20px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .totals-row.total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #1f2937;
            margin-top: 10px;
            padding-top: 15px;
        }
        .totals-row.balance {
            font-size: 20px;
            font-weight: bold;
            color: #1a56db;
            background: #eff6ff;
            margin: 10px -8px 0;
            padding: 15px 8px;
            border-radius: 8px;
        }
        .payments-section {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .payments-section h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #1f2937;
        }
        .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .payment-row:last-child {
            border-bottom: none;
        }
        .payment-method {
            color: #6b7280;
            font-size: 14px;
        }
        .payment-amount {
            font-weight: 500;
            color: #10b981;
        }
        .notes {
            margin-top: 30px;
            padding: 15px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 0 8px 8px 0;
        }
        .notes-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .actions {
            padding: 30px;
            background: #f9fafb;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }
        .btn-primary {
            background: #1a56db;
            color: white;
        }
        .btn-primary:hover {
            background: #1e40af;
        }
        .btn-secondary {
            background: white;
            color: #1f2937;
            border: 1px solid #d1d5db;
        }
        .btn-secondary:hover {
            background: #f3f4f6;
        }
        .btn-success {
            background: #10b981;
            color: white;
        }
        .btn-success:hover {
            background: #059669;
        }
        .success-message {
            background: #d1fae5;
            border: 1px solid #10b981;
            color: #065f46;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        .success-message h3 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 13px;
        }
        .loading {
            display: none;
            align-items: center;
            gap: 8px;
        }
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff40;
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        @if(isset($paymentSuccess) && $paymentSuccess)
        <div class="success-message">
            <h3>🎉 Payment Successful!</h3>
            <p>Thank you for your payment. Your invoice will be updated shortly.</p>
        </div>
        @endif

        <div class="invoice-card">
            <div class="header">
                <div class="header-top">
                    <div>
                        <div class="logo">CoreLink Development</div>
                        <div class="invoice-number">Invoice #{{ $invoice->invoice_number }}</div>
                    </div>
                    <span class="status-badge status-{{ $invoice->status }}">
                        {{ ucfirst($invoice->status) }}
                    </span>
                </div>
                <div class="total-section">
                    <div class="total-label">
                        @if($invoice->is_paid)
                            Amount Paid
                        @else
                            Amount Due
                        @endif
                    </div>
                    <div class="total-amount">
                        ${{ number_format($invoice->is_paid ? $invoice->total : $invoice->balance_due, 2) }}
                    </div>
                </div>
            </div>

            <div class="content">
                <div class="info-grid">
                    <div class="info-section">
                        <h3>Bill To</h3>
                        <p><strong>{{ $invoice->billing_name ?: $project->name }}</strong></p>
                        @if($invoice->billing_email)
                        <p>{{ $invoice->billing_email }}</p>
                        @endif
                        @if($invoice->billing_address)
                        <p>{!! nl2br(e($invoice->billing_address)) !!}</p>
                        @endif
                    </div>
                    <div class="info-section">
                        <h3>Invoice Details</h3>
                        <p><strong>Project:</strong> {{ $project->name }}</p>
                        <p><strong>Invoice Date:</strong> {{ ($invoice->issue_date ?? $invoice->created_at)->format('F j, Y') }}</p>
                        @if($invoice->due_date)
                        <p><strong>Due Date:</strong> {{ $invoice->due_date->format('F j, Y') }}</p>
                        @endif
                        @if($invoice->period_start && $invoice->period_end)
                        <p><strong>Period:</strong> {{ $invoice->period_start->format('M j') }} - {{ $invoice->period_end->format('M j, Y') }}</p>
                        @endif
                    </div>
                </div>

                <div class="line-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="width: 80px; text-align: center;">Qty</th>
                                <th style="width: 100px; text-align: right;">Rate</th>
                                <th style="width: 100px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($invoice->lineItems as $item)
                            <tr>
                                <td>
                                    <div class="description">{{ $item->description }}</div>
                                    @if($item->category)
                                    <div class="meta">{{ $item->category->name }}</div>
                                    @endif
                                </td>
                                <td style="text-align: center;">
                                    @if($item->type === 'time')
                                        {{ number_format($item->quantity, 2) }} hrs
                                    @else
                                        {{ $item->quantity }}
                                    @endif
                                </td>
                                <td style="text-align: right;">${{ number_format($item->unit_price, 2) }}</td>
                                <td>${{ number_format($item->amount, 2) }}</td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" style="text-align: center; color: #6b7280; padding: 30px;">
                                    No line items
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-row">
                            <span>Subtotal</span>
                            <span>${{ number_format($invoice->subtotal, 2) }}</span>
                        </div>
                        @if($invoice->discount_amount > 0)
                        <div class="totals-row">
                            <span>Discount{{ $invoice->discount_description ? ' ('.$invoice->discount_description.')' : '' }}</span>
                            <span>-${{ number_format($invoice->discount_amount, 2) }}</span>
                        </div>
                        @endif
                        @if($invoice->tax_amount > 0)
                        <div class="totals-row">
                            <span>Tax ({{ $invoice->tax_rate }}%)</span>
                            <span>${{ number_format($invoice->tax_amount, 2) }}</span>
                        </div>
                        @endif
                        <div class="totals-row total">
                            <span>Total</span>
                            <span>${{ number_format($invoice->total, 2) }}</span>
                        </div>
                        @if($invoice->paid_amount > 0)
                        <div class="totals-row">
                            <span>Paid</span>
                            <span>-${{ number_format($invoice->paid_amount, 2) }}</span>
                        </div>
                        @endif
                        @if(!$invoice->is_paid)
                        <div class="totals-row balance">
                            <span>Balance Due</span>
                            <span>${{ number_format($invoice->balance_due, 2) }}</span>
                        </div>
                        @endif
                    </div>
                </div>

                @if($invoice->payments->count() > 0)
                <div class="payments-section">
                    <h3>Payment History</h3>
                    @foreach($invoice->payments as $payment)
                    <div class="payment-row">
                        <div>
                            <div>{{ $payment->payment_date->format('M j, Y') }}</div>
                            <div class="payment-method">{{ $payment->method_name }}</div>
                        </div>
                        <div class="payment-amount">+${{ number_format($payment->amount, 2) }}</div>
                    </div>
                    @endforeach
                </div>
                @endif

                @if($invoice->notes)
                <div class="notes">
                    <div class="notes-label">Notes</div>
                    <p>{{ $invoice->notes }}</p>
                </div>
                @endif
            </div>

            <div class="actions">
                <a href="{{ $pdfUrl }}" class="btn btn-secondary" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    Download PDF
                </a>

                @if($stripeEnabled && $payUrl && !$invoice->is_paid)
                <button type="button" class="btn btn-primary" id="pay-button" onclick="initiatePayment()">
                    <span class="pay-text">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Pay Now
                    </span>
                    <span class="loading">
                        <span class="spinner"></span>
                        Processing...
                    </span>
                </button>
                @endif
            </div>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Questions? Contact us at <a href="mailto:admin@corelink.dev">admin@corelink.dev</a></p>
        </div>
    </div>

    @if($stripeEnabled && $payUrl && !$invoice->is_paid)
    <script>
        async function initiatePayment() {
            const button = document.getElementById('pay-button');
            const payText = button.querySelector('.pay-text');
            const loading = button.querySelector('.loading');

            button.disabled = true;
            payText.style.display = 'none';
            loading.style.display = 'flex';

            try {
                const response = await fetch('{{ $payUrl }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    }
                });

                const data = await response.json();

                if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                } else {
                    throw new Error(data.message || 'Failed to create payment session');
                }
            } catch (error) {
                alert('Error: ' + error.message);
                button.disabled = false;
                payText.style.display = 'flex';
                loading.style.display = 'none';
            }
        }
    </script>
    @endif
</body>
</html>

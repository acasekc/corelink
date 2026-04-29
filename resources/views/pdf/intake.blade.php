<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Intake — {{ $intake->business_name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #1f2937;
        }
        .container { padding: 36px 44px; }
        .doc-header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .doc-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 4px;
        }
        .doc-sub {
            font-size: 11px;
            color: #6b7280;
        }
        .meta-grid {
            margin-bottom: 24px;
        }
        .meta-grid td {
            padding: 4px 8px 4px 0;
            font-size: 10px;
            color: #4b5563;
        }
        .meta-grid td.label {
            font-weight: bold;
            width: 130px;
            color: #1f2937;
        }
        h2.section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            background: #eff6ff;
            padding: 6px 10px;
            margin-top: 14px;
            margin-bottom: 8px;
            border-left: 3px solid #3b82f6;
        }
        table.fields {
            width: 100%;
            border-collapse: collapse;
        }
        table.fields td {
            padding: 5px 8px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
        }
        table.fields td.label {
            width: 35%;
            font-weight: bold;
            color: #4b5563;
        }
        .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            font-size: 9px;
            color: #9ca3af;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="doc-header">
        <div class="doc-title">{{ $intake->business_name }}</div>
        <div class="doc-sub">Client intake — submitted {{ $intake->submitted_at->format('F j, Y \a\t g:i A') }}</div>
    </div>

    <table class="meta-grid">
        <tr>
            <td class="label">Contact</td>
            <td>{{ $intake->data['contact_name'] ?? '—' }}</td>
            <td class="label">Email</td>
            <td>{{ $intake->email }}</td>
        </tr>
        <tr>
            <td class="label">Phone</td>
            <td>{{ $intake->data['phone'] ?? '—' }}</td>
            <td class="label">Industry</td>
            <td>{{ $intake->data['industry'] ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Budget</td>
            <td>{{ \App\Services\Intake\IntakeFormSchema::resolveValue('budget_range', $intake->budget_range, 'option:budget') }}</td>
            <td class="label">Invite code</td>
            <td>{{ $invite->code }}</td>
        </tr>
    </table>

    @foreach($sections as $section)
        @php
            $rows = [];
            foreach ($section['fields'] as $field) {
                $value = $intake->data[$field['key']] ?? null;
                $rendered = \App\Services\Intake\IntakeFormSchema::resolveValue($field['key'], $value, $field['type'] ?? null);
                if ($rendered === '—') { continue; }
                $rows[] = ['label' => $field['label'], 'value' => $rendered];
            }
        @endphp

        @if(count($rows) > 0)
            <h2 class="section-title">{{ $section['title'] }}</h2>
            <table class="fields">
                @foreach($rows as $row)
                    <tr>
                        <td class="label">{{ $row['label'] }}</td>
                        <td>{{ $row['value'] }}</td>
                    </tr>
                @endforeach
            </table>
        @endif
    @endforeach

    <div class="footer">
        Generated {{ now()->format('F j, Y g:i A') }} · {{ config('app.name') }}
    </div>
</div>
</body>
</html>

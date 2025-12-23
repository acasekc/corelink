<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contact Form Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #6366f1;
            margin: 0;
            font-size: 24px;
        }
        .field {
            margin-bottom: 15px;
        }
        .field-label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .field-value {
            margin-top: 5px;
            padding: 10px;
            background-color: #f9fafb;
            border-radius: 4px;
            border-left: 3px solid #6366f1;
        }
        .message-content {
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        
        <div class="field">
            <div class="field-label">From</div>
            <div class="field-value">{{ $name }} &lt;{{ $email }}&gt;</div>
        </div>
        
        <div class="field">
            <div class="field-label">Subject</div>
            <div class="field-value"><?php echo isset($contactSubject) && is_string($contactSubject) ? e($contactSubject) : ''; ?></div>
        </div>
        
        <div class="field">
            <div class="field-label">Message</div>
            <div class="field-value message-content"><?php echo isset($message) && is_string($message) ? nl2br(e($message)) : ''; ?></div>
        </div>
        
        <div class="footer">
            This email was sent from the contact form at corelink.dev
        </div>
    </div>
</body>
</html>

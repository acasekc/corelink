<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Usage Limit Reached</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🚫 API Key Disabled
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                <?php echo e($config->project->name ?? 'Unknown Project'); ?>

                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                Your Anthropic API usage has exceeded the grace threshold. Your API key has been automatically disabled to prevent further charges.
                            </p>

                            <!-- Usage Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Final Usage This Cycle</span><br>
                                                    <span style="color: #ef4444; font-size: 22px; font-weight: 700;">$<?php echo e(number_format($config->cycleUsageDollars(), 2)); ?></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Included Allowance</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">$<?php echo e(number_format($config->included_allowance, 2)); ?></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Grace Threshold</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;">$<?php echo e(number_format($config->grace_threshold, 2)); ?></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Total Overage</span><br>
                                                    <span style="color: #ef4444; font-size: 16px; font-weight: 600;">$<?php echo e(number_format($config->overageCents() / 100, 2)); ?></span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                                To restore API access, please contact your account administrator. Overage charges will be reflected in your next invoice.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f0f1e; padding: 25px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                This is an automated notification from CoreLink API monitoring.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
<?php /**PATH C:\Users\aaron\Code\corelink\resources\views/emails/helpdesk/anthropic-usage-limit-reached.blade.php ENDPATH**/ ?>
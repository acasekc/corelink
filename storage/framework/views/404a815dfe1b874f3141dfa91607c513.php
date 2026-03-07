<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin: Anthropic API Usage Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <?php if($alertType === 'limit_reached'): ?>
                            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    🚫 API Key Disabled
                                </h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                    <?php echo e($config->project->name ?? 'Unknown Project'); ?>

                                </p>
                            </td>
                        <?php else: ?>
                            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ⚠️ Usage Warning
                                </h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                    <?php echo e($config->project->name ?? 'Unknown Project'); ?>

                                </p>
                            </td>
                        <?php endif; ?>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <?php if($alertType === 'limit_reached'): ?>
                                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                    The API key for <strong><?php echo e($config->project->name ?? 'Unknown Project'); ?></strong> has been automatically disabled after exceeding the grace threshold.
                                </p>
                            <?php else: ?>
                                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                    The project <strong><?php echo e($config->project->name ?? 'Unknown Project'); ?></strong> has exceeded its included API allowance and entered the grace period.
                                </p>
                            <?php endif; ?>

                            <!-- Usage Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Current Usage</span><br>
                                                    <span style="color: <?php echo e($alertType === 'limit_reached' ? '#ef4444' : '#f59e0b'); ?>; font-size: 22px; font-weight: 700;">$<?php echo e(number_format($config->cycleUsageDollars(), 2)); ?></span>
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
                                                    <span style="color: #94a3b8; font-size: 13px;">Overage Mode</span><br>
                                                    <span style="color: #ffffff; font-size: 16px; font-weight: 600;"><?php echo e(ucfirst($config->overage_mode->value)); ?></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 15px; border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                    <span style="color: #94a3b8; font-size: 13px;">Key Status</span><br>
                                                    <span style="color: <?php echo e($alertType === 'limit_reached' ? '#ef4444' : '#f59e0b'); ?>; font-size: 16px; font-weight: 600;"><?php echo e($config->key_status->label()); ?></span>
                                                </td>
                                            </tr>
                                            <?php if($config->overageCents() > 0): ?>
                                                <tr>
                                                    <td style="border-top: 1px solid #2a2a4e; padding-top: 15px;">
                                                        <span style="color: #94a3b8; font-size: 13px;">Total Overage (with <?php echo e($config->markup_percentage); ?>% markup)</span><br>
                                                        <span style="color: <?php echo e($alertType === 'limit_reached' ? '#ef4444' : '#f59e0b'); ?>; font-size: 16px; font-weight: 600;">$<?php echo e(number_format($config->overageWithMarkupCents() / 100, 2)); ?></span>
                                                    </td>
                                                </tr>
                                            <?php endif; ?>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <?php if($alertType === 'limit_reached'): ?>
                                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                                    The client's API key has been disabled. Manual intervention is required to re-enable access.
                                </p>
                            <?php else: ?>
                                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                                    No action required yet. The key will be automatically disabled if usage reaches the grace threshold.
                                </p>
                            <?php endif; ?>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f0f1e; padding: 25px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                CoreLink Admin — Anthropic API Monitoring
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
<?php /**PATH C:\Users\aaron\Code\corelink\resources\views/emails/helpdesk/anthropic-usage-admin-alert.blade.php ENDPATH**/ ?>
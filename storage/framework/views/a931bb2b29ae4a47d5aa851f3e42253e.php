<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anthropic API Weekly Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a2e;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #16213e; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                📊 Weekly Usage Digest
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Anthropic API — <?php echo e(now()->subWeek()->format('M j')); ?> to <?php echo e(now()->format('M j, Y')); ?>

                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <?php if($summaries->isEmpty()): ?>
                                <p style="color: #94a3b8; font-size: 16px; text-align: center;">
                                    No active Anthropic API configurations found.
                                </p>
                            <?php else: ?>
                                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                    <?php echo e($summaries->count()); ?> project<?php echo e($summaries->count() === 1 ? '' : 's'); ?> with Anthropic API configured.
                                </p>

                                <?php $__currentLoopData = $summaries; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $summary): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 20px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <!-- Project Name & Status -->
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                                                    <tr>
                                                        <td>
                                                            <h3 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                                                                <?php echo e($summary['project_name']); ?>

                                                            </h3>
                                                        </td>
                                                        <td style="text-align: right;">
                                                            <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
                                                                <?php if($summary['status'] === 'active'): ?> background-color: rgba(34, 197, 94, 0.2); color: #22c55e;
                                                                <?php elseif($summary['status'] === 'grace'): ?> background-color: rgba(245, 158, 11, 0.2); color: #f59e0b;
                                                                <?php elseif($summary['status'] === 'disabled'): ?> background-color: rgba(239, 68, 68, 0.2); color: #ef4444;
                                                                <?php else: ?> background-color: rgba(148, 163, 184, 0.2); color: #94a3b8;
                                                                <?php endif; ?>
                                                            ">
                                                                <?php echo e(ucfirst($summary['status'])); ?>

                                                            </span>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Usage Bar -->
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                                                    <tr>
                                                        <td>
                                                            <div style="background-color: #2a2a4e; border-radius: 4px; height: 8px; overflow: hidden;">
                                                                <div style="background-color: <?php echo e($summary['usage_percent'] > 100 ? '#ef4444' : ($summary['usage_percent'] > 80 ? '#f59e0b' : '#22c55e')); ?>; height: 8px; width: <?php echo e(min($summary['usage_percent'], 100)); ?>%; border-radius: 4px;"></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Stats -->
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #94a3b8; font-size: 13px;">
                                                            Usage: <span style="color: #ffffff; font-weight: 600;">$<?php echo e(number_format($summary['usage_dollars'], 2)); ?></span>
                                                            / $<?php echo e(number_format($summary['allowance'], 2)); ?>

                                                            <span style="color: #64748b;">(<?php echo e($summary['usage_percent']); ?>%)</span>
                                                        </td>
                                                        <td style="text-align: right; color: #94a3b8; font-size: 13px;">
                                                            Grace: $<?php echo e(number_format($summary['grace_threshold'], 2)); ?>

                                                        </td>
                                                    </tr>
                                                    <?php if($summary['overage_dollars'] > 0): ?>
                                                        <tr>
                                                            <td colspan="2" style="color: #f59e0b; font-size: 13px; padding-top: 6px;">
                                                                Overage: $<?php echo e(number_format($summary['overage_dollars'], 2)); ?>

                                                                (with <?php echo e($summary['markup_percentage']); ?>% markup: $<?php echo e(number_format($summary['overage_with_markup_dollars'], 2)); ?>)
                                                            </td>
                                                        </tr>
                                                    <?php endif; ?>
                                                    <?php if($summary['last_synced']): ?>
                                                        <tr>
                                                            <td colspan="2" style="color: #64748b; font-size: 12px; padding-top: 6px;">
                                                                Last synced: <?php echo e($summary['last_synced']); ?>

                                                            </td>
                                                        </tr>
                                                    <?php endif; ?>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                                <!-- Summary Stats -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #2a2a4e; padding-top: 20px; margin-top: 10px;">
                                    <tr>
                                        <td style="text-align: center; padding: 10px;">
                                            <span style="color: #64748b; font-size: 12px; display: block;">Total Usage</span>
                                            <span style="color: #ffffff; font-size: 20px; font-weight: 700;">$<?php echo e(number_format($summaries->sum('usage_dollars'), 2)); ?></span>
                                        </td>
                                        <td style="text-align: center; padding: 10px;">
                                            <span style="color: #64748b; font-size: 12px; display: block;">Projects Active</span>
                                            <span style="color: #22c55e; font-size: 20px; font-weight: 700;"><?php echo e($summaries->where('status', 'active')->count()); ?></span>
                                        </td>
                                        <td style="text-align: center; padding: 10px;">
                                            <span style="color: #64748b; font-size: 12px; display: block;">Needing Attention</span>
                                            <span style="color: #f59e0b; font-size: 20px; font-weight: 700;"><?php echo e($summaries->where('status', '!=', 'active')->count()); ?></span>
                                        </td>
                                    </tr>
                                </table>
                            <?php endif; ?>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f0f1e; padding: 25px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 13px;">
                                CoreLink Admin — Anthropic API Weekly Digest
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
<?php /**PATH C:\Users\aaron\Code\corelink\resources\views/emails/helpdesk/anthropic-weekly-digest.blade.php ENDPATH**/ ?>
<?php
// test-smtp.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'mail.corelink.dev';
    $mail->SMTPAuth = true;
    $mail->Username = 'support@corelink.dev';
    $mail->Password = 'M&FvmJ6LaN^U';
    $mail->Port = 465;
    $mail->SMTPSecure = 'ssl';
    $mail->SMTPAutoTLS = true;
    $mail->setFrom('support@corelink.dev', 'CoreLink Test');
    $mail->addAddress('sales@corelink.dev');
    $mail->Subject = 'SMTP Test';
    $mail->Body = 'This is a test email from PHPMailer.';
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ],
    ];
    $mail->send();
    echo "SMTP test email sent successfully!\n";
} catch (Exception $e) {
    echo "SMTP test failed: {$mail->ErrorInfo}\n";
}

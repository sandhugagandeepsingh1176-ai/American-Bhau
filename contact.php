<?php
// Receives the site's forms ("Book a call" and "Reserve seats") and gets them to Rahul.
// 1. Emails the enquiry: through Bird if config.php has a key, otherwise the server's own mail().
// 2. Keeps a backup line in leads.csv one level above public_html, so nothing is lost if email fails.
// Optional config.php one level above public_html (see config.example.php).
header('Content-Type: application/json; charset=utf-8');

function done($code, $ok, $msg = '') { http_response_code($code); echo json_encode(['ok' => $ok, 'message' => $msg]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') done(405, false, 'POST only');
if (!empty($_POST['website'])) done(200, true); // honeypot: bots fill it, pretend success

$cfgFile = __DIR__ . '/../config.php';
$cfg = is_file($cfgFile) ? require $cfgFile : [];
$to = $cfg['to'] ?? 'rahul@americanbhau.com';

$labels = [
    'form' => 'Form', 'name' => 'Name', 'business' => 'Business', 'email' => 'Email', 'phone' => 'Phone',
    'city' => 'City', 'service' => 'Interested in', 'seats' => 'Seats', 'event' => 'Event', 'message' => 'Message',
];
$f = [];
foreach ($labels as $k => $_) $f[$k] = trim(mb_substr((string)($_POST[$k] ?? ''), 0, 2000));
$f['form'] = $f['form'] === 'event' ? 'event' : 'contact';

if ($f['name'] === '' || !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) done(400, false, 'Please add your name and a valid email.');

$subject = $f['form'] === 'event'
    ? 'Seat request: ' . $f['name'] . ' (' . ($f['seats'] ?: '1') . ' seats)'
    : 'New enquiry: ' . $f['name'] . ($f['business'] ? ' · ' . $f['business'] : '');
$rows = '';
$text = '';
foreach ($labels as $k => $label) {
    if ($f[$k] === '') continue;
    $rows .= '<tr><td style="padding:4px 12px 4px 0;color:#566573"><b>' . $label . '</b></td><td>' . nl2br(htmlspecialchars($f[$k], ENT_QUOTES, 'UTF-8')) . '</td></tr>';
    $text .= $label . ': ' . $f[$k] . "\n";
}
$html = '<table style="font:15px Arial,sans-serif">' . $rows . '</table>';

// Backup copy (outside the public folder)
$csv = __DIR__ . '/../leads.csv';
if ($fh = @fopen($csv, 'a')) {
    fputcsv($fh, array_merge([date('c')], array_values($f)));
    fclose($fh);
}

$sent = false;
if (!empty($cfg['bird_key'])) {
    $ch = curl_init('https://us1.platform.bird.com/email');
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $cfg['bird_key'], 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode([
            'from' => ['email' => $cfg['from'] ?? 'onboarding@messagebird.dev', 'name' => 'American Bhau Website'],
            'to' => [$to], 'replyTo' => $f['email'], 'subject' => $subject, 'html' => $html,
        ]),
    ]);
    curl_exec($ch);
    $sent = in_array(curl_getinfo($ch, CURLINFO_HTTP_CODE), [200, 202], true);
    curl_close($ch);
}
if (!$sent) {
    $host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'americanbhau.com');
    $headers = "From: American Bhau Website <no-reply@$host>\r\nReply-To: {$f['email']}\r\nContent-Type: text/plain; charset=UTF-8";
    $sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $text, $headers);
}

$sent ? done(200, true) : done(502, false, 'We could not send this right now.');

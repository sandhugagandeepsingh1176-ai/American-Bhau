<?php
// Receives the contact form and emails it to Rahul via Bird (US region).
// Key lives in config.php (one level above public_html, see config.example.php).
$cfg = require __DIR__ . '/../config.php';

function fail($code) { http_response_code($code); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405);
if (!empty($_POST['website'])) exit; // honeypot: bots fill it, pretend success

$f = [];
foreach (['firstName', 'lastName', 'email', 'countryCode', 'phone', 'message'] as $k) {
    $f[$k] = htmlspecialchars(trim($_POST[$k] ?? ''), ENT_QUOTES, 'UTF-8');
}
if ($f['firstName'] === '' || !filter_var($f['email'], FILTER_VALIDATE_EMAIL)) fail(400);
$f = [
    'name' => trim($f['firstName'] . ' ' . $f['lastName']),
    'email' => $f['email'],
    'whatsapp' => trim($f['countryCode'] . ' ' . $f['phone']),
    'message' => $f['message'],
];

$html = '';
foreach ($f as $k => $v) $html .= '<p><b>' . ucfirst($k) . ':</b> ' . nl2br($v) . '</p>';

$ch = curl_init('https://us1.platform.bird.com/email');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $cfg['bird_key'], 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'from' => ['email' => $cfg['from'], 'name' => 'American Bhau Website'],
        'to' => [$cfg['to']],
        'subject' => 'New enquiry: ' . $f['name'],
        'html' => $html,
    ]),
]);
curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($status === 202 ? 200 : 502);

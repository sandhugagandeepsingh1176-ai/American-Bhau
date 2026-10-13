<?php
// Live YouTube data for the homepage: latest videos + channel numbers, cached for an hour.
// No API key needed: reads the public channel page and the channel's RSS feed.
// If YouTube can't be reached, the page keeps the numbers baked into index.html.
const HANDLE = 'american-bhau';
const TTL = 3600;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=900');
$cache = sys_get_temp_dir() . '/ab-youtube.json';
if (is_file($cache) && time() - filemtime($cache) < TTL) { readfile($cache); exit; }

function get($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; AmericanBhauSite/1.0)',
        CURLOPT_HTTPHEADER => ['Accept-Language: en-US,en;q=0.9'],
    ]);
    $body = curl_exec($ch);
    $ok = curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
    curl_close($ch);
    return $ok ? $body : null;
}

$page = get('https://www.youtube.com/@' . HANDLE);
$id = null;
if ($page && preg_match('/"(?:externalId|channelId)":"(UC[\w-]{22})"/', $page, $m)) $id = $m[1];
$out = ['subscribers' => null, 'videos' => null, 'items' => []];
if ($page && preg_match('/([\d.,]+[KMB]?) subscribers/', $page, $m)) $out['subscribers'] = $m[1];
if ($page && preg_match('/([\d.,]+[KMB]?) videos/', $page, $m)) $out['videos'] = $m[1];

$feed = $id ? get('https://www.youtube.com/feeds/videos.xml?channel_id=' . $id) : null;
if ($feed && ($xml = @simplexml_load_string($feed))) {
    foreach ($xml->entry as $e) {
        $yt = $e->children('http://www.youtube.com/xml/schemas/2015');
        $media = $e->children('http://search.yahoo.com/mrss/')->group;
        $stats = $media->community ? $media->community->statistics->attributes() : null;
        $vid = (string)$yt->videoId;
        $out['items'][] = [
            'id' => $vid,
            'title' => (string)$e->title,
            'date' => substr((string)$e->published, 0, 10),
            'views' => $stats ? (int)$stats['views'] : null,
            'thumb' => "https://i.ytimg.com/vi/$vid/hqdefault.jpg",
            'url' => "https://www.youtube.com/watch?v=$vid",
        ];
        if (count($out['items']) >= 6) break;
    }
}

if (!$out['items'] && !$out['subscribers']) { http_response_code(502); echo '{"items":[]}'; exit; }
$json = json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cache, $json);
echo $json;

<?php
/**
 * Get content from GitHub repository
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/config.php';

session_start();
validateRequest();

$client = $_GET['client'] ?? 'chios';

if (!isset($GITHUB_REPOS[$client])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid client specified'
    ]);
    exit;
}

$repo_config = $GITHUB_REPOS[$client];
$file_path = $repo_config['content_path'];

// Get file content from GitHub
$endpoint = sprintf(
    '/repos/%s/%s/contents/%s?ref=%s',
    $repo_config['owner'],
    $repo_config['repo'],
    $file_path,
    $repo_config['branch']
);

$result = github_request($endpoint);

if (!$result['success']) {
    http_response_code($result['http_code'] ?? 500);
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Failed to fetch content from GitHub'
    ]);
    exit;
}

// Decode base64 content
$content = base64_decode($result['data']['content']);
$json_data = json_decode($content, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON in repository: ' . json_last_error_msg()
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $json_data,
    'sha' => $result['data']['sha'] // Need this for updating
]);

?>


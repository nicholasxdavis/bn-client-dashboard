<?php
/**
 * Update content in GitHub repository
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../auth/session.php';
require_once __DIR__ . '/config.php';

session_start();
validateRequest();

$input = json_decode(file_get_contents('php://input'), true);
$client = $input['client'] ?? 'chios';
$content = $input['content'] ?? null;
$sha = $input['sha'] ?? null;

if (!$content) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Content is required'
    ]);
    exit;
}

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

// If SHA not provided, get it first
if (!$sha) {
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
            'message' => 'Failed to get file SHA: ' . $result['message']
        ]);
        exit;
    }
    $sha = $result['data']['sha'];
}

// Validate JSON
$json_string = is_string($content) ? $content : json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (json_decode($json_string) === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON: ' . json_last_error_msg()
    ]);
    exit;
}

// Encode content to base64
$encoded_content = base64_encode($json_string);

// Update file on GitHub
$endpoint = sprintf(
    '/repos/%s/%s/contents/%s',
    $repo_config['owner'],
    $repo_config['repo'],
    $file_path
);

$data = [
    'message' => 'Update content via admin dashboard - ' . date('Y-m-d H:i:s'),
    'content' => $encoded_content,
    'sha' => $sha,
    'branch' => $repo_config['branch']
];

$result = github_request($endpoint, 'PUT', $data);

if (!$result['success']) {
    http_response_code($result['http_code'] ?? 500);
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Failed to update content on GitHub'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Content updated successfully',
    'sha' => $result['data']['content']['sha']
]);

?>


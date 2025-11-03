<?php
/**
 * GitHub API Configuration
 * Reads GH_KEY from environment variable
 */

// Get GitHub token from environment variable
$github_token = getenv('GH_KEY');

if (!$github_token) {
    // Try $_ENV if getenv doesn't work
    $github_token = $_ENV['GH_KEY'] ?? null;
}

if (!$github_token) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'GitHub token (GH_KEY) not configured in environment variables'
    ]);
    exit;
}

// GitHub API configuration
define('GITHUB_API_BASE', 'https://api.github.com');
define('GITHUB_TOKEN', $github_token);

// Repository configuration - update these for your client repos
// IMPORTANT: Update the 'owner' value below with your actual GitHub username
$GITHUB_REPOS = [
    'chios' => [
        'owner' => 'your-username', // TODO: Update with your GitHub username
        'repo' => 'chios-testing', // Repository name for Chios client website
        'branch' => 'main', // or 'master' - the default branch of your repo
        'content_path' => 'content.json' // Path to JSON file in repo (relative to repo root)
    ]
];

/**
 * Make GitHub API request
 */
function github_request($endpoint, $method = 'GET', $data = null) {
    $url = GITHUB_API_BASE . $endpoint;
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: token ' . GITHUB_TOKEN,
            'Accept: application/vnd.github.v3+json',
            'User-Agent: Blacnova-Admin'
        ],
        CURLOPT_CUSTOMREQUEST => $method
    ]);
    
    if ($data && ($method === 'POST' || $method === 'PUT' || $method === 'PATCH')) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return [
            'success' => false,
            'message' => 'CURL Error: ' . $error
        ];
    }
    
    $decoded = json_decode($response, true);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        return [
            'success' => true,
            'data' => $decoded,
            'http_code' => $httpCode
        ];
    } else {
        return [
            'success' => false,
            'message' => $decoded['message'] ?? 'GitHub API error',
            'http_code' => $httpCode,
            'data' => $decoded
        ];
    }
}

?>


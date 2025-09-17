<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// A more robust function to handle GitHub API requests using cURL
function github_request_curl($url, $method = 'GET', $data = null, $token = '') {
    $ch = curl_init();

    $headers = [
        "Authorization: token $token",
        "User-Agent: BN-Dashboard",
        "Accept: application/vnd.github.v3+json"
    ];

    if ($data !== null) {
        $payload = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        $headers[] = "Content-Type: application/json";
        $headers[] = "Content-Length: " . strlen($payload);
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_FAILONERROR, false); // Allow us to get the error response body

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code >= 400) {
        $error_details = json_decode($response, true);
        $error_message = $error_details['message'] ?? 'Unknown GitHub API error';
        throw new Exception("GitHub API Error: " . $error_message . " (Status Code: " . $http_code . ")");
    }
    
    return json_decode($response, true);
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// --- Configuration ---
$github_token_url = 'https://nicholasxdavis.github.io/bn-eco/pass-over/pass_tok.txt';
$github_repo = 'nicholasxdavis/bn-eco';
$github_file_path = 'pass-over/pass.json';
$github_api_url = "https://api.github.com/repos/$github_repo/contents/$github_file_path";

$host = 'roscwoco0sc8w08kwsko8ko8';
$db = 'default';
$user = 'mariadb';
$pass = 'JswmqQok4swQf1JDKQD1WE311UPXBBE6NYJv6jRSP91dbkZDYj5sMc5sehC1LQTu';
$charset = 'utf8mb4';

try {
    // --- 1. Database Operation ---
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->rowCount() > 0) {
        throw new Exception('User already exists in the database');
    }
    
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
    $role = in_array($data['role'], ['admin', 'editor', 'viewer']) ? $data['role'] : 'viewer';
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['email'], $password_hash, $data['full_name'], $role]);

    // --- 2. GitHub API Operation ---
    $tokenWithAsterisks = file_get_contents($github_token_url);
    if ($tokenWithAsterisks === false) {
        throw new Exception('Could not fetch GitHub token');
    }
    $github_token = str_replace('*', '', $tokenWithAsterisks);

    $file_data = github_request_curl($github_api_url, 'GET', null, $github_token);
    
    if (!isset($file_data['sha'])) {
        throw new Exception('Could not retrieve file SHA from GitHub.');
    }
    $sha = $file_data['sha'];
    $current_content = base64_decode($file_data['content']);

    $new_user_key = preg_replace('/\s+/', '', $data['full_name']);
    $new_user_entry = [
        $new_user_key => [
            "name" => $data['full_name'],
            "email" => $data['email'],
            "username" => strtolower(explode(' ', $data['full_name'])[0])
        ]
    ];
    $new_user_json_string = json_encode($new_user_entry, JSON_PRETTY_PRINT);
    
    // Append new user with a newline to separate from previous entries
    $updated_content = rtrim($current_content) . "\n" . $new_user_json_string;
    
    $update_data = [
        'message' => 'Add new user via dashboard: ' . $data['full_name'],
        'content' => base64_encode($updated_content),
        'sha' => $sha
    ];
    
    github_request_curl($github_api_url, 'PUT', $update_data, $github_token);
    
    echo json_encode(['success' => true, 'message' => 'User created and synced successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

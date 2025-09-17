<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// --- GitHub Configuration ---
$github_token_url = 'http://nicholasxdavis.github.io/bn-eco/pass-over/pass_tok.txt';
$github_repo = 'nicholasxdavis/bn-eco';
$github_file_path = 'pass-over/pass.json';

// --- Database connection ---
$host = 'roscwoco0sc8w08kwsko8ko8';
$db = 'default';
$user = 'mariadb';
$pass = 'JswmqQok4swQf1JDKQD1WE311UPXBBE6NYJv6jRSP91dbkZDYj5sMc5sehC1LQTu';
$charset = 'utf8mb4';

try {
    // --- 1. Add user to the database ---
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'User already exists']);
        exit;
    }
    
    // Create user
    $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
    $role = in_array($data['role'], ['admin', 'editor', 'viewer']) ? $data['role'] : 'viewer';
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['email'], $password_hash, $data['full_name'], $role]);

    // --- 2. Update the JSON file on GitHub ---
    
    // Fetch and clean the token
    $tokenWithAsterisks = file_get_contents($github_token_url);
    $github_token = str_replace('*', '', $tokenWithAsterisks);

    // Get the current contents of the file
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: token $github_token\r\n" .
                        "User-Agent: BN-Dashboard\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $file_data_json = file_get_contents("https://api.github.com/repos/$github_repo/contents/$github_file_path", false, $context);
    $file_data = json_decode($file_data_json, true);
    $sha = $file_data['sha'];
    $current_content = base64_decode($file_data['content']);

    // Add the new user to the JSON content
    $json_content = json_decode($current_content, true);
    $new_user_key = ucfirst($data['full_name']); // Or another logic for the key
    $json_content[$new_user_key] = [
        "name" => $data['full_name'],
        "email" => $data['email'],
        "username" => strtolower(explode(' ', $data['full_name'])[0]) // Simple username logic
    ];
    $updated_content = json_encode($json_content, JSON_PRETTY_PRINT);
    
    // Update the file on GitHub
    $update_data = [
        'message' => 'Add new user from dashboard',
        'content' => base64_encode($updated_content),
        'sha' => $sha
    ];
    
    $opts = [
        'http' => [
            'method' => 'PUT',
            'header' => "Authorization: token $github_token\r\n" .
                        "User-Agent: BN-Dashboard\r\n" .
                        "Content-Type: application/json\r\n",
            'content' => json_encode($update_data)
        ]
    ];
    $context = stream_context_create($opts);
    file_get_contents("https://api.github.com/repos/$github_repo/contents/$github_file_path", false, $context);
    
    echo json_encode(['success' => true, 'message' => 'User created and synced successfully']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?>
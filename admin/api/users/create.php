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

// Database connection
$host = 'localhost';
$db = 'default';
$user = 'mariadb';
$pass = 'JswmqQok4swQf1JDKQD1WE311UPXBBE6NYJv6jRSP91dbkZDYj5sMc5sehC1LQTu';
$charset = 'utf8mb4';

try {
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
    
    echo json_encode(['success' => true, 'message' => 'User created successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
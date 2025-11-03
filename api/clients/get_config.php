<?php
/**
 * Get client configuration
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

$clientId = $_GET['client'] ?? null;

if (!$clientId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Client ID is required'
    ]);
    exit;
}

$config = getClientConfig($clientId);

if (!$config) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Client configuration not found'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'data' => $config
]);

?>


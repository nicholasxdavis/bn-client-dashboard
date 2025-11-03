<?php
/**
 * Get client configuration
 */

// Suppress errors and set JSON header first
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configure session settings
ini_set('session.cookie_httponly', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_samesite', 'Lax');

// Start session first
if (!session_id()) {
    session_start();
}

// Load session functions
require_once __DIR__ . '/../../session.php';
require_once __DIR__ . '/config.php';

// Validate request (check if logged in)
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required. Please log in again.'
    ]);
    exit;
}

try {
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
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}


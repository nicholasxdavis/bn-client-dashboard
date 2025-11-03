<?php
// session.php
// Don't auto-start session - let calling code handle it

// Check if user is logged in
function isLoggedIn() {
    if (!session_id()) {
        return false;
    }
    return isset($_SESSION['user_id']);
}

// Check if user has admin role
function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

// Get current user ID
function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Validate API request
function validateRequest() {
    if (!isLoggedIn()) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
}
?>
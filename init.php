<?php
/**
 * Initialization script for setting up users
 * Run this in your browser: http://your-domain.com/admin/init.php
 */

header('Content-Type: text/html; charset=utf-8');

// Include database connection
require_once __DIR__ . '/api/auth/db_connect.php';
require_once __DIR__ . '/session.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Initialization</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .user-list {
            margin-top: 20px;
        }
        .user-item {
            padding: 12px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-email {
            font-weight: 500;
            color: #333;
        }
        .user-password {
            color: #666;
            font-size: 13px;
        }
        .status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .status.created {
            background: #d4edda;
            color: #155724;
        }
        .status.exists {
            background: #fff3cd;
            color: #856404;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Admin Initialization</h1>
        <p class="subtitle">Setting up users and database...</p>
        
        <?php
        $messages = [];
        $errors = [];
        
        try {
            // Check if users table exists, if not create it
            $tableCheck = $pdo->query("SHOW TABLES LIKE 'users'");
            if ($tableCheck->rowCount() == 0) {
                $pdo->exec("
                    CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    );
                ");
                $messages[] = "Users table created successfully.";
            }
            
            // Users to create/update
            $users = [
                [
                    'email' => 'chiosclean@gmail.com',
                    'password' => '2900',
                    'full_name' => 'Chios Cleaning Admin',
                    'role' => 'admin'
                ],
                [
                    'email' => 'nic@blacnova.net',
                    'password' => '2900',
                    'full_name' => 'Nic Blacnova',
                    'role' => 'admin'
                ]
            ];
            
            $results = [];
            
            foreach ($users as $userData) {
                $email = $userData['email'];
                $password = $userData['password'];
                $fullName = $userData['full_name'];
                $role = $userData['role'];
                
                // Check if user exists
                $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
                $stmt->execute([$email]);
                $existingUser = $stmt->fetch();
                
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                if ($existingUser) {
                    // Update existing user
                    $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, full_name = ?, role = ? WHERE email = ?');
                    $stmt->execute([$passwordHash, $fullName, $role, $email]);
                    $results[] = [
                        'email' => $email,
                        'password' => $password,
                        'status' => 'exists',
                        'message' => 'User updated'
                    ];
                } else {
                    // Create new user
                    $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)');
                    $stmt->execute([$email, $passwordHash, $fullName, $role]);
                    $results[] = [
                        'email' => $email,
                        'password' => $password,
                        'status' => 'created',
                        'message' => 'User created'
                    ];
                }
            }
            
        } catch (PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
        
        // Display messages
        if (!empty($messages)) {
            foreach ($messages as $msg) {
                echo '<div class="message info">' . htmlspecialchars($msg) . '</div>';
            }
        }
        
        if (!empty($errors)) {
            foreach ($errors as $error) {
                echo '<div class="message error">' . htmlspecialchars($error) . '</div>';
            }
        }
        
        if (!empty($results)) {
            echo '<div class="message success"><strong>✅ User Setup Complete!</strong></div>';
            echo '<div class="user-list">';
            foreach ($results as $result) {
                echo '<div class="user-item">';
                echo '<div>';
                echo '<div class="user-email">' . htmlspecialchars($result['email']) . '</div>';
                echo '<div class="user-password">Password: ' . htmlspecialchars($result['password']) . '</div>';
                echo '</div>';
                echo '<span class="status ' . htmlspecialchars($result['status']) . '">' . htmlspecialchars($result['message']) . '</span>';
                echo '</div>';
            }
            echo '</div>';
            echo '<div class="message info" style="margin-top: 20px;">';
            echo '<strong>You can now log in with these credentials:</strong><br>';
            echo '• chiosclean@gmail.com | 2900<br>';
            echo '• nic@blacnova.net | 2900<br><br>';
            echo '<a href="index.php" style="color: #667eea; text-decoration: none; font-weight: 500;">→ Go to Dashboard</a>';
            echo '</div>';
        }
        ?>
    </div>
</body>
</html>


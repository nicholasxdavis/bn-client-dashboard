<?php
/**
 * Client Configuration System
 * Defines dashboard structure and features for each client
 */

// Client configurations
$CLIENT_CONFIGS = [
    'chios' => [
        'name' => 'Chios Cleaning',
        'type' => 'cleaning',
        'dashboard' => 'simple',
        'tabs' => [
            [
                'id' => 'overview',
                'name' => 'Overview',
                'icon' => 'fas fa-tachometer-alt',
                'enabled' => true
            ],
            [
                'id' => 'content',
                'name' => 'Content',
                'icon' => 'fas fa-edit',
                'enabled' => true
            ],
            [
                'id' => 'services',
                'name' => 'Services',
                'icon' => 'fas fa-broom',
                'enabled' => true
            ],
            [
                'id' => 'contact',
                'name' => 'Contact Info',
                'icon' => 'fas fa-phone',
                'enabled' => true
            ],
            [
                'id' => 'images',
                'name' => 'Images',
                'icon' => 'fas fa-images',
                'enabled' => true
            ],
            [
                'id' => 'settings',
                'name' => 'Settings',
                'icon' => 'fas fa-cog',
                'enabled' => true
            ]
        ],
        'features' => [
            'blog' => false,
            'ecommerce' => false,
            'appointments' => false,
            'reviews' => true,
            'team' => true,
            'services' => true
        ]
    ]
    // Add more clients here:
    // 'another-client' => [
    //     'name' => 'Another Business',
    //     'type' => 'restaurant', // or 'retail', 'service', etc.
    //     'dashboard' => 'full', // or 'simple', 'custom'
    //     'tabs' => [
    //         // Define tabs for this client
    //     ],
    //     'features' => [
    //         // Define features for this client
    //     ]
    // ]
    // Add more clients here as needed
    // 'another-client' => [...]
];

/**
 * Get client configuration
 */
function getClientConfig($clientId) {
    global $CLIENT_CONFIGS;
    return $CLIENT_CONFIGS[$clientId] ?? null;
}

/**
 * Get all enabled tabs for a client
 */
function getClientTabs($clientId) {
    $config = getClientConfig($clientId);
    if (!$config) return [];
    
    return array_filter($config['tabs'], function($tab) {
        return $tab['enabled'] ?? true;
    });
}

/**
 * Check if client has feature enabled
 */
function clientHasFeature($clientId, $feature) {
    $config = getClientConfig($clientId);
    if (!$config) return false;
    
    return $config['features'][$feature] ?? false;
}

?>


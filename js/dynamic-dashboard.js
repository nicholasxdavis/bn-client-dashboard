/**
 * Dynamic Dashboard Loader
 * Loads client-specific dashboard configuration and builds navigation/pages
 */

(function() {
    let clientConfig = null;
    let currentClientId = null;
    
    // Initialize dashboard on load
    document.addEventListener('DOMContentLoaded', function() {
        // Get client ID from storage or user data
        const clientIdFromStorage = localStorage.getItem('blacnova_client_id') || 
                                     sessionStorage.getItem('blacnova_client_id');
        
        const userData = JSON.parse(
            localStorage.getItem('blacnova_user') || 
            sessionStorage.getItem('blacnova_user') || 
            '{}'
        );
        
        // Priority: storage > user data > default
        currentClientId = clientIdFromStorage || userData.client_id || 'chios';
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            loadClientDashboard();
        }, 100);
    });
    
    async function loadClientDashboard() {
        try {
            const response = await fetch(`/api/clients/get_config.php?client=${currentClientId}`);
            const result = await response.json();
            
            if (!result.success) {
                console.error('Failed to load client config:', result.message);
                return;
            }
            
            clientConfig = result.data;
            buildDashboard();
            
        } catch (error) {
            console.error('Error loading dashboard config:', error);
        }
    }
    
    function buildDashboard() {
        if (!clientConfig) return;
        
        // Build navigation
        buildNavigation();
        
        // Build pages
        buildPages();
        
        // Hide/show tabs based on config
        updateVisibility();
    }
    
    function buildNavigation() {
        const desktopNav = document.querySelector('.w-64.bg-dark-bg nav.space-y-1');
        const mobileNav = document.querySelector('#mobile-sidebar nav.space-y-1');
        
        if (!desktopNav || !mobileNav) return;
        
        // Clear existing nav (except overview which should always be first)
        const existingItems = desktopNav.querySelectorAll('.nav-item[data-page]:not([data-page="overview"])');
        existingItems.forEach(item => item.remove());
        
        const mobileItems = mobileNav.querySelectorAll('.nav-item[data-page]:not([data-page="overview"])');
        mobileItems.forEach(item => item.remove());
        
        // Add configured tabs
        const tabs = clientConfig.tabs || [];
        tabs.forEach((tab, index) => {
            if (!tab.enabled) return;
            
            if (tab.id === 'overview') return; // Already exists
            
            // Desktop nav
            const navItem = document.createElement('div');
            navItem.className = 'nav-item p-3 rounded-3xl flex items-center space-x-3 text-white';
            navItem.setAttribute('data-page', tab.id);
            navItem.innerHTML = `
                <i class="${tab.icon || 'fas fa-circle'} w-5 text-center"></i>
                <span>${tab.name}</span>
            `;
            
            // Insert after overview (or at end if overview not found)
            const overviewItem = desktopNav.querySelector('.nav-item[data-page="overview"]');
            if (overviewItem && overviewItem.nextSibling) {
                desktopNav.insertBefore(navItem, overviewItem.nextSibling);
            } else {
                desktopNav.appendChild(navItem);
            }
            
            // Mobile nav
            const mobileItem = navItem.cloneNode(true);
            const mobileOverview = mobileNav.querySelector('.nav-item[data-page="overview"]');
            if (mobileOverview && mobileOverview.nextSibling) {
                mobileNav.insertBefore(mobileItem, mobileOverview.nextSibling);
            } else {
                mobileNav.appendChild(mobileItem);
            }
        });
        
        // Re-attach event listeners
        attachNavListeners();
    }
    
    function buildPages() {
        const pagesContainer = document.querySelector('.flex-1.overflow-y-auto');
        if (!pagesContainer) return;
        
        const tabs = clientConfig.tabs || [];
        
        tabs.forEach(tab => {
            if (!tab.enabled) return;
            
            // Check if page already exists
            const existingPage = document.getElementById(`${tab.id}-page`);
            if (existingPage) return;
            
            // Create page element
            const page = document.createElement('div');
            page.id = `${tab.id}-page`;
            page.className = 'page';
            
            // Load page content based on tab type
            page.innerHTML = getPageContent(tab);
            
            pagesContainer.appendChild(page);
        });
    }
    
    function getPageContent(tab) {
        // Simple pages for Chios Cleaning
        switch(tab.id) {
            case 'content':
                return getContentPage();
            case 'services':
                return getServicesPage();
            case 'contact':
                return getContactPage();
            case 'images':
                return getImagesPage();
            case 'settings':
                return getSettingsPage();
            default:
                return `<div class="p-6"><h1>${tab.name}</h1></div>`;
        }
    }
    
    function getContentPage() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Content</h1>
                        <p class="text-gray-500">Edit your website content</p>
                    </div>
                </div>
                
                <div class="glass-card p-6 rounded-3xl mb-6">
                    <h3 class="font-medium mb-4">Hero Section</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Title</label>
                            <input type="text" id="hero-title" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Subtitle</label>
                            <input type="text" id="hero-subtitle" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Description</label>
                            <textarea id="hero-description" rows="3" class="w-full px-4 py-2 border border-gray-200 rounded-lg"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="glass-card p-6 rounded-3xl mb-6">
                    <h3 class="font-medium mb-4">About Section</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">About Title</label>
                            <input type="text" id="about-title" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">About Text</label>
                            <textarea id="about-text" rows="4" class="w-full px-4 py-2 border border-gray-200 rounded-lg"></textarea>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button id="save-content-btn" class="btn-primary px-6 py-2 rounded-3xl">
                        <i class="fas fa-save mr-2"></i> Save Changes
                    </button>
                </div>
            </div>
        `;
    }
    
    function getServicesPage() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Services</h1>
                        <p class="text-gray-500">Manage your cleaning services</p>
                    </div>
                    <button class="btn-primary px-4 py-2 rounded-3xl">
                        <i class="fas fa-plus mr-2"></i> Add Service
                    </button>
                </div>
                
                <div id="services-list" class="space-y-4">
                    <!-- Services will be loaded here -->
                </div>
            </div>
        `;
    }
    
    function getContactPage() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Contact Information</h1>
                        <p class="text-gray-500">Update your business contact details</p>
                    </div>
                </div>
                
                <div class="glass-card p-6 rounded-3xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium mb-1">Phone Number</label>
                            <input type="tel" id="contact-phone" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Email Address</label>
                            <input type="email" id="contact-email" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Business Address</label>
                            <input type="text" id="contact-address" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Service Area</label>
                            <input type="text" id="service-area" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-6">
                        <button id="save-contact-btn" class="btn-primary px-6 py-2 rounded-3xl">
                            <i class="fas fa-save mr-2"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getImagesPage() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Images</h1>
                        <p class="text-gray-500">Manage your website images</p>
                    </div>
                    <button class="btn-primary px-4 py-2 rounded-3xl">
                        <i class="fas fa-upload mr-2"></i> Upload Image
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="glass-card p-4 rounded-3xl">
                        <div class="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <i class="fas fa-image text-3xl text-gray-400"></i>
                        </div>
                        <h4 class="font-medium mb-1">Logo</h4>
                        <button class="text-sm text-primary">Change</button>
                    </div>
                    <div class="glass-card p-4 rounded-3xl">
                        <div class="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <i class="fas fa-image text-3xl text-gray-400"></i>
                        </div>
                        <h4 class="font-medium mb-1">Hero Image</h4>
                        <button class="text-sm text-primary">Change</button>
                    </div>
                    <div class="glass-card p-4 rounded-3xl">
                        <div class="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <i class="fas fa-image text-3xl text-gray-400"></i>
                        </div>
                        <h4 class="font-medium mb-1">Banner</h4>
                        <button class="text-sm text-primary">Change</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getSettingsPage() {
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Settings</h1>
                        <p class="text-gray-500">Configure your website</p>
                    </div>
                </div>
                
                <div class="glass-card p-6 rounded-3xl">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Site Title</label>
                            <input type="text" id="site-title" class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Site Description</label>
                            <textarea id="site-description" rows="2" class="w-full px-4 py-2 border border-gray-200 rounded-lg"></textarea>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-6">
                        <button id="save-settings-btn" class="btn-primary px-6 py-2 rounded-3xl">
                            <i class="fas fa-save mr-2"></i> Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateVisibility() {
        // Hide all pages first
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show overview by default
        const overviewPage = document.getElementById('overview-page');
        if (overviewPage) {
            overviewPage.classList.add('active');
        }
    }
    
    function attachNavListeners() {
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        const pages = document.querySelectorAll('.page');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all nav items
                navItems.forEach(nav => nav.classList.remove('active-nav'));
                
                // Add active class to clicked nav item
                item.classList.add('active-nav');
                
                // Hide all pages
                pages.forEach(page => page.classList.remove('active'));
                
                // Show the selected page
                const pageId = item.getAttribute('data-page') + '-page';
                const targetPage = document.getElementById(pageId);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
                
                // Close mobile menu if open
                const mobileSidebar = document.getElementById('mobile-sidebar');
                if (mobileSidebar) {
                    mobileSidebar.classList.add('hidden');
                }
            });
        });
    }
    
    // Expose for external use
    window.reloadDashboard = loadClientDashboard;
    window.getClientConfig = () => clientConfig;
})();


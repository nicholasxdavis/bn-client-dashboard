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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            let result;
            
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Invalid JSON response:', text);
                throw new Error('Invalid response from server');
            }
            
            if (!result.success) {
                console.error('Failed to load client config:', result.message);
                showError('Failed to load dashboard configuration');
                return;
            }
            
            clientConfig = result.data;
            buildDashboard();
            
        } catch (error) {
            console.error('Error loading dashboard config:', error);
            showError('Error loading dashboard. Please refresh the page.');
        }
    }
    
    function showError(message) {
        const mainContent = document.querySelector('.flex-1.overflow-y-auto');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="p-6">
                    <div class="glass-card p-6 rounded-3xl text-center">
                        <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                        <h2 class="text-xl font-medium mb-2">Error</h2>
                        <p class="text-gray-600 mb-4">${message}</p>
                        <button onclick="location.reload()" class="btn-primary px-4 py-2 rounded-3xl">
                            <i class="fas fa-redo mr-2"></i> Reload Page
                        </button>
                    </div>
                </div>
            `;
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
        
        // Hide all default nav items first (except overview)
        const defaultTabs = ['appearance', 'content-media', 'blog', 'submissions', 'ecommerce', 'clients', 'support'];
        defaultTabs.forEach(tabId => {
            const desktopItem = desktopNav.querySelector(`.nav-item[data-page="${tabId}"]`);
            const mobileItem = mobileNav.querySelector(`.nav-item[data-page="${tabId}"]`);
            if (desktopItem) desktopItem.style.display = 'none';
            if (mobileItem) mobileItem.style.display = 'none';
        });
        
        // Clear existing nav (except overview which should always be first)
        const existingItems = desktopNav.querySelectorAll('.nav-item[data-page]:not([data-page="overview"])');
        existingItems.forEach(item => {
            if (item.style.display !== 'none') {
                item.remove();
            }
        });
        
        const mobileItems = mobileNav.querySelectorAll('.nav-item[data-page]:not([data-page="overview"])');
        mobileItems.forEach(item => {
            if (item.style.display !== 'none') {
                item.remove();
            }
        });
        
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
            if (existingPage) {
                // Update existing page
                return;
            }
            
            // Create page element
            const page = document.createElement('div');
            page.id = `${tab.id}-page`;
            page.className = 'page';
            
            // Load page content based on tab type
            page.innerHTML = getPageContent(tab);
            
            pagesContainer.appendChild(page);
            
            // If content page, load GitHub content
            if (tab.id === 'content') {
                setTimeout(() => {
                    loadContentEditor();
                }, 100);
            }
        });
    }
    
    async function loadContentEditor() {
        const container = document.getElementById('content-editor-container');
        if (!container) return;
        
        container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i><p class="text-gray-500">Loading content from GitHub...</p></div>';
        
        try {
            const response = await fetch(`/api/github/get_content.php?client=${currentClientId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            let result;
            
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Invalid JSON response:', text);
                throw new Error('Invalid response from server');
            }
            
            if (result.success && result.data) {
                window.currentContentSha = result.sha; // Store SHA for saving
                window.currentContentData = result.data; // Store content for saving
                renderContentEditor(result.data, container);
            } else {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                        <p class="text-red-600">${result.message || 'Failed to load content'}</p>
                        <button onclick="location.reload()" class="btn-secondary px-4 py-2 rounded-3xl mt-4">
                            <i class="fas fa-redo mr-2"></i> Retry
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                    <p class="text-red-600">Error loading content: ${error.message}</p>
                    <button onclick="location.reload()" class="btn-secondary px-4 py-2 rounded-3xl mt-4">
                        <i class="fas fa-redo mr-2"></i> Retry
                    </button>
                </div>
            `;
        }
    }
    
    function renderContentEditor(content, container) {
        // Simple content editor for Chios
        container.innerHTML = `
            <div class="mb-6">
                <h3 class="font-medium mb-4">Hero Section</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Hero Title</label>
                        <input type="text" id="hero-title" value="${escapeHtml(content.content?.hero?.title || '')}" 
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hero Subtitle</label>
                        <input type="text" id="hero-subtitle" value="${escapeHtml(content.content?.hero?.subtitle || '')}" 
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Hero Description</label>
                        <textarea id="hero-description" rows="3" 
                                  class="w-full px-4 py-2 border border-gray-200 rounded-lg">${escapeHtml(content.content?.hero?.text || '')}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-medium mb-4">About Section</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">About Title</label>
                        <input type="text" id="about-title" value="${escapeHtml(content.content?.about?.title || '')}" 
                               class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">About Text</label>
                        <textarea id="about-text" rows="4" 
                                  class="w-full px-4 py-2 border border-gray-200 rounded-lg">${escapeHtml(content.content?.about?.text || '')}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end">
                <button id="save-content-btn" class="btn-primary px-6 py-2 rounded-3xl">
                    <i class="fas fa-save mr-2"></i> Save Changes
                </button>
            </div>
        `;
        
        // Store content globally for saving
        window.currentContentData = content;
        
        // Attach save handler
        document.getElementById('save-content-btn')?.addEventListener('click', () => {
            saveContentChanges(window.currentContentData);
        });
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async function saveContentChanges(currentContent) {
        if (!currentContent) {
            alert('No content loaded. Please refresh the page.');
            return;
        }
        
        // Ensure content structure exists
        if (!currentContent.content) currentContent.content = {};
        if (!currentContent.content.hero) currentContent.content.hero = {};
        if (!currentContent.content.about) currentContent.content.about = {};
        
        // Update content object from form fields
        const heroTitleEl = document.getElementById('hero-title');
        const heroSubtitleEl = document.getElementById('hero-subtitle');
        const heroDescEl = document.getElementById('hero-description');
        const aboutTitleEl = document.getElementById('about-title');
        const aboutTextEl = document.getElementById('about-text');
        
        if (heroTitleEl) currentContent.content.hero.title = heroTitleEl.value;
        if (heroSubtitleEl) currentContent.content.hero.subtitle = heroSubtitleEl.value;
        if (heroDescEl) currentContent.content.hero.text = heroDescEl.value;
        if (aboutTitleEl) currentContent.content.about.title = aboutTitleEl.value;
        if (aboutTextEl) currentContent.content.about.text = aboutTextEl.value;
        
        const saveBtn = document.getElementById('save-content-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
        }
        
        // Save via GitHub API
        try {
            const response = await fetch('/api/github/update_content.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client: currentClientId,
                    content: currentContent,
                    sha: window.currentContentSha || null
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            let result;
            
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid response from server');
            }
            
            if (result.success) {
                window.currentContentSha = result.sha; // Update SHA
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Saved!';
                    saveBtn.classList.add('bg-green-500');
                    setTimeout(() => {
                        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
                        saveBtn.classList.remove('bg-green-500');
                        saveBtn.disabled = false;
                    }, 2000);
                }
                alert('Content saved successfully to GitHub!');
            } else {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
                }
                alert('Error saving: ' + result.message);
            }
        } catch (error) {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
            }
            alert('Error saving content: ' + error.message);
        }
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
        // This will be replaced by the client editor integration
        return `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-medium">Content</h1>
                        <p class="text-gray-500">Edit your website content from GitHub</p>
                    </div>
                </div>
                
                <div id="content-editor-container" class="glass-card p-6 rounded-3xl">
                    <div class="text-center py-12">
                        <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-500">Loading content editor...</p>
                    </div>
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


/**
 * Dashboard Help Guide Injector
 * This script injects a floating help button and a dynamic help guide modal
 * into the page. All HTML, CSS, and JavaScript are self-contained.
 * To use, simply include this script in your HTML file.
 */

(function() {
    // --- Configuration and Content ---
    const config = {
        buttonIcon: '<i class="fas fa-question-circle"></i>',
        buttonSize: '60px',
        mainColor: '#d4611c',
        backgroundColor: '#1a1a1a',
        fontFamily: "'Poppins', sans-serif",
        fontUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
        pages: {
            'overview': {
                title: 'Overview',
                icon: 'fas fa-tachometer-alt',
                content: `
                    <p class="text-gray-400">The <strong>Overview</strong> tab provides a snapshot of your website's performance. Here you can see key statistics like total visitors and page views, as well as recent activity and quick actions to manage your site. This is your main hub for monitoring your business at a glance.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Stats Overview:</strong> Monitor key performance indicators (KPIs) like visitors, page views, and conversion rates.</li>
                        <li><strong>Recent Activity:</strong> See a log of recent changes and events on your site.</li>
                        <li><strong>Quick Actions:</strong> Use these shortcuts to quickly create a new blog post, upload media, or access other important features.</li>
                    </ul>
                `
            },
            'appearance': {
                title: 'Appearance',
                icon: 'fas fa-paint-brush',
                content: `
                    <p class="text-gray-400">The <strong>Appearance</strong> tab allows you to customize the look and feel of your website to match your brand. Change colors, fonts, and upload your logo and favicon for a consistent brand identity.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Color Palette:</strong> Easily change your primary, secondary, and background colors.</li>
                        <li><strong>Font Palette:</strong> Choose different fonts for your headings and body text.</li>
                        <li><strong>Branding:</strong> Upload your main logo and favicon to display on your site.</li>
                    </ul>
                `
            },
            'content-media': {
                title: 'Content & Media',
                icon: 'fas fa-images',
                content: `
                    <p class="text-gray-400">The <strong>Content & Media</strong> tab is where you manage your website's content and media files. Upload and organize images, videos, and other assets to use throughout your site.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Hero Section:</strong> Change the main background images for your hero sections.</li>
                        <li><strong>General Media:</strong> View and manage all uploaded media files in one centralized library.</li>
                        <li><strong>Upload Media:</strong> Use the "Upload Media" button to add new files to your library.</li>
                    </ul>
                `
            },
            'blog': {
                title: 'Blog',
                icon: 'fas fa-blog',
                content: `
                    <p class="text-gray-400">In the <strong>Blog</strong> tab, you can create and manage all of your blog posts. Write new articles, edit existing ones, and publish them to your website to engage with your audience.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>New Post:</strong> Use the "New Post" button to open a content editor for a new article.</li>
                        <li><strong>Manage Posts:</strong> View a list of all your published and drafted posts.</li>
                        <li><strong>Edit & View:</strong> Easily edit the content or view the live version of any post.</li>
                    </ul>
                `
            },
            'submissions': {
                title: 'Submissions',
                icon: 'fas fa-inbox',
                content: `
                    <p class="text-gray-400">The <strong>Submissions</strong> tab displays all form submissions from your website, such as contact forms and newsletter sign-ups. You can view, manage, and export all submitted data.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Form Filters:</strong> Filter submissions by form type (e.g., Contact Form, Newsletter) to quickly find what you need.</li>
                        <li><strong>Data Table:</strong> View a clear, organized table of all submitted information.</li>
                        <li><strong>Export:</strong> Download your submissions as a file for easy data analysis.</li>
                    </ul>
                `
            },
            'ecommerce': {
                title: 'E-commerce',
                icon: 'fas fa-shopping-cart',
                content: `
                    <p class="text-gray-400">The <strong>E-commerce</strong> tab is your control center for your online store. Manage your product catalog, track inventory, and monitor orders and sales.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Add Product:</strong> Add new items to your online store with a simple form.</li>
                        <li><strong>Product Management:</strong> See all your products, their prices, and stock levels.</li>
                        <li><strong>Order Tracking:</strong> Monitor incoming orders and manage their fulfillment status.</li>
                    </ul>
                `
            },
            'settings': {
                title: 'Settings',
                icon: 'fas fa-cog',
                content: `
                    <p class="text-gray-400">The <strong>Settings</strong> tab allows you to configure global settings for your website. This includes general site information, maintenance mode, and SEO settings.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>General Settings:</strong> Set your site title and description for search engines.</li>
                        <li><strong>Maintenance Mode:</strong> Take your site offline for maintenance with a single toggle.</li>
                        <li><strong>SEO Settings:</strong> Add meta keywords and connect your Google Analytics account.</li>
                    </ul>
                `
            },
            'support': {
                title: 'Support',
                icon: 'fas fa-question-circle',
                content: `
                    <p class="text-gray-400">The <strong>Support</strong> tab is your resource for getting help. You can contact our support team directly or find answers to common questions in our help resources section.</p>
                    <ul class="list-disc list-inside mt-4 text-gray-400 space-y-2">
                        <li><strong>Contact Support:</strong> Fill out a form to send a direct message to our support team.</li>
                        <li><strong>Help Resources:</strong> Access documentation, video tutorials, and a list of frequently asked questions.</li>
                        <li><strong>Community Forum:</strong> Connect with other users and find peer-to-peer assistance.</li>
                    </ul>
                `
            }
        }
    };

    // --- Main Function to Create the Button and Modal ---
    function createHelpGuide() {
        // 1. Inject CSS and Fonts into the document's <head>
        const styleSheet = `
            /* Injected Font */
            @import url('${config.fontUrl}');

            /* Main Component Styles */
            .help-guide-btn {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: ${config.buttonSize};
                height: ${config.buttonSize};
                background-color: ${config.mainColor};
                color: white;
                border: none;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
                z-index: 1000;
                transition: transform 0.2s ease-in-out;
            }
            .help-guide-btn:hover {
                transform: scale(1.1);
            }
            .help-guide-btn:focus {
                outline: none;
            }

            /* Modal Styles */
            .help-guide-modal {
                position: fixed;
                inset: 0;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .help-guide-modal.active {
                opacity: 1;
                visibility: visible;
            }

            .help-guide-modal-content {
                background-color: ${config.backgroundColor};
                color: white;
                border-radius: 1.5rem;
                padding: 2rem;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            .help-guide-modal.active .help-guide-modal-content {
                transform: translateY(0);
            }

            .help-guide-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .help-guide-modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }

            .help-guide-modal-nav {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 1rem;
            }
            
            .help-guide-modal-nav-item {
                background-color: #333333;
                color: #ccc;
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s;
            }

            .help-guide-modal-nav-item:hover {
                background-color: ${config.mainColor};
                color: white;
            }

            .help-guide-modal-nav-item.active {
                background-color: ${config.mainColor};
                color: white;
                font-weight: 500;
            }
        `;
        const styleElement = document.createElement('style');
        styleElement.textContent = styleSheet;
        document.head.appendChild(styleElement);

        // 2. Define the HTML structure for the button and modal
        const componentHTML = `
            <button class="help-guide-btn" id="help-guide-button">
                ${config.buttonIcon}
            </button>

            <div class="help-guide-modal" id="help-guide-modal">
                <div class="help-guide-modal-content">
                    <div class="help-guide-modal-header">
                        <h2 class="text-2xl font-semibold poppins-font-section">Help Guide</h2>
                        <button class="help-guide-modal-close" id="help-guide-modal-close">&times;</button>
                    </div>

                    <div class="help-guide-modal-nav" id="help-guide-nav">
                        ${Object.keys(config.pages).map(key => `
                            <button class="help-guide-modal-nav-item" data-page-key="${key}">${config.pages[key].title}</button>
                        `).join('')}
                    </div>

                    <div id="help-guide-content" class="poppins-font-section">
                        <!-- Content will be injected here -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', componentHTML);

        // 3. Initialize the JavaScript logic
        initializeLogic();
    }

    // --- Component Logic and Interaction ---
    function initializeLogic() {
        const button = document.getElementById('help-guide-button');
        const modal = document.getElementById('help-guide-modal');
        const modalClose = document.getElementById('help-guide-modal-close');
        const navContainer = document.getElementById('help-guide-nav');
        const contentArea = document.getElementById('help-guide-content');

        if (!button || !modal || !modalClose || !navContainer || !contentArea) {
            console.error("Help Guide Injector: Could not find required elements. Make sure the HTML is correctly structured.");
            return;
        }

        // Show a specific page's content and update the active nav item
        function showPage(pageKey) {
            const pageData = config.pages[pageKey];
            if (!pageData) return;

            // Update content
            contentArea.innerHTML = `
                <h3 class="text-xl font-medium mb-4 text-white">${pageData.title}</h3>
                ${pageData.content}
            `;

            // Update active state of nav items
            document.querySelectorAll('.help-guide-modal-nav-item').forEach(navItem => {
                if (navItem.dataset.pageKey === pageKey) {
                    navItem.classList.add('active');
                } else {
                    navItem.classList.remove('active');
                }
            });
        }

        // Event listeners
        button.addEventListener('click', () => {
            modal.classList.add('active');
            // Show the first page by default
            const firstPage = Object.keys(config.pages)[0];
            if (firstPage) {
                showPage(firstPage);
            }
        });

        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        navContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.help-guide-modal-nav-item');
            if (target) {
                const pageKey = target.dataset.pageKey;
                showPage(pageKey);
            }
        });
    }

    // --- Execution ---
    // Wait for the DOM to be fully loaded before creating the button.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createHelpGuide);
    } else {
        createHelpGuide();
    }

})();

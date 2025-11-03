/**
 * Client Editor - GitHub Integration
 * Handles loading and saving client website content via GitHub API
 */

(function() {
    let currentClient = 'chios';
    let currentContent = null;
    let currentSha = null;
    
    // Load content when client is selected or page is shown
    document.addEventListener('DOMContentLoaded', function() {
        const clientSelect = document.getElementById('client-select');
        const saveButton = document.getElementById('save-client-content');
        
        if (clientSelect) {
            clientSelect.addEventListener('change', function() {
                currentClient = this.value;
                loadClientContent();
            });
        }
        
        if (saveButton) {
            saveButton.addEventListener('click', saveClientContent);
        }
        
        // Load content when clients page is shown
        const navItems = document.querySelectorAll('.nav-item[data-page="clients"]');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                setTimeout(loadClientContent, 100);
            });
        });
    });
    
    async function loadClientContent() {
        const editor = document.getElementById('client-editor');
        const saveButton = document.getElementById('save-client-content');
        
        if (!editor) return;
        
        editor.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i><p class="text-gray-500">Loading content...</p></div>';
        saveButton.disabled = true;
        
        try {
            const response = await fetch(`/api/github/get_content.php?client=${currentClient}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to load content');
            }
            
            currentContent = result.data;
            currentSha = result.sha;
            
            renderEditor(currentContent);
            saveButton.disabled = false;
            
        } catch (error) {
            editor.innerHTML = `
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
    
    function renderEditor(content) {
        const editor = document.getElementById('client-editor');
        
        if (!content) {
            editor.innerHTML = '<p class="text-gray-500">No content available</p>';
            return;
        }
        
        let html = `
            <div class="space-y-6">
                <!-- Site Info -->
                <div class="border border-gray-200 rounded-3xl p-6">
                    <h3 class="text-lg font-medium mb-4">Site Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Site Name</label>
                            <input type="text" data-path="site.name" value="${escapeHtml(content.site?.name || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Phone</label>
                            <input type="text" data-path="site.phone" value="${escapeHtml(content.site?.phone || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" data-path="site.email" value="${escapeHtml(content.site?.email || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Location</label>
                            <input type="text" data-path="site.location" value="${escapeHtml(content.site?.location || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                    </div>
                </div>
                
                <!-- Hero Section -->
                <div class="border border-gray-200 rounded-3xl p-6">
                    <h3 class="text-lg font-medium mb-4">Hero Section</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Title</label>
                            <input type="text" data-path="content.hero.title" value="${escapeHtml(content.content?.hero?.title || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Subtitle</label>
                            <input type="text" data-path="content.hero.subtitle" value="${escapeHtml(content.content?.hero?.subtitle || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Text</label>
                            <textarea data-path="content.hero.text" rows="3" 
                                      class="w-full px-4 py-2 border border-gray-200 rounded-lg">${escapeHtml(content.content?.hero?.text || '')}</textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Primary CTA Text</label>
                                <input type="text" data-path="content.hero.cta.primary.text" value="${escapeHtml(content.content?.hero?.cta?.primary?.text || '')}" 
                                       class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Secondary CTA Text</label>
                                <input type="text" data-path="content.hero.cta.secondary.text" value="${escapeHtml(content.content?.hero?.cta?.secondary?.text || '')}" 
                                       class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Styles -->
                <div class="border border-gray-200 rounded-3xl p-6">
                    <h3 class="text-lg font-medium mb-4">Colors</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Primary Color</label>
                            <div class="flex items-center space-x-2">
                                <input type="color" data-path="styles.colors.primary" value="${content.styles?.colors?.primary || '#000000'}" 
                                       class="w-16 h-10 border border-gray-200 rounded-lg">
                                <input type="text" data-path="styles.colors.primary" value="${content.styles?.colors?.primary || '#000000'}" 
                                       class="flex-1 px-4 py-2 border border-gray-200 rounded-lg">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Accent Color</label>
                            <div class="flex items-center space-x-2">
                                <input type="color" data-path="styles.colors.accent" value="${content.styles?.colors?.accent || '#d4611c'}" 
                                       class="w-16 h-10 border border-gray-200 rounded-lg">
                                <input type="text" data-path="styles.colors.accent" value="${content.styles?.colors?.accent || '#d4611c'}" 
                                       class="flex-1 px-4 py-2 border border-gray-200 rounded-lg">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Images -->
                <div class="border border-gray-200 rounded-3xl p-6">
                    <h3 class="text-lg font-medium mb-4">Images</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Logo Path</label>
                            <input type="text" data-path="images.logo" value="${escapeHtml(content.images?.logo || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Hero Image</label>
                            <input type="text" data-path="images.hero" value="${escapeHtml(content.images?.hero || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Banner Image</label>
                            <input type="text" data-path="images.banner" value="${escapeHtml(content.images?.banner || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Service Area Image</label>
                            <input type="text" data-path="images.serviceArea" value="${escapeHtml(content.images?.serviceArea || '')}" 
                                   class="w-full px-4 py-2 border border-gray-200 rounded-lg">
                        </div>
                    </div>
                </div>
                
                <!-- Advanced: Raw JSON Editor -->
                <div class="border border-gray-200 rounded-3xl p-6">
                    <h3 class="text-lg font-medium mb-4">Advanced: Edit JSON</h3>
                    <textarea id="json-editor" rows="15" 
                              class="w-full px-4 py-2 border border-gray-200 rounded-lg font-mono text-sm">${JSON.stringify(content, null, 2)}</textarea>
                    <p class="text-xs text-gray-500 mt-2">Edit the full JSON structure here. Changes will override form fields above.</p>
                </div>
            </div>
        `;
        
        editor.innerHTML = html;
        
        // Sync color inputs
        editor.querySelectorAll('input[type="color"]').forEach(colorInput => {
            const textInput = editor.querySelector(`input[type="text"][data-path="${colorInput.dataset.path}"]`);
            if (textInput) {
                colorInput.addEventListener('input', () => {
                    textInput.value = colorInput.value;
                });
                textInput.addEventListener('input', () => {
                    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
                        colorInput.value = textInput.value;
                    }
                });
            }
        });
    }
    
    async function saveClientContent() {
        const saveButton = document.getElementById('save-client-content');
        const editor = document.getElementById('client-editor');
        
        if (!currentContent || !currentSha) {
            alert('No content loaded. Please reload the page.');
            return;
        }
        
        // Get updated content from JSON editor if it exists
        const jsonEditor = document.getElementById('json-editor');
        let updatedContent = currentContent;
        
        if (jsonEditor && jsonEditor.value.trim()) {
            try {
                updatedContent = JSON.parse(jsonEditor.value);
            } catch (e) {
                alert('Invalid JSON in editor. Please fix the JSON syntax.');
                return;
            }
        } else {
            // Update from form fields
            editor.querySelectorAll('[data-path]').forEach(field => {
                const path = field.dataset.path.split('.');
                const value = field.type === 'color' ? field.value : field.value;
                
                let obj = updatedContent;
                for (let i = 0; i < path.length - 1; i++) {
                    if (!obj[path[i]]) obj[path[i]] = {};
                    obj = obj[path[i]];
                }
                obj[path[path.length - 1]] = value;
            });
        }
        
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
        
        try {
            const response = await fetch('/api/github/update_content.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client: currentClient,
                    content: updatedContent,
                    sha: currentSha
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to save content');
            }
            
            currentSha = result.sha;
            currentContent = updatedContent;
            
            saveButton.innerHTML = '<i class="fas fa-check mr-2"></i> Saved!';
            saveButton.classList.remove('btn-primary');
            saveButton.classList.add('bg-green-500', 'hover:bg-green-600');
            
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
                saveButton.classList.remove('bg-green-500', 'hover:bg-green-600');
                saveButton.classList.add('btn-primary');
                saveButton.disabled = false;
            }, 2000);
            
        } catch (error) {
            alert('Error saving content: ' + error.message);
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save mr-2"></i> Save Changes';
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Expose load function for manual calls
    window.loadClientContent = loadClientContent;
})();


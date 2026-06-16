// Global state variables
let releaseNotes = [];
let filteredNotes = [];
let currentSelectedNote = null;

// DOM Elements
const notesContainer = document.getElementById('notes-container');
const refreshButton = document.getElementById('refresh-button');
const refreshIcon = document.getElementById('refresh-icon');
const refreshText = document.getElementById('refresh-text');
const searchInput = document.getElementById('search-input');
const feedTitleDisplay = document.getElementById('feed-title-display');
const lastUpdatedTime = document.getElementById('last-updated-time');

// Modal Elements
const tweetModal = document.getElementById('tweet-modal');
const tweetTextarea = document.getElementById('tweet-text');
const tweetCharCount = document.getElementById('tweet-char-count');
const closeModalButton = document.getElementById('close-modal-button');
const cancelTweetButton = document.getElementById('cancel-tweet-button');
const publishTweetButton = document.getElementById('publish-tweet-button');
const toastContainer = document.getElementById('toast-container');

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    fetchReleaseNotes();
    
    // Set up event listeners
    refreshButton.addEventListener('click', fetchReleaseNotes);
    searchInput.addEventListener('input', handleSearch);
    
    // Modal listeners
    closeModalButton.addEventListener('click', closeTweetModal);
    cancelTweetButton.addEventListener('click', closeTweetModal);
    publishTweetButton.addEventListener('click', executeTweet);
    tweetTextarea.addEventListener('input', updateCharCount);
    
    // Close modal if clicking outside the modal content
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });
});

/**
 * Fetch release notes from backend API
 */
async function fetchReleaseNotes() {
    // Set loading state
    setLoadingState(true);
    
    try {
        const response = await fetch('/api/release-notes');
        const data = await response.json();
        
        if (data.status === 'success') {
            releaseNotes = data.notes;
            filteredNotes = [...releaseNotes];
            
            // Update UI headers
            feedTitleDisplay.textContent = data.feed_title;
            const now = new Date();
            lastUpdatedTime.textContent = `Last Synced: Today at ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}`;
            
            // Render notes
            renderNotes(filteredNotes);
            showToast('Release notes synced successfully!');
        } else {
            showToast(data.message || 'Failed to update release notes', 'error');
            renderErrorState(data.message);
        }
    } catch (error) {
        console.error('Error fetching release notes:', error);
        showToast('Network error: Unable to fetch release notes.', 'error');
        renderErrorState('Network error occurred while fetching the release notes. Please check if the Flask server is running.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handle loading UI transitions
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        refreshButton.classList.add('loading');
        refreshButton.disabled = true;
        refreshIcon.style.animation = 'spin 1s linear infinite';
        refreshText.textContent = 'Syncing...';
        
        // If empty, show skeleton loader
        if (releaseNotes.length === 0) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg class="animate-spin" viewBox="0 0 24 24" width="36" height="36" style="animation: spin 1s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke="var(--accent-cyan)" stroke-width="3" fill="none" stroke-dasharray="40 20"></circle>
                    </svg>
                    <h3>Syncing updates...</h3>
                    <p>Connecting to Google Cloud feed...</p>
                </div>
            `;
        }
    } else {
        refreshButton.classList.remove('loading');
        refreshButton.disabled = false;
        refreshIcon.style.animation = 'none';
        refreshText.textContent = 'Sync Notes';
    }
}

/**
 * Detect the update category based on titles or tags
 */
function detectCategory(title, content) {
    const rawText = `${title} ${content}`.toLowerCase();
    
    if (rawText.includes('feature') || rawText.includes('new feature') || rawText.includes('introduce')) {
        return { name: 'feature', label: 'Feature' };
    } else if (rawText.includes('deprecated') || rawText.includes('deprecation') || rawText.includes('remove')) {
        return { name: 'deprecated', label: 'Deprecated' };
    } else if (rawText.includes('change') || rawText.includes('updated') || rawText.includes('modified') || rawText.includes('fix')) {
        return { name: 'changed', label: 'Changed' };
    } else {
        return { name: 'general', label: 'Update' };
    }
}

/**
 * Format timestamp nicely
 */
function formatDate(dateStr) {
    if (!dateStr) return 'Recent';
    try {
        const date = new Date(dateStr);
        // Returns e.g., "Jun 16, 2026"
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Render notes to container
 */
function renderNotes(notes) {
    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3>No updates found</h3>
                <p>Try adjusting your search query or sync the notes again.</p>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = '';
    
    notes.forEach((note, index) => {
        const category = detectCategory(note.title, note.content);
        const card = document.createElement('article');
        card.className = 'note-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Clean and prepare the content
        // Note: Flask serves this safely, we will display it as HTML directly as Google RSS contains formatted HTML
        
        card.innerHTML = `
            <div class="note-card-header">
                <div class="note-title-group">
                    <div class="note-meta">
                        <span class="note-date-badge">${formatDate(note.updated)}</span>
                        <span class="note-category-badge cat-${category.name}">${category.label}</span>
                    </div>
                    <h2 class="note-title">${note.title}</h2>
                </div>
            </div>
            <div class="note-content">
                ${note.content}
            </div>
            <div class="note-actions">
                <button class="btn btn-primary btn-tweet" data-id="${note.id}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Tweet This</span>
                </button>
                <button class="btn btn-secondary btn-copy" data-id="${note.id}">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Text</span>
                </button>
                <a class="btn btn-secondary" href="${note.link}" target="_blank" rel="noopener noreferrer">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View Official Docs</span>
                </a>
            </div>
        `;
        
        // Add event listeners inside cards
        card.querySelector('.btn-tweet').addEventListener('click', () => openTweetModal(note));
        card.querySelector('.btn-copy').addEventListener('click', () => copyNoteToClipboard(note));
        
        notesContainer.appendChild(card);
    });
}

/**
 * Handle search filtering
 */
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        filteredNotes = [...releaseNotes];
    } else {
        filteredNotes = releaseNotes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(query);
            const contentMatch = note.content.toLowerCase().includes(query);
            const dateMatch = formatDate(note.updated).toLowerCase().includes(query);
            return titleMatch || contentMatch || dateMatch;
        });
    }
    renderNotes(filteredNotes);
}

/**
 * Copy release note details to clipboard
 */
function copyNoteToClipboard(note) {
    // Strip HTML tags from content for plain text copy
    const tempElement = document.createElement('div');
    tempElement.innerHTML = note.content;
    const plainTextContent = tempElement.textContent || tempElement.innerText || "";
    
    const formattedText = `BigQuery Update: ${note.title}\nDate: ${formatDate(note.updated)}\n\n${plainTextContent.substring(0, 500)}...\n\nRead more: ${note.link}`;
    
    navigator.clipboard.writeText(formattedText).then(() => {
        showToast('Update details copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

/**
 * Open the Tweet composer modal
 */
function openTweetModal(note) {
    currentSelectedNote = note;
    
    // Strip HTML from note content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = note.content;
    const plainTextContent = (tempElement.textContent || tempElement.innerText || "")
        .replace(/\s+/g, ' ')
        .trim();
        
    // Structure a compelling tweet
    const introText = `🚀 BigQuery Update: "${note.title}"\n\n`;
    const outroText = `\n\nRead more: ${note.link} #BigQuery #GCP`;
    
    // Calculate how much content we can fit (X tweet max length is 280)
    const availableLength = 280 - introText.length - outroText.length;
    let snippet = plainTextContent;
    if (snippet.length > availableLength) {
        snippet = snippet.substring(0, availableLength - 3) + '...';
    }
    
    const tweetPayload = `${introText}${snippet}${outroText}`;
    
    // Populate textarea and open modal
    tweetTextarea.value = tweetPayload;
    tweetModal.classList.add('active');
    updateCharCount();
}

/**
 * Close Tweet Modal
 */
function closeTweetModal() {
    tweetModal.classList.remove('active');
    currentSelectedNote = null;
}

/**
 * Update remaining character count with color coding
 */
function updateCharCount() {
    const remaining = 280 - tweetTextarea.value.length;
    tweetCharCount.textContent = `${remaining} characters remaining`;
    
    tweetCharCount.className = 'tweet-counter';
    if (remaining < 0) {
        tweetCharCount.classList.add('error');
        publishTweetButton.disabled = true;
    } else if (remaining < 40) {
        tweetCharCount.classList.add('warning');
        publishTweetButton.disabled = false;
    } else {
        publishTweetButton.disabled = false;
    }
}

/**
 * Redirect to X (Twitter) with tweet intent
 */
function executeTweet() {
    const text = tweetTextarea.value;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    closeTweetModal();
    showToast('Redirected to X (Twitter) composer!');
}

/**
 * Show Toast notifications
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    // Custom check/alert icons
    const icon = type === 'success' 
        ? `<svg width="18" height="18" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        : `<svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
        
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Automatically remove after 3.5 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Render error state to UI
 */
function renderErrorState(message) {
    notesContainer.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3>Sync Failed</h3>
            <p>${message || 'Could not load release notes.'}</p>
            <button class="btn btn-primary" style="margin-top: 1rem;" onclick="fetchReleaseNotes()">Try Again</button>
        </div>
    `;
}

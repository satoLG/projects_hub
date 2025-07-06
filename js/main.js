function filterList() {
    const input = document.getElementById('inputField').value.toLowerCase();
    const items = document.querySelectorAll('#suggestionsList li');
    let visibleIndex = 0;
    
    items.forEach(item => {
        const isVisible = item.textContent.toLowerCase().includes(input);
        
        if (isVisible) {
            item.style.display = '';
            // Re-trigger animation for filtered items
            item.style.animation = 'none';
            item.style.transform = 'scale(0.3)';
            item.style.opacity = '0';
            
            // Force reflow
            item.offsetHeight;
            
            setTimeout(() => {
                item.style.animation = `popIn 0.4s ease-out forwards`;
                item.style.animationDelay = `${(visibleIndex + 1) * 0.1}s`;
            }, 50);
            
            visibleIndex++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Reinitialize 3D effect after filtering
    setTimeout(() => {
        reinit3DCardEffect();
    }, 1000); // Increased delay to ensure animations are complete
}

function toggleMode() {
    const body = document.body;
    const modeToggle = document.getElementById('modeToggle');
    const slider = modeToggle.nextElementSibling;
    const homeBtn = document.getElementById('homeIcon');

    if (homeBtn) {
        homeBtn.classList.toggle('dark');
        homeBtn.src = homeBtn.classList.contains('dark') ? './img/dark_home.png' : './img/home.png';
    }

    body.classList.toggle('dark');
    slider.classList.toggle('checked');
}

function toggleView() {
    const list = document.getElementById('suggestionsList');
    const viewToggle = document.getElementById('viewToggle');
    const slider = viewToggle.nextElementSibling;
    
    // Don't animate if returning from iframe
    if (window.isReturningFromIframe) {
        if (list.classList.contains('list-view')) {
            list.classList.remove('list-view');
            list.classList.add('grid-view');
            slider.classList.add('checked');
        } else {
            list.classList.remove('grid-view');
            list.classList.add('list-view');
            slider.classList.remove('checked');
        }
        return;
    }
    
    // Add transition class to prevent animation on initial load
    list.classList.add('transitioning');
    
    if (list.classList.contains('list-view')) {
        list.classList.remove('list-view');
        list.classList.add('grid-view');
        slider.classList.add('checked');
    } else {
        list.classList.remove('grid-view');
        list.classList.add('list-view');
        slider.classList.remove('checked');
    }
    
    // Re-trigger animations
    const items = list.querySelectorAll('li');
    items.forEach((item, index) => {
        item.style.animation = 'none';
        item.style.transform = 'scale(0.3)';
        item.style.opacity = '0';
        
        // Force reflow
        item.offsetHeight;
        
        // Re-apply animation with delay
        setTimeout(() => {
            item.style.animation = `popIn 0.4s ease-out forwards`;
            item.style.animationDelay = `${(index + 1) * 0.1}s`;
        }, 50);
    });
    
    // Remove transition class after animations
    setTimeout(() => {
        list.classList.remove('transitioning');
        // Reinitialize 3D effect after view toggle
        reinit3DCardEffect();
    }, 1000);
}

function openInIframe(event, url, icon, label) {
    event.preventDefault();
    
    // Get the clicked item
    const clickedItem = event.target.closest('li');
    const itemRect = clickedItem.getBoundingClientRect();
    const headerRect = document.querySelector('.header').getBoundingClientRect();
    const headerBottom = headerRect.bottom;
    
    // Set CSS variable for header height using precise positioning
    document.documentElement.style.setProperty('--header-height', headerBottom + 'px');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-expanding-overlay';
    document.body.appendChild(overlay);
    
    // Clone the item for animation
    const clone = clickedItem.cloneNode(true);
    clone.className = 'expanding-card';
    clone.style.position = 'fixed';
    clone.style.top = itemRect.top + 'px';
    clone.style.left = itemRect.left + 'px';
    clone.style.width = itemRect.width + 'px';
    clone.style.height = itemRect.height + 'px';
    clone.style.background = getComputedStyle(clickedItem).background;
    clone.style.borderRadius = getComputedStyle(clickedItem).borderRadius;
    clone.style.zIndex = '999';
    document.body.appendChild(clone);
    
    // Show overlay
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 50);
    
    // Start fading out other elements
    setTimeout(() => {
        document.getElementById('suggestionsList').style.opacity = '0';
        document.querySelector('.search-bar').style.opacity = '0';
    }, 100);
    
    // Animate the clone to full size
    setTimeout(() => {
        // Use getBoundingClientRect for more precise positioning
        const headerRect = document.querySelector('.header').getBoundingClientRect();
        const topPosition = headerRect.bottom; // Use bottom of header to avoid any shadow overlap
        
        clone.style.top = topPosition + 'px';
        clone.style.left = '0px';
        clone.style.width = '100vw';
        clone.style.height = `calc(100vh - ${topPosition}px)`;
        clone.style.borderRadius = '0px';
        clone.classList.add('expanding');
    }, 150);
    
    // Hide original item after clone starts expanding
    setTimeout(() => {
        clickedItem.style.opacity = '0';
    }, 200);
    
    // After animation, show iframe and cleanup
    setTimeout(() => {
        document.getElementById('suggestionsList').style.display = 'none';
        document.querySelector('.search-bar').style.display = 'none';
        document.getElementById('iframeContainer').style.display = 'block';
        document.getElementById('projectIframe').src = url;
        
        // Cleanup
        clone.remove();
        overlay.remove();
        clickedItem.style.opacity = '';
        
        // Update title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = label;
        
        // Store which item was clicked for reverse animation
        window.lastClickedItem = clickedItem;
        window.lastClickedItemRect = itemRect;
        window.isReturningFromIframe = false;
    }, 750);
}

function closeIframe() {
    const headerRect = document.querySelector('.header').getBoundingClientRect();
    const headerBottom = headerRect.bottom;
    const iframe = document.getElementById('projectIframe');
    const iframeContainer = document.getElementById('iframeContainer');
    
    // Set flag to prevent pop-in animations
    window.isReturningFromIframe = true;
    
    if (window.lastClickedItem && window.lastClickedItemRect) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'card-expanding-overlay visible';
        document.body.appendChild(overlay);
        
        // Create a clone of the iframe area
        const clone = document.createElement('div');
        clone.className = 'expanding-card expanding';
        clone.style.position = 'fixed';
        clone.style.top = headerBottom + 'px';
        clone.style.left = '0px';
        clone.style.width = '100vw';
        clone.style.height = `calc(100vh - ${headerBottom}px)`;
        clone.style.background = getComputedStyle(window.lastClickedItem).background;
        clone.style.borderRadius = '0px';
        clone.style.zIndex = '999';
        document.body.appendChild(clone);
        
        // Hide iframe
        iframeContainer.style.display = 'none';
        
        // Animate back to original position
        setTimeout(() => {
            clone.style.top = window.lastClickedItemRect.top + 'px';
            clone.style.left = window.lastClickedItemRect.left + 'px';
            clone.style.width = window.lastClickedItemRect.width + 'px';
            clone.style.height = window.lastClickedItemRect.height + 'px';
            clone.style.borderRadius = '14px';
            clone.classList.remove('expanding');
            overlay.classList.remove('visible');
        }, 50);
        
        // After animation, show original content without pop-in animations
        setTimeout(() => {
            // Disable animations temporarily
            const items = document.querySelectorAll('#suggestionsList li');
            items.forEach(item => {
                item.style.animation = 'none';
                item.style.transform = 'scale(1)';
                item.style.opacity = '1';
            });
            
            document.getElementById('suggestionsList').style.display = '';
            document.querySelector('.search-bar').style.display = '';
            document.getElementById('suggestionsList').style.opacity = '';
            document.querySelector('.search-bar').style.opacity = '';
            iframe.src = '';
            
            // Cleanup
            clone.remove();
            overlay.remove();
            
            // Restore title
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.textContent = "sato_hub";
            
            // Clear stored item and reset flag
            window.lastClickedItem = null;
            window.lastClickedItemRect = null;
            
            // Reset animation flag after a brief delay
            setTimeout(() => {
                window.isReturningFromIframe = false;
            }, 100);
        }, 650);
    } else {
        // Fallback to immediate close if no stored item
        window.isReturningFromIframe = true;
        iframeContainer.style.display = 'none';
        
        // Disable animations for immediate show
        const items = document.querySelectorAll('#suggestionsList li');
        items.forEach(item => {
            item.style.animation = 'none';
            item.style.transform = 'scale(1)';
            item.style.opacity = '1';
        });
        
        document.getElementById('suggestionsList').style.display = '';
        document.querySelector('.search-bar').style.display = '';
        iframe.src = '';
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = "sato_hub";
        
        // Reset flag
        setTimeout(() => {
            window.isReturningFromIframe = false;
        }, 100);
    }
}

// 3D Card Tilt Effect
function init3DCardEffect() {
    const cards = document.querySelectorAll('#suggestionsList li');
    
    cards.forEach(card => {
        // CRITICAL FIX: Remove animation property to prevent CSS transform conflicts
        card.style.animation = 'none';
        card.style.transform = 'scale(1)';
        card.style.opacity = '1';
        
        // Mouse events
        card.addEventListener('mouseenter', handleCardEnter);
        card.addEventListener('mousemove', handleCardMove);
        card.addEventListener('mouseleave', handleCardLeave);
        
        // Touch events for mobile
        card.addEventListener('touchstart', handleCardTouchStart);
        card.addEventListener('touchmove', handleCardTouchMove);
        card.addEventListener('touchend', handleCardTouchEnd);
        
        // Don't prevent default on touchstart - let clicks work normally
        // Only prevent default during touchmove to prevent scrolling while interacting
        
        console.log('3D effect initialized for card:', card);
    });
}

function handleCardEnter(e) {
    const card = e.currentTarget;
    // Apply hover background and shadow immediately
    card.style.background = 'var(--item-hover)';
    card.style.boxShadow = 'var(--card-hover-shadow)';
}

function handleCardMove(e) {
    const card = e.currentTarget;
    apply3DEffect(card, e.clientX, e.clientY);
}

function handleCardLeave(e) {
    const card = e.currentTarget;
    resetCard(card);
}

function handleCardTouchStart(e) {
    const card = e.currentTarget;
    // Don't prevent default - allow clicks to work
    
    // Apply hover effects
    card.style.background = 'var(--item-hover)';
    card.style.boxShadow = 'var(--card-hover-shadow)';
    
    // Apply 3D effect from touch position
    const touch = e.touches[0];
    apply3DEffect(card, touch.clientX, touch.clientY);
}

function handleCardTouchMove(e) {
    // Only prevent default if user is actually moving (not just tapping)
    if (e.touches.length === 1) {
        e.preventDefault(); // Prevent scrolling during 3D interaction
    }
    const card = e.currentTarget;
    const touch = e.touches[0];
    apply3DEffect(card, touch.clientX, touch.clientY);
}

function handleCardTouchEnd(e) {
    const card = e.currentTarget;
    resetCard(card);
}

function apply3DEffect(card, clientX, clientY) {
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse/touch position relative to card (0 to 1)
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    
    // Convert to -1 to 1 range and calculate tilt
    const tiltX = (y - 0.5) * -15; // Max 7.5 degrees tilt
    const tiltY = (x - 0.5) * 15;
    
    // CRITICAL: Force override any CSS animations/transitions for transform
    card.style.animation = 'none';
    card.style.transition = 'background 0.3s ease, box-shadow 0.3s ease';
    
    // Use setProperty with priority to override CSS
    card.style.setProperty('transform', `scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, 'important');
    
    // Create shine effect
    const shineX = x * 100;
    const shineY = y * 100;
    
    card.style.background = `
        radial-gradient(circle at ${shineX}% ${shineY}%, 
            rgba(255,255,255,0.2) 0%, 
            rgba(255,255,255,0.05) 40%, 
            transparent 70%), 
        var(--item-hover)
    `;
    
    console.log('Applied 3D effect:', `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`);
}

function resetCard(card) {
    // Smooth transition back
    card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Reset to original state - use setProperty to override any CSS
    card.style.setProperty('transform', 'scale(1) rotateX(0deg) rotateY(0deg)', 'important');
    card.style.background = 'var(--item-bg)';
    card.style.boxShadow = 'var(--card-shadow)';
}

// Reinitialize 3D effect when cards are filtered or view is toggled
function reinit3DCardEffect() {
    // Remove existing listeners to prevent duplicates
    const cards = document.querySelectorAll('#suggestionsList li');
    cards.forEach(card => {
        // Remove mouse events
        card.removeEventListener('mouseenter', handleCardEnter);
        card.removeEventListener('mousemove', handleCardMove);
        card.removeEventListener('mouseleave', handleCardLeave);
        
        // Remove touch events
        card.removeEventListener('touchstart', handleCardTouchStart);
        card.removeEventListener('touchmove', handleCardTouchMove);
        card.removeEventListener('touchend', handleCardTouchEnd);
    });
    
    // Reinitialize
    init3DCardEffect();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Multiple initialization strategies to guarantee it works
    
    // Strategy 1: Try after a safe timeout (guaranteed to work)
    setTimeout(() => {
        console.log('Initializing 3D effects with safe timeout');
        init3DCardEffect();
    }, 2500); // 2.5 seconds should be more than enough
    
    // Strategy 2: Also try when animations complete (if faster)
    waitForInitialAnimations().then(() => {
        console.log('Animations completed, reinitializing 3D effects');
        reinit3DCardEffect(); // Use reinit to clean up any existing listeners
    });
    
    // Strategy 3: Extra safety net - try again after window load
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('Window loaded, final 3D effects initialization');
            reinit3DCardEffect();
        }, 500);
    });
});

// Function to wait for all initial card animations to complete
function waitForInitialAnimations() {
    return new Promise((resolve) => {
        const cards = document.querySelectorAll('#suggestionsList li');
        let completedAnimations = 0;
        
        // If no cards, resolve immediately
        if (cards.length === 0) {
            resolve();
            return;
        }
        
        // Listen for animation end events on each card
        cards.forEach((card, index) => {
            const onAnimationEnd = () => {
                completedAnimations++;
                card.removeEventListener('animationend', onAnimationEnd);
                
                // When all animations are complete, resolve
                if (completedAnimations === cards.length) {
                    // Add a small delay to ensure everything is settled
                    setTimeout(resolve, 100);
                }
            };
            
            card.addEventListener('animationend', onAnimationEnd);
        });
        
        // Shorter fallback since we have the main timeout
        setTimeout(() => {
            console.log('Animation fallback timeout reached');
            resolve();
        }, 2000);
    });
}

// Initialize header height CSS variable
function updateHeaderHeight() {
    const header = document.querySelector('.header');
    if (header) {
        const headerRect = header.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        document.documentElement.style.setProperty('--header-height', headerBottom + 'px');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    updateHeaderHeight();
    
    // Update header height on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeaderHeight, 100);
    });
});

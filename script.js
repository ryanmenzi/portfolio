// Protect images from being downloaded
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.window-content')) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.window-content')) {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('selectstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.window-content')) {
        e.preventDefault();
        return false;
    }
});

// Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    // Disable Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Overlay effect for sections
const projectsSection = document.querySelector('.projects-section');
const bottomSection = document.querySelector('.bottom-section');
const aboutLink = document.querySelector('.nav-menu a[href="#about"]');
const projectsLink = document.querySelector('.nav-menu a[href="#projects"]');
const headerNav = document.querySelector('.header-nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

if (bottomSection) {
    // Reveal Projects section
    function revealProjectsSection() {
        if (projectsSection && !projectsSection.classList.contains('revealed')) {
            projectsSection.classList.add('revealed');
            document.body.classList.add('projects-revealed');
            if (projectsLink) {
                projectsLink.style.opacity = '1';
            }
        }
    }

    // Hide Projects section
    function hideProjectsSection() {
        if (projectsSection && projectsSection.classList.contains('revealed')) {
            projectsSection.classList.remove('revealed');
            document.body.classList.remove('projects-revealed');
            if (projectsLink) {
                projectsLink.style.opacity = '0.8';
            }
        }
    }

    // Reveal About section
    function revealAboutSection() {
        if (!bottomSection.classList.contains('revealed')) {
            bottomSection.classList.add('revealed');
            document.body.classList.add('about-revealed');
            if (aboutLink) {
                aboutLink.style.opacity = '1';
            }
        }
    }

    // Hide About section (go back to top)
    function hideAboutSection() {
        if (bottomSection.classList.contains('revealed')) {
            bottomSection.classList.remove('revealed');
            document.body.classList.remove('about-revealed');
            if (aboutLink) {
                aboutLink.style.opacity = '0.8';
            }
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Combined scroll handler - throttled for performance
    let scrollTimeout;
    let lastScrollTime = 0;
    const scrollThrottle = 16; // ~60fps
    
    const handleScroll = () => {
        const now = Date.now();
        if (now - lastScrollTime < scrollThrottle) {
            return;
        }
        lastScrollTime = now;
        
        const scrollPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        
        // Handle About section reveal/hide (comes first at 100vh)
        if (scrollPosition > 100 && scrollPosition < viewportHeight * 1.8) {
            if (!bottomSection.classList.contains('revealed')) {
                revealAboutSection();
            }
            if (projectsSection && projectsSection.classList.contains('revealed')) {
                hideProjectsSection();
            }
        }
        // Handle Projects section reveal/hide (comes second at 200vh)
        else if (scrollPosition >= viewportHeight * 1.8) {
            if (projectsSection && !projectsSection.classList.contains('revealed')) {
                revealProjectsSection();
            }
        } else if (scrollPosition < 50) {
            if (bottomSection.classList.contains('revealed')) {
                hideAboutSection();
            }
            if (projectsSection && projectsSection.classList.contains('revealed')) {
                hideProjectsSection();
            }
        }
        
        // Update active nav link - debounced
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollPosition >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href').substring(1);
                if (href === current) {
                    link.style.opacity = '1';
                } else {
                    link.style.opacity = '0.8';
                }
            });
        }, 100);
    };
    
    // Throttled scroll progress bar update
    let progressTimeout;
    function updateScrollProgress() {
        clearTimeout(progressTimeout);
        progressTimeout = setTimeout(() => {
            const scrollProgress = document.querySelector('.scroll-progress-bar');
            if (scrollProgress) {
                const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = window.pageYOffset || document.documentElement.scrollTop;
                const progress = (scrolled / windowHeight) * 100;
                scrollProgress.style.width = progress + '%';
            }
        }, 16);
    }
    
    window.addEventListener('scroll', () => {
        handleScroll();
        updateScrollProgress();
    }, { passive: true });
    
    // Also trigger on initial load if already scrolled
    handleScroll();
    updateScrollProgress();

    // Trigger on About link click (comes first)
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (bottomSection.classList.contains('revealed')) {
                hideAboutSection();
            } else {
                revealAboutSection();
                if (projectsSection && projectsSection.classList.contains('revealed')) {
                    hideProjectsSection();
                }
            }
        });
    }

    // Trigger on Projects link click (comes second)
    if (projectsLink) {
        projectsLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (projectsSection && projectsSection.classList.contains('revealed')) {
                hideProjectsSection();
            } else {
                revealProjectsSection();
                if (bottomSection.classList.contains('revealed')) {
                    hideAboutSection();
                }
            }
        });
    }

    // Make header clickable to go back
    if (headerNav) {
        headerNav.style.cursor = 'pointer';
        headerNav.addEventListener('click', (e) => {
            // Don't trigger if clicking on the nav link
            if (!e.target.closest('.nav-menu')) {
                hideAboutSection();
                hideProjectsSection();
            }
        });
    }
    
    // Make projects header clickable to go back
    const projectsHeaderNav = document.querySelector('.projects-header-nav');
    if (projectsHeaderNav) {
        projectsHeaderNav.style.cursor = 'pointer';
        projectsHeaderNav.addEventListener('click', (e) => {
            // Don't trigger if clicking on the nav link
            if (!e.target.closest('.projects-nav-menu')) {
                hideProjectsSection();
            }
        });
    }
    
    // Make bottom header clickable to go back
    const bottomHeaderNav = document.querySelector('.bottom-header-nav');
    if (bottomHeaderNav) {
        bottomHeaderNav.style.cursor = 'pointer';
        bottomHeaderNav.addEventListener('click', (e) => {
            // Don't trigger if clicking on the nav link
            if (!e.target.closest('.bottom-nav-menu')) {
                hideAboutSection();
            }
        });
    }
}


// Handle back to portfolio button - navigate to projects section
document.addEventListener('DOMContentLoaded', () => {
    const backButtons = document.querySelectorAll('#back-to-portfolio, .back-link');
    
    backButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const href = button.getAttribute('href');
            
            // Create transition overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--green-dark);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(overlay);
            
            // Animate in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
            
            // Navigate and scroll to projects section
            setTimeout(() => {
                window.location.href = href;
                // After page loads, scroll to projects section
                sessionStorage.setItem('scrollToProjects', 'true');
            }, 500);
        });
    });
    
    // Check if we need to scroll to projects section
    if (sessionStorage.getItem('scrollToProjects') === 'true') {
        sessionStorage.removeItem('scrollToProjects');
        // Wait for page to fully load
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Reveal projects section
                const projectsSection = document.querySelector('.projects-section');
                const bottomSection = document.querySelector('.bottom-section');
                if (projectsSection) {
                    projectsSection.classList.add('revealed');
                    document.body.classList.add('projects-revealed');
                    // Hide about section if it's revealed
                    if (bottomSection && bottomSection.classList.contains('revealed')) {
                        bottomSection.classList.remove('revealed');
                        document.body.classList.remove('about-revealed');
                    }
                }
                // Scroll to projects section (200vh = 2 viewport heights)
                window.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
            }, 200);
        });
        // Also try immediately in case page is already loaded
        setTimeout(() => {
            const projectsSection = document.querySelector('.projects-section');
            const bottomSection = document.querySelector('.bottom-section');
            if (projectsSection) {
                projectsSection.classList.add('revealed');
                document.body.classList.add('projects-revealed');
                if (bottomSection && bottomSection.classList.contains('revealed')) {
                    bottomSection.classList.remove('revealed');
                    document.body.classList.remove('about-revealed');
                }
                window.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
            }
        }, 300);
    }
});

// Page transition animation
document.addEventListener('DOMContentLoaded', () => {
    const projectLinks = document.querySelectorAll('.project-card-link, .project-list-link');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            // Create transition overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--green-dark);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(overlay);
            
            // Animate in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
            
            // Navigate after fade-out completes
            setTimeout(() => {
                sessionStorage.setItem('pageTransitioning', 'true');
                window.location.href = href;
            }, 500);
        });
    });
    
    // Check if we're coming from a transition (check sessionStorage)
    if (sessionStorage.getItem('pageTransitioning') === 'true') {
        // Page is fading in
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
        });
        sessionStorage.removeItem('pageTransitioning');
    }
});

// Greeting typing animation
const greetingText = document.querySelector('.greeting-text');
const typingCursor = document.querySelector('.typing-cursor');

if (greetingText && typingCursor) {
    const languages = JSON.parse(greetingText.getAttribute('data-languages') || '["Hello!"]');
    let currentIndex = 0;
    let isTyping = false;
    let isDeleting = false;
    
    function typeText(text, callback) {
        if (isTyping) return;
        isTyping = true;
        let charIndex = 0;
        
        function typeChar() {
            if (charIndex < text.length) {
                greetingText.textContent = text.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(typeChar, 100); // Typing speed
            } else {
                isTyping = false;
                if (callback) {
                    setTimeout(callback, 2000); // Wait before deleting
                }
            }
        }
        
        typeChar();
    }
    
    function deleteText(callback) {
        if (isDeleting) return;
        isDeleting = true;
        let currentText = greetingText.textContent;
        
        function deleteChar() {
            if (currentText.length > 0) {
                currentText = currentText.substring(0, currentText.length - 1);
                greetingText.textContent = currentText;
                setTimeout(deleteChar, 50); // Deleting speed (faster than typing)
            } else {
                isDeleting = false;
                if (callback) {
                    setTimeout(callback, 300); // Brief pause before typing next
                }
            }
        }
        
        deleteChar();
    }
    
    function cycleGreeting() {
        const currentText = languages[currentIndex];
        
        // Delete current text
        deleteText(() => {
            // Move to next language
            currentIndex = (currentIndex + 1) % languages.length;
            const nextText = languages[currentIndex];
            
            // Type new text
            typeText(nextText, () => {
                // After showing the text, wait then delete and cycle
                setTimeout(() => {
                    cycleGreeting();
                }, 3000); // Show text for 3 seconds
            });
        });
    }
    
    // Initialize with first language
    greetingText.textContent = '';
    setTimeout(() => {
        typeText(languages[0], () => {
            setTimeout(cycleGreeting, 3000);
        });
    }, 500);
}

// Windows window dragging functionality
const windowsWindow = document.querySelector('.windows-window');
const windowTitlebar = document.querySelector('.window-titlebar');

if (windowsWindow && windowTitlebar) {
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;
    let currentOffsetX = 0, currentOffsetY = 0;
    
    const portraitImageWrapper = document.querySelector('.portrait-image-wrapper');
    
    windowTitlebar.addEventListener('mousedown', (e) => {
        isDragging = true;
        windowsWindow.classList.add('dragging');
        windowsWindow.style.animation = 'shake 0.08s infinite';
        
        // Add dragging class to image wrapper for selective grayscale
        if (portraitImageWrapper) {
            portraitImageWrapper.classList.add('dragging');
        }
        
        const rect = windowsWindow.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialX = rect.left;
        initialY = rect.top;
        
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        currentOffsetX = deltaX;
        currentOffsetY = deltaY;
        
        windowsWindow.style.position = 'fixed';
        windowsWindow.style.left = (initialX + deltaX) + 'px';
        windowsWindow.style.top = (initialY + deltaY) + 'px';
        windowsWindow.style.zIndex = '1000';
    });
    
    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        windowsWindow.classList.remove('dragging');
        windowsWindow.style.animation = '';
        windowsWindow.style.zIndex = '';
        
        // Remove dragging class from image wrapper
        if (portraitImageWrapper) {
            portraitImageWrapper.classList.remove('dragging');
        }
        
        // Return to original position
        windowsWindow.classList.add('returning');
        windowsWindow.style.setProperty('--current-transform', `translate(${currentOffsetX}px, ${currentOffsetY}px)`);
        windowsWindow.style.transform = `translate(${currentOffsetX}px, ${currentOffsetY}px)`;
        windowsWindow.style.position = '';
        windowsWindow.style.left = '';
        windowsWindow.style.top = '';
        
        setTimeout(() => {
            currentOffsetX = 0;
            currentOffsetY = 0;
            windowsWindow.style.transform = '';
            windowsWindow.classList.remove('returning');
            windowsWindow.style.animation = 'portraitFloat 4s ease-in-out infinite';
        }, 500);
    });
}

// Title interaction animations
const portfolioTitle = document.querySelector('.portfolio-title');
const titleLetters = document.querySelectorAll('.portfolio-title .letter');

if (portfolioTitle && titleLetters.length > 0) {
    let isHovering = false;
    
    // Add mouse move parallax effect on individual letters
    portfolioTitle.addEventListener('mousemove', (e) => {
        isHovering = true;
        const rect = portfolioTitle.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        titleLetters.forEach((letter, index) => {
            const letterRect = letter.getBoundingClientRect();
            const letterX = letterRect.left + letterRect.width / 2 - rect.left;
            const letterY = letterRect.top + letterRect.height / 2 - rect.top;
            
            const distanceX = x - letterX;
            const distanceY = y - letterY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const strength = (maxDistance - distance) / maxDistance;
                const moveX = (distanceX / maxDistance) * 15 * strength;
                const moveY = (distanceY / maxDistance) * 15 * strength;
                letter.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + strength * 0.1})`;
            } else {
                letter.style.transform = '';
            }
        });
    });

    portfolioTitle.addEventListener('mouseleave', () => {
        isHovering = false;
        titleLetters.forEach(letter => {
            letter.style.transform = '';
        });
    });

    // Add click animation on individual letters
    portfolioTitle.addEventListener('click', () => {
        titleLetters.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.transform = 'scale(1.2) rotate(5deg)';
                setTimeout(() => {
                    letter.style.transform = '';
                }, 300);
            }, index * 30);
        });
    });
}

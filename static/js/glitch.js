// Glitch effect for "Automata Studio" title
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

function glitchEffect() {
    const title = document.querySelector('.glitch-title');
    if (!title) return;
    
    const originalText = title.getAttribute('data-text');
    let iteration = 0;
    
    const interval = setInterval(() => {
        title.textContent = originalText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * letters.length)];
            })
            .join("");
        
        if (iteration >= originalText.length) {
            clearInterval(interval);
        }
        
        iteration += 1 / 3;
    }, 30);
}

// Run glitch effect on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(glitchEffect, 500);
});

// Run glitch effect on hover
document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.glitch-title');
    if (title) {
        title.addEventListener('mouseenter', glitchEffect);
    }
});

const dot = document.createElement('div');
dot.className = 'cursor-dot';
const follower = document.createElement('div');
follower.className = 'cursor-follower';
document.body.appendChild(dot);
document.body.appendChild(follower);

let mouseX = 0, mouseY = 0;     // Cílová pozice (myš)
let realMouseX = 0, realMouseY = 0; // Skutečná pozice myši (pro reset)
let dotX = 0, dotY = 0;         // Aktuální pozice tečky
let followerX = 0, followerY = 0; // Aktuální pozice následovníka

const dotLerp = 0.4;
const followerLerp = 0.15;

window.addEventListener('mousemove', (e) => {
    realMouseX = e.clientX;
    realMouseY = e.clientY;
    mouseX = realMouseX;
    mouseY = realMouseY;
});

function animate() {
    dotX += (mouseX - dotX) * dotLerp;
    dotY += (mouseY - dotY) * dotLerp;

    followerX += (mouseX - followerX) * followerLerp;
    followerY += (mouseY - followerY) * followerLerp;

    dot.style.transform = `translate(-50%, -50%) translate(${dotX}px, ${dotY}px)`;
    follower.style.transform = `translate(-50%, -50%) translate(${followerX}px, ${followerY}px)`;

    requestAnimationFrame(animate);
}
animate();

// Globální sledování hoveru pro dynamické i statické prvky
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .project-card, .fact-card, .nav-item, .shop-btn, .nav-brand, .auth-tab, .close-modal');
    if (target) {
        follower.classList.add('active');
        dot.style.transform += ' scale(2)';
        dot.style.background = 'var(--accent, #34d399)';
    }
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .project-card, .fact-card, .nav-item, .shop-btn, .nav-brand, .auth-tab, .close-modal');
    if (target) {
        follower.classList.remove('active');
        dot.style.transform = dot.style.transform.replace(' scale(2)', '');
        dot.style.background = 'var(--primary, #10b981)';
        // Resetujeme cíl myši na skutečnou pozici po opuštění magnetického prvku
        mouseX = realMouseX;
        mouseY = realMouseY;
    }
});

// Magnetický efekt přes delegování událostí
document.addEventListener('mousemove', (e) => {
    const target = e.target.closest('a, button, .nav-item, .shop-btn, .close-modal');
    if (target && !target.classList.contains('no-magnetic')) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Přitáhneme pozici kursoru ke středu (0.2 = síla magnetismu)
        mouseX = realMouseX + (centerX - realMouseX) * 0.2;
        mouseY = realMouseY + (centerY - realMouseY) * 0.2;
    } else {
        mouseX = realMouseX;
        mouseY = realMouseY;
    }
});

window.addEventListener('mousedown', () => {
    follower.style.transition = 'width 0.1s, height 0.1s, background 0.1s, border-radius 0.1s';
    follower.style.width = '25px';
    follower.style.height = '25px';
    dot.style.transform += ' scale(0.5)';
});

window.addEventListener('mouseup', () => {
    follower.style.width = '';
    follower.style.height = '';
    dot.style.transform = dot.style.transform.replace(' scale(0.5)', '');
    setTimeout(() => follower.style.transition = '', 100);
});

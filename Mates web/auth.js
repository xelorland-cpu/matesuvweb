document.addEventListener('DOMContentLoaded', () => {
    // 1. Pomocné funkce pro LocalStorage
    const getUsers = () => JSON.parse(localStorage.getItem('mates_users')) || [];
    const saveUser = (user) => {
        const users = getUsers();
        users.push(user);
        localStorage.setItem('mates_users', JSON.stringify(users));
    };
    const updateUser = (email, newPassword) => {
        let users = getUsers();
        users = users.map(u => u.email === email ? { ...u, password: newPassword } : u);
        localStorage.setItem('mates_users', JSON.stringify(users));
    };

    // Validace emailu
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // 2. Vytvoření HTML pro Modal
    const modalHTML = `
        <div class="modal-overlay" id="authModal">
            <div class="auth-modal">
                <button class="close-modal" id="closeAuth">&times;</button>
                <div class="auth-tabs" id="authTabs">
                    <button class="auth-tab active" data-tab="login">Přihlášení</button>
                    <button class="auth-tab" data-tab="register">Registrace</button>
                </div>
                
                <!-- Login Form -->
                <form class="auth-form" id="loginForm">
                    <div class="form-group">
                        <label>Email nebo přezdívka</label>
                        <input type="text" class="form-input" id="loginIdentifier" placeholder="Matescz_" required>
                    </div>
                    <div class="form-group">
                        <label>Heslo</label>
                        <input type="password" class="form-input" id="loginPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="auth-btn">Přihlásit se</button>
                    <a href="#" id="forgotPasswordLink" style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-top: 0.5rem; text-decoration: none;">Zapomněli jste heslo?</a>
                </form>

                <!-- Register Form -->
                <form class="auth-form" id="registerForm" style="display: none;">
                    <div class="form-group">
                        <label>Minecraft přezdívka</label>
                        <input type="text" class="form-input" id="regUsername" placeholder="Matescz_" required>
                    </div>
                    <div class="form-group">
                        <label>Email (musí být platný)</label>
                        <input type="email" class="form-input" id="regEmail" placeholder="tvoje@adresa.cz" required>
                    </div>
                    <div class="form-group">
                        <label>Heslo</label>
                        <input type="password" class="form-input" id="regPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="auth-btn">Vytvořit účet</button>
                </form>

                <!-- Forgot Password Form -->
                <form class="auth-form" id="forgotForm" style="display: none;">
                    <h3 style="text-align: center; margin-bottom: 1rem;">Reset hesla</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; text-align: center;">Zadejte svůj email a my vám pošleme kód k resetování.</p>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-input" id="forgotEmail" placeholder="tvoje@adresa.cz" required>
                    </div>
                    <button type="submit" class="auth-btn">Poslat kód</button>
                    <button type="button" class="auth-btn back-to-login" style="background: rgba(255,255,255,0.05); color: #fff; margin-top: 0.5rem;">Zpět k přihlášení</button>
                </form>

                <!-- Step 2: Code & New Password -->
                <form class="auth-form" id="resetStep2Form" style="display: none;">
                    <h3 style="text-align: center; margin-bottom: 1rem;">Nové heslo</h3>
                    <p style="font-size: 0.85rem; color: var(--primary); margin-bottom: 1rem; text-align: center;">Kód byl odeslán na váš email (použijte 1234).</p>
                    <div class="form-group">
                        <label>Kód z emailu</label>
                        <input type="text" class="form-input" id="resetCode" placeholder="1234" required>
                    </div>
                    <div class="form-group">
                        <label>Nové heslo</label>
                        <input type="password" class="form-input" id="resetNewPassword" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="auth-btn">Změnit heslo</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuth');
    const tabs = document.querySelectorAll('.auth-tab');
    const authTabsContainer = document.getElementById('authTabs');
    const forms = {
        login: document.getElementById('loginForm'),
        register: document.getElementById('registerForm'),
        forgot: document.getElementById('forgotForm'),
        reset2: document.getElementById('resetStep2Form')
    };

    let tempResetEmail = '';

    function openModal(tab = 'login') {
        modal.classList.add('active');
        switchTab(tab);
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function switchTab(tabName) {
        authTabsContainer.style.display = (tabName === 'login' || tabName === 'register') ? 'flex' : 'none';

        Object.keys(forms).forEach(key => forms[key].style.display = 'none');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

        if (tabName === 'login') forms.login.style.display = 'flex';
        else if (tabName === 'register') forms.register.style.display = 'flex';
        else if (tabName === 'forgot') forms.forgot.style.display = 'flex';
        else if (tabName === 'reset2') forms.reset2.style.display = 'flex';
    }

    document.addEventListener('click', (e) => {
        if (e.target.innerText === 'Login' || e.target.classList.contains('login-trigger')) {
            e.preventDefault(); openModal('login');
        }
        if (e.target.innerText === 'Register' || e.target.classList.contains('register-trigger')) {
            e.preventDefault(); openModal('register');
        }
        if (e.target === modal || e.target === closeBtn) closeModal();

        if (e.target.id === 'forgotPasswordLink') {
            e.preventDefault();
            switchTab('forgot');
        }
        if (e.target.classList.contains('back-to-login')) {
            switchTab('login');
        }
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 3. Logika Registrace
    forms.register.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (!isValidEmail(email)) {
            alert('Prosím zadejte platný email!');
            return;
        }

        const users = getUsers();
        if (users.find(u => u.email === email || u.username === username)) {
            alert('Tento email nebo uživatelské jméno již existuje! Prosím přihlašte se.');
            switchTab('login');
            return;
        }

        saveUser({ username, email, password });
        alert('Registrace proběhla úspěšně! Nyní se můžete přihlásit.');
        switchTab('login');
    });

    // 4. Logika Přihlášení
    forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('loginIdentifier').value;
        const password = document.getElementById('loginPassword').value;

        const users = getUsers();
        const user = users.find(u => (u.email === identifier || u.username === identifier) && u.password === password);

        if (user) {
            alert(`Vítej zpět, ${user.username}!`);
            closeModal();
            currentUser = user;
            // Admin kontrola - přidáno smejkalsmejki@gmail.com
            if (user.email === 'smejkalsmejki@gmail.com') {
                currentUser.isAdmin = true;
            }

            // Upravíme navigaci
            document.querySelectorAll('.nav-right .nav-item').forEach(b => {
                if (b.innerText === 'Login' || b.innerText === 'Můj Profil') b.innerText = user.username;
            });
            document.querySelectorAll('.shop-btn').forEach(b => {
                if (b.innerText === 'Register') b.style.display = 'none';
            });
            renderReviews();
        } else {
            alert('Špatné jméno nebo heslo!');
        }
    });

    // 5. Logika Zapomenuté heslo
    forms.forgot.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            alert('Tento email u nás není registrován.');
            return;
        }

        tempResetEmail = email;
        const btn = forms.forgot.querySelector('button');
        btn.innerText = 'Posílám email... ☁️';
        setTimeout(() => {
            btn.innerText = 'Poslat kód';
            switchTab('reset2');
        }, 1500);
    });

    // 6. Logika Reset Step 2
    forms.reset2.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('resetCode').value;
        const newPass = document.getElementById('resetNewPassword').value;

        if (code !== '1234') {
            alert('Špatný kód! Zkuste 1234.');
            return;
        }

        updateUser(tempResetEmail, newPass);
        alert('Heslo bylo úspěšně změněno! Nyní se můžeš přihlásit.');
        switchTab('login');
    });

    // --- SYSTÉM RECENZÍ (Nové) ---
    let currentUser = null;

    // Funkce pro smazání recenze
    window.deleteReview = (index) => {
        if (!confirm('Opravdu chceš tuto recenzi smazat?')) return;
        let reviews = getReviews();
        reviews.splice(index, 1);
        localStorage.setItem('mates_reviews', JSON.stringify(reviews));
        renderReviews();
    };

    const getReviews = () => JSON.parse(localStorage.getItem('mates_reviews')) || [];
    const saveReview = (review) => {
        const reviews = getReviews();
        reviews.unshift(review); // Nová recenze nahoru
        localStorage.setItem('mates_reviews', JSON.stringify(reviews));
    };

    function renderReviews() {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;

        const reviews = getReviews();
        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews reveal active">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3; margin-bottom: 1rem;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">Zatím žádné hodnocení</p>
                    <p style="font-size: 0.9rem; color: rgba(255,255,255,0.2); margin-top: 0.5rem;">Buď první, kdo Mateje ohodnotí!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map((rev, index) => {
            const starsHtml = '⭐'.repeat(rev.rating);
            const isAdmin = currentUser && (currentUser.username === 'Mates' || currentUser.isAdmin || currentUser.email === 'smejkalsmejki@gmail.com');
            const deleteBtn = isAdmin ? `<button class="delete-review-btn" onclick="deleteReview(${index})">Smazat</button>` : '';
            const adminBadge = (rev.username === 'Mates' || rev.email === 'smejkalsmejki@gmail.com') ? '<span class="admin-badge">Admin</span>' : '';

            return `
                <div class="review-card reveal active">
                    ${deleteBtn}
                    <div class="review-user">
                        <div class="review-avatar-placeholder">${rev.username[0].toUpperCase()}</div>
                        <div class="review-meta">
                            <h4>${rev.username} ${adminBadge}</h4>
                            <div style="display: flex; align-items: center; gap: 0.8rem;">
                                <div class="rating-score">${rev.rating}/10</div>
                                <div class="rating-display-stars">${starsHtml}</div>
                            </div>
                        </div>
                    </div>
                    <p class="review-text">"${rev.text}"</p>
                    <div class="review-date">Důvod/Zpráva odeslána: ${rev.date}</div>
                </div>
            `;
        }).join('');
    }

    // --- HUDEBNÍ WIDGET ---
    const songs = [
        { 
            title: 'Gata Only', 
            artist: 'FloyyMenor & Cris MJ', 
            url: 'assets/music/[ MUSIC VIDEO ] FloyyMenor, Cris MJ - Gata Only (1).mp3',
            cover: 'assets/music/gata_only.png'
        },
        { 
            title: 'Peligrosa', 
            artist: 'FloyyMenor', 
            url: 'assets/music/FloyyMenor - Peligrosa (VIDEO OFICIAL).mp3',
            cover: 'assets/music/gata_only.png'
        },
        { 
            title: 'Apaga el Cel', 
            artist: 'FloyyMenor', 
            url: 'assets/music/FloyyMenor - Apaga el Cel.mp3',
            cover: 'assets/music/gata_only.png'
        },
        { 
            title: 'UH AH', 
            artist: 'Felipelblessed', 
            url: 'assets/music/Felipelblessed - UH AH (Video oficial).mp3',
            cover: 'assets/music/gata_only.png'
        },
        { 
            title: 'Me Gustas Tú', 
            artist: 'Manu Chao', 
            url: 'assets/music/Manu Chao - Me Gustas Tu (Official Audio).mp3',
            cover: 'assets/music/me_gustas_tu.png'
        },
        { 
            title: 'Bouřka', 
            artist: 'LBOY', 
            url: 'assets/music/LBOY - Bouřka (OFFICIAL VIDEO).mp3',
            cover: 'assets/music/bourka.png'
        }
    ];

    let audio = new Audio();
    let isPlaying = false;
    let currentSongIdx = 0;

    function injectMusicWidget() {
        const musicHTML = `
            <div class="music-widget">
                <div class="music-main">
                    <div class="music-icon">
                        <img id="songCover" src="${songs[0].cover}" alt="Cover" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="music-info">
                        <h5 id="songTitle">${songs[0].title}</h5>
                        <p id="songStatus">${songs[0].artist}</p>
                    </div>
                    <div class="music-controls-group">
                        <button class="music-skip-btn" id="prevBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path></svg>
                        </button>
                        <button class="music-control-btn" id="playPauseBtn">
                            <svg id="playIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                            <svg id="pauseIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
                        </button>
                        <button class="music-skip-btn" id="nextBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="music-volume-container">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.1" value="0.5">
                    <div class="music-bars" id="musicBars" style="opacity: 0.3;">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', musicHTML);

        const playPauseBtn = document.getElementById('playPauseBtn');
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const volumeSlider = document.getElementById('volumeSlider');
        const musicBars = document.getElementById('musicBars');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        audio.src = songs[currentSongIdx].url;
        audio.volume = 0.5;

        const updateSongUI = () => {
            document.getElementById('songTitle').innerText = songs[currentSongIdx].title;
            document.getElementById('songStatus').innerText = songs[currentSongIdx].artist;
            document.getElementById('songCover').src = songs[currentSongIdx].cover;
            audio.src = songs[currentSongIdx].url;
            if (isPlaying) audio.play();
        };

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                musicBars.style.opacity = '0.3';
            } else {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                musicBars.style.opacity = '1';
            }
            isPlaying = !isPlaying;
        });

        nextBtn.addEventListener('click', () => {
            currentSongIdx = (currentSongIdx + 1) % songs.length;
            updateSongUI();
        });

        prevBtn.addEventListener('click', () => {
            currentSongIdx = (currentSongIdx - 1 + songs.length) % songs.length;
            updateSongUI();
        });

        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });

        audio.addEventListener('ended', () => {
            currentSongIdx = (currentSongIdx + 1) % songs.length;
            updateSongUI();
        });
    }
    injectMusicWidget();

    function updateReviewUI() {
        const section = document.getElementById('reviewSection');
        if (!section) return;

        if (currentUser) {
            section.innerHTML = `
                <div class="review-form-container">
                    <h3>Ohodnoť moji práci</h3>
                    <div class="form-group" style="text-align: center;">
                        <label>Kliknutím vyber počet hvězd (0-10)</label>
                        <div class="star-rating" id="starRating">
                            ${[...Array(10)].map((_, i) => `<span class="star" data-value="${i + 1}">★</span>`).join('')}
                        </div>
                        <div id="ratingText" style="font-weight: 700; color: var(--primary);">Vyberte hodnocení</div>
                    </div>
                    <div class="form-group">
                        <label>Důvod tvého hodnocení</label>
                        <textarea id="reviewText" class="review-textarea" placeholder="Popiš, co se ti líbilo nebo co zlepšit..."></textarea>
                    </div>
                    <button id="submitReview" class="review-submit-btn">Odeslat recenzi</button>
                </div>
            `;

            let selectedRating = 0;
            const stars = document.querySelectorAll('.star');
            const ratingText = document.getElementById('ratingText');

            stars.forEach(star => {
                star.addEventListener('mouseover', () => {
                    const val = parseInt(star.dataset.value);
                    stars.forEach((s, i) => s.classList.toggle('hover', i < val));
                });

                star.addEventListener('mouseout', () => {
                    stars.forEach(s => s.classList.remove('hover'));
                });

                star.addEventListener('click', () => {
                    selectedRating = parseInt(star.dataset.value);
                    stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating));
                    ratingText.innerText = `${selectedRating}/10 - ${getRatingLabel(selectedRating)}`;
                });
            });

            function getRatingLabel(val) {
                if (val >= 10) return "Dokonalost! 💎";
                if (val >= 8) return "Super práce! 🚀";
                if (val >= 6) return "Dobré 👍";
                if (val >= 4) return "Průměr 😐";
                return "Špatné 👎";
            }

            document.getElementById('submitReview').addEventListener('click', () => {
                const text = document.getElementById('reviewText').value;

                if (selectedRating === 0) {
                    alert('Prosím vyber počet hvězdiček!');
                    return;
                }

                if (!text.trim()) {
                    alert('Prosím napiš důvod svého hodnocení!');
                    return;
                }

                const newReview = {
                    username: currentUser.username,
                    rating: selectedRating,
                    text: text,
                    date: new Date().toLocaleDateString('cs-CZ')
                };

                saveReview(newReview);
                alert('Díky! Tvé hodnocení bylo uloženo. 😊');
                renderReviews();
                updateReviewUI();
            });
        }
    }

    // Inicializace recenzí na stránce reviews.html
    renderReviews();

    // Hook do přihlášení pro aktualizaci UI recenzí
    const originalLoginFormSubmit = forms.login.onsubmit;
    forms.login.addEventListener('submit', (e) => {
        // Počkáme chvíli na alert a zavření modalu z předchozího listeneru
        setTimeout(() => {
            const users = getUsers();
            const identifier = document.getElementById('loginIdentifier').value;
            currentUser = users.find(u => u.email === identifier || u.username === identifier);
            if (currentUser) {
                updateReviewUI();
            }
        }, 1600);
    });
});

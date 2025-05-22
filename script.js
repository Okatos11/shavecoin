document.addEventListener('DOMContentLoaded', () => {
    const startPopup = document.getElementById('startPopup');
    const startForm = document.getElementById('startForm');
    const container = document.querySelector('.container');
    const canvas = document.getElementById('hairLayer');
    const ctx = canvas.getContext('2d');
    const baseImage = document.getElementById('baseImage');
    const timeElement = document.getElementById('time');
    const progressElement = document.getElementById('progress');
    const progressBarElement = document.getElementById('progressBar');
    
    let playerNickname = '';
    let startTime = null;
    let isShaving = false;
    let lastSoundPlay = 0;
    let animationFrameId = null;
    let totalPixels = 0;
    let shavedPixels = 0;
    let isComplete = false;
    
    const comments = [
        "Ouch! That tickles! 😅",
        "Almost there, barber! 💪",
        "My face feels so fresh! 😌",
        "You missed a spot! 👀",
        "Smooth operator! 🕺",
        "This is better than my usual barber! 💈",
        "Watch out for the ears! 👂",
        "I'm getting a new look! ✨",
        "Almost as smooth as my crypto gains! 📈",
        "This is oddly satisfying! 😌",
        "My mom will be so proud! 👩",
        "Better than my last shave! 🪒",
        "I can feel the wind on my face! 💨",
        "Almost as smooth as my pickup lines! 😎",
        "This is better than my morning coffee! ☕"
    ];
    
    // Vytvoření audio kontextu
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Zpracování formuláře
    startForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nicknameInput = document.getElementById('nickname');
        playerNickname = nicknameInput.value.trim();
        
        if (playerNickname) {
            // Přehrání zvuku při startu
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Výrazný startovací zvuk
            oscillator.type = 'square'; // Změna na square pro výraznější zvuk
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
            oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.4); // A5
            
            // Hlasitější zvuk
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            
            startPopup.style.display = 'none';
            container.style.display = 'block';
            
            // Inicializace hry
            if (baseImage.complete) {
                resizeCanvas();
            } else {
                baseImage.onload = resizeCanvas;
            }
            
            // Spuštění časovače
            startTime = Date.now();
            updateTimer();
        }
    });
    
    // Funkce pro zobrazení náhodného komentáře
    function showRandomComment() {
        const now = Date.now();
        if (now - lastCommentTime > 5000) { // Komentář každých 5 sekund
            const comment = comments[Math.floor(Math.random() * comments.length)];
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.textContent = comment;
            document.body.appendChild(commentElement);
            
            // Animace komentáře
            setTimeout(() => {
                commentElement.style.opacity = '0';
                commentElement.style.transform = 'translateY(-20px)';
                setTimeout(() => commentElement.remove(), 1000);
            }, 2000);
            
            lastCommentTime = now;
        }
    }
    
    // Funkce pro přehrání zvuku holení
    function playWagmiBeat() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const modulator = audioContext.createOscillator();
        const modulatorGain = audioContext.createGain();

        // Set up main oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        oscillator.connect(gainNode);

        // Set up modulator for vibrato effect
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(5, audioContext.currentTime);
        modulator.connect(modulatorGain);
        modulatorGain.gain.setValueAtTime(10, audioContext.currentTime);
        modulatorGain.connect(oscillator.frequency);

        // Set up gain for volume control
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.connect(audioContext.destination);

        // Start oscillators
        oscillator.start();
        modulator.start();

        // Stop after 0.5 seconds
        setTimeout(() => {
            oscillator.stop();
            modulator.stop();
        }, 500);
    }

    function playShavingSound() {
        const now = Date.now();
        if (now - lastSoundPlay > 100) {
            lastSoundPlay = now;
            // Zobrazit náhodný komentář
            showRandomComment();
        }
    }
    
    // Funkce pro přehrání zvuku dokončení
    function playCompleteSound() {
        // Vytvoření instance SpeechSynthesis
        const speech = new SpeechSynthesisUtterance();
        speech.text = "Just shaved Gainzy";
        speech.volume = 1;
        speech.rate = 0.9; // Mírně pomalejší tempo pro lepší srozumitelnost
        speech.pitch = 1.0; // Standardní tón pro lepší srozumitelnost
        
        // Počkáme na načtení hlasů
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                setVoice(speech);
            });
        } else {
            setVoice(speech);
        }
        
        // Funkce pro nastavení nejlepšího hlasu
        function setVoice(speech) {
            const voices = window.speechSynthesis.getVoices();
            // Preferujeme mužský hlas
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Daniel') || // Britský hlas
                voice.name.includes('Alex') || // Americký hlas
                voice.name.includes('Google UK English Male') || // Google UK hlas
                voice.name.includes('Google US English Male') // Google US hlas
            );
            
            if (preferredVoice) {
                speech.voice = preferredVoice;
            }
            
            // Přehrání hlasu
            window.speechSynthesis.speak(speech);
        }
        
        // Přidání zvuku dokončení
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    // Funkce pro zobrazení leaderboardu
    async function showLeaderboard() {
        // Uložení aktuálního skóre
        const time = (Date.now() - startTime) / 1000;
        const score = {
            nickname: playerNickname,
            time: time.toFixed(1),
            date: new Date().toISOString()
        };
        
        try {
            // Odeslání skóre na server
            const response = await fetch('http://localhost:5000/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(score)
            });
            
            // Získání všech skóre
            const scoresResponse = await fetch('http://localhost:5000/scores');
            const scores = await scoresResponse.json();
            
            // Nastavení stránkování
            const scoresPerPage = 10;
            let currentPage = 1;
            
            function displayScores(page) {
                const startIndex = (page - 1) * scoresPerPage;
                const endIndex = startIndex + scoresPerPage;
                const pageScores = scores.slice(startIndex, endIndex);
                
                const leaderboardHTML = `
                    <div class="popup">
                        <div class="popup-content">
                            <h2>Leaderboard 🏆</h2>
                            <div class="leaderboard">
                                ${pageScores.map((score, index) => {
                                    const nickname = score.nickname || 'Anonymous';
                                    const rank = startIndex + index + 1;
                                    return `
                                        <div class="leaderboard-item">
                                            <span class="rank">#${rank}</span>
                                            <span class="nickname">${nickname}</span>
                                            <span class="time">${score.time}s</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <div class="pagination">
                                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>←</button>
                                <span>Page ${currentPage} of ${Math.ceil(scores.length / scoresPerPage)}</span>
                                <button onclick="changePage(${currentPage + 1})" ${currentPage >= Math.ceil(scores.length / scoresPerPage) ? 'disabled' : ''}>→</button>
                            </div>
                            <div class="share-buttons">
                                <button onclick="location.reload()" class="start-button">Play Again!</button>
                                <a href="https://twitter.com/intent/tweet?text=Gainzy was hairy AF. Not anymore.%0AI trimmed him in ${score.time} seconds. Smoothest ape alive.%0A%0AYour turn 👉 https://www.shavecoin.fun/%0A%0ACA:%0A@Shavecoin" 
                                   target="_blank" 
                                   class="twitter-button">
                                    Share on Twitter 🐦
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                
                // Odstranění starého leaderboardu, pokud existuje
                const oldLeaderboard = document.querySelector('.popup');
                if (oldLeaderboard) {
                    oldLeaderboard.remove();
                }
                
                document.body.insertAdjacentHTML('beforeend', leaderboardHTML);
            }
            
            // Funkce pro změnu stránky
            window.changePage = function(newPage) {
                if (newPage >= 1 && newPage <= Math.ceil(scores.length / scoresPerPage)) {
                    currentPage = newPage;
                    displayScores(currentPage);
                }
            };
            
            // Zobrazení první stránky
            displayScores(currentPage);
            
        } catch (error) {
            console.error('Error saving score:', error);
            alert('Error saving score. Please try again.');
        }
    }
    
    // Funkce pro uložení skóre
    function saveScore() {
        if (!isComplete) {
            isComplete = true;
            playCompleteSound();
            // Zastavení časovače
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            // Zobrazení leaderboardu
            showLeaderboard();
        }
    }
    
    // Nastavení velikosti canvasu podle obrázku
    function resizeCanvas() {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        drawHair();
    }
    
    // Kreslení chlupů
    function drawHair() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Vykreslení růžové vrstvy (kůže)
        ctx.fillStyle = 'rgba(255, 192, 203, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Vytvoření hustého vzoru chlupů
        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const length = Math.random() * 15 + 8;
            const angle = Math.random() * Math.PI * 2;
            
            const curve = Math.random() * 0.3 - 0.15;
            const midX = x + Math.cos(angle) * length * 0.5;
            const midY = y + Math.sin(angle) * length * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                midX + Math.cos(angle + Math.PI/2) * curve * length,
                midY + Math.sin(angle + Math.PI/2) * curve * length,
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            
            // Náhodná barva chlupu (různé odstíny hnědé a černé)
            const hairColor = Math.random() > 0.7 ? 
                `rgba(0, 0, 0, ${Math.random() * 0.2 + 0.3})` : // černé chlupy
                `rgba(101, 67, 33, ${Math.random() * 0.2 + 0.3})`; // hnědé chlupy
            
            ctx.lineWidth = Math.random() * 1.2 + 0.3;
            ctx.strokeStyle = hairColor;
            ctx.stroke();
        }
        
        // Přidání jemného stínování pro 3D efekt
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 192, 203, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 192, 203, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 192, 203, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Počítání celkového počtu pixelů
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        totalPixels = imageData.data.filter((_, i) => i % 4 === 3 && _ > 10).length;
    }
    
    // Aktualizace časovače
    function updateTimer() {
        if (!startTime) return;
        
        const elapsed = Date.now() - startTime;
        const seconds = Math.floor(elapsed / 1000);
        const tenths = Math.floor((elapsed % 1000) / 100);
        timeElement.textContent = `${seconds}.${tenths}s`;
        
        animationFrameId = requestAnimationFrame(updateTimer);
    }
    
    // Aktualizace progresu
    function updateProgress() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const currentPixels = imageData.data.filter((_, i) => i % 4 === 3 && _ > 10).length;
        const progress = Math.round(((totalPixels - currentPixels) / totalPixels) * 100);
        
        // Pokud je progress blízko 100%, nastavíme ho na 100%
        if (progress >= 98) {
            progressElement.textContent = '100%';
            progressBarElement.style.width = '100%';
            if (!isComplete) {
                isComplete = true;
                playCompleteSound();
                // Zastavení časovače
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                // Zobrazení leaderboardu
                showLeaderboard();
            }
        } else {
            progressElement.textContent = `${progress}%`;
            progressBarElement.style.width = `${progress}%`;
        }
    }
    
    // Holení chlupů
    function shaveHair(x, y) {
        const radius = 50;
        
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        updateProgress();
        playShavingSound();
    }
    
    // Event listeners
    canvas.addEventListener('mousedown', (e) => {
        isShaving = true;
        if (!startTime) {
            startTime = Date.now();
            updateTimer();
        }
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        shaveHair(x, y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isShaving) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Přidání interpolace pro plynulejší holení
        const lastX = e.movementX ? x - e.movementX : x;
        const lastY = e.movementY ? y - e.movementY : y;
        
        // Holení v bodech mezi poslední a aktuální pozicí
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const stepX = lastX + (x - lastX) * (i / steps);
            const stepY = lastY + (y - lastY) * (i / steps);
            shaveHair(stepX, stepY);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isShaving = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isShaving = false;
    });
}); 
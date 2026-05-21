document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations
    const cards = document.querySelectorAll('.card, .about-content, .about-image');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(50px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Canvas Video Animation using 73 frames
    const canvas = document.getElementById('hero-video-canvas');
    const ctx = canvas.getContext('2d');
    
    // Total frames is 73
    const frameCount = 73;
    const images = [];
    let imagesLoaded = 0;
    
    // Adjust canvas size to window width and maintain a 16:9 aspect ratio or screen ratio
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Preload images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Format number to 3 digits e.g. 001
        const num = i.toString().padStart(3, '0');
        img.src = `assets/frames/ezgif-frame-${num}.jpg`;
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === frameCount) {
                startAnimation();
            }
        };
        images.push(img);
    }

    let currentFrame = 0;
    let fps = 24;
    let now;
    let then = Date.now();
    let interval = 1000 / fps;
    let delta;

    function drawImageCover(ctx, img, x, y, w, h) {
        if (!img.complete || img.naturalWidth === 0) return;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;
        let renderW, renderH, renderX, renderY;

        if (imgRatio < canvasRatio) {
            renderW = w;
            renderH = w / imgRatio;
            renderX = 0;
            renderY = (h - renderH) / 2;
        } else {
            renderW = h * imgRatio;
            renderH = h;
            renderX = (w - renderW) / 2;
            renderY = 0;
        }
        ctx.drawImage(img, renderX, renderY, renderW, renderH);
    }

    function startAnimation() {
        requestAnimationFrame(render);
    }

    function render() {
        requestAnimationFrame(render);
        
        now = Date.now();
        delta = now - then;
        
        if (delta > interval) {
            then = now - (delta % interval);
            
            // Draw current frame
            if (images[currentFrame]) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawImageCover(ctx, images[currentFrame], 0, 0, canvas.width, canvas.height);
            }
            
            currentFrame = (currentFrame + 1) % frameCount;
        }
    }

    // Modal Logic
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const closeBtn = document.querySelector('.close-modal');

    function openModal(title, bodyHTML, footerHTML) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHTML;
        modalFooter.innerHTML = footerHTML;
        modal.style.display = 'flex';
    }

    window.closeModal = function() {
        modal.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    window.submitOrder = async function(e) {
        e.preventDefault();
        const type = document.getElementById('order-type').value;
        const qty = document.getElementById('order-qty').value;
        const name = document.getElementById('order-name').value;

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, qty, name })
            });
            const data = await res.json();
            modalBody.innerHTML = `<p style="color: #00ff00;">Order placed successfully! Order ID: ${data.id}</p>`;
            modalFooter.innerHTML = `<button class="btn-primary" onclick="closeModal()">Awesome!</button>`;
        } catch (err) {
            modalBody.innerHTML = `<p style="color: red;">Failed to place order. Try again.</p>`;
        }
    };

    // Attach click events to buttons
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const formHTML = `
                <form id="order-form" onsubmit="submitOrder(event)">
                    <div class="form-group">
                        <label>Flavor Type</label>
                        <select id="order-type" required>
                            <option value="Luxury Gold">Luxury Gold</option>
                            <option value="Neon Pop">Neon Pop</option>
                            <option value="Organic Fresh">Organic Fresh</option>
                            <option value="Sub-Zero Chill">Sub-Zero Chill</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="order-qty" min="1" value="1" required>
                    </div>
                    <div class="form-group">
                        <label>Your Name</label>
                        <input type="text" id="order-name" required placeholder="John Doe">
                    </div>
                </form>
            `;
            const footerHTML = `<button type="submit" form="order-form" class="btn-primary">Complete Purchase</button>`;
            openModal('Checkout', formHTML, footerHTML);
        });
    });

    document.querySelectorAll('.watch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal('Full Video', '<p>The cinematic trailer is being edited. In the meantime, enjoy the dynamic hero animation!</p>', '<button class="btn-primary" onclick="closeModal()">Got it!</button>');
        });
    });
});

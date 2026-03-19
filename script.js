/* ============================================================
   script.js – Virtual Gift Box
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────────── */
  const createPage  = document.getElementById('createPage');
  const giftPage    = document.getElementById('giftPage');

  // Create-page elements
  const recipientNameInput = document.getElementById('recipientName');
  const messageInput       = document.getElementById('message');
  const imageUpload        = document.getElementById('imageUpload');
  const uploadArea         = document.getElementById('uploadArea');
  const uploadPlaceholder  = document.getElementById('uploadPlaceholder');
  const imagePreview       = document.getElementById('imagePreview');
  const removeImageBtn     = document.getElementById('removeImage');
  const createBtn          = document.getElementById('createBtn');
  const createError        = document.getElementById('createError');
  const msgCount           = document.getElementById('msgCount');

  // Modal elements
  const shareModal      = document.getElementById('shareModal');
  const closeModal      = document.getElementById('closeModal');
  const shareLink       = document.getElementById('shareLink');
  const copyBtn         = document.getElementById('copyBtn');
  const shareRecipient  = document.getElementById('shareRecipient');
  const whatsappShare   = document.getElementById('whatsappShare');
  const telegramShare   = document.getElementById('telegramShare');
  const previewBtn      = document.getElementById('previewBtn');

  // Gift-view elements
  const giftWrapper       = document.getElementById('giftWrapper');
  const giftBox           = document.getElementById('giftBox');
  const clickHint         = document.getElementById('clickHint');
  const messageCard       = document.getElementById('messageCard');
  const recipientGreeting = document.getElementById('recipientGreeting');
  const cardTo            = document.getElementById('cardTo');
  const cardMessage       = document.getElementById('cardMessage');
  const cardImageWrap     = document.getElementById('cardImageWrap');
  const cardImage         = document.getElementById('cardImage');
  const createOwnBtn      = document.getElementById('createOwnBtn');
  const confettiCanvas    = document.getElementById('confettiCanvas');

  /* ── State ────────────────────────────────────────────────── */
  let uploadedImageDataUrl = null;
  let currentGiftData      = null;
  let confettiAnimId       = null;

  /* ================================================================
     ROUTING — detect gift URL vs create page
     ================================================================ */
  function init() {
    const hash   = window.location.hash.slice(1);   // after #
    const search = new URLSearchParams(window.location.search);
    const giftParam = hash || search.get('gift');

    if (giftParam) {
      showGiftPage(giftParam);
    } else {
      showCreatePage();
    }
  }

  function showCreatePage() {
    createPage.classList.remove('hidden');
    giftPage.classList.add('hidden');
  }

  function showGiftPage(encoded) {
    const data = decodeGift(encoded);
    if (!data) {
      showCreatePage();
      return;
    }
    createPage.classList.add('hidden');
    giftPage.classList.remove('hidden');
    renderGift(data);
  }

  /* ================================================================
     IMAGE UPLOAD
     ================================================================ */
  uploadArea.addEventListener('click', () => imageUpload.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  });

  imageUpload.addEventListener('change', () => {
    if (imageUpload.files[0]) handleImageFile(imageUpload.files[0]);
  });

  removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage();
  });

  function handleImageFile(file) {
    if (file.size > 2 * 1024 * 1024) {
      showError('התמונה גדולה מדי. אנא בחר/י תמונה עד 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageDataUrl = e.target.result;
      imagePreview.src = uploadedImageDataUrl;
      imagePreview.classList.remove('hidden');
      uploadPlaceholder.classList.add('hidden');
      removeImageBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    uploadedImageDataUrl = null;
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
    removeImageBtn.classList.add('hidden');
    imageUpload.value = '';
  }

  /* ── char counter ─────────────────────────────────────────── */
  messageInput.addEventListener('input', () => {
    msgCount.textContent = messageInput.value.length;
  });

  /* ================================================================
     CREATE GIFT
     ================================================================ */
  createBtn.addEventListener('click', () => {
    const name    = recipientNameInput.value.trim();
    const message = messageInput.value.trim();
    const style   = document.querySelector('input[name="boxStyle"]:checked').value;

    if (!name) {
      showError('אנא הכנס/י את שם המקבל/ת');
      recipientNameInput.focus();
      return;
    }
    if (!message) {
      showError('אנא כתוב/י הודעה אישית');
      messageInput.focus();
      return;
    }

    hideError();

    const giftData = { name, message, style };
    if (uploadedImageDataUrl) giftData.image = uploadedImageDataUrl;

    const encoded = encodeGift(giftData);
    const url     = buildShareUrl(encoded);

    currentGiftData = { ...giftData, url };
    openShareModal(currentGiftData);
  });

  /* ================================================================
     ENCODING / DECODING
     ================================================================ */
  function encodeGift(data) {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  }

  function decodeGift(encoded) {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function buildShareUrl(encoded) {
    const base = window.location.origin + window.location.pathname;
    return base + '#' + encoded;
  }

  /* ================================================================
     SHARE MODAL
     ================================================================ */
  function openShareModal(gift) {
    shareRecipient.textContent  = gift.name;
    shareLink.value             = gift.url;

    const msg = `קיבלת מתנה וירטואלית! 🎁 פתח/י כאן: ${gift.url}`;
    whatsappShare.href  = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    telegramShare.href  = `https://t.me/share/url?url=${encodeURIComponent(gift.url)}&text=${encodeURIComponent('קיבלת מתנה וירטואלית! 🎁')}`;

    shareModal.classList.remove('hidden');
    copyBtn.textContent = 'העתק';
    copyBtn.classList.remove('copied');
  }

  closeModal.addEventListener('click', () => shareModal.classList.add('hidden'));

  shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) shareModal.classList.add('hidden');
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shareLink.value).then(() => {
      copyBtn.textContent = '✓ הועתק!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'העתק';
        copyBtn.classList.remove('copied');
      }, 2500);
    }).catch(() => {
      copyBtn.textContent = 'העתק את הלינק ידנית';
      shareLink.select();
    });
  });

  previewBtn.addEventListener('click', () => {
    shareModal.classList.add('hidden');
    if (currentGiftData) {
      const encoded = encodeGift(currentGiftData);
      window.location.hash = encoded;
      showGiftPage(encoded);
    }
  });

  /* ================================================================
     GIFT VIEW / RENDER
     ================================================================ */
  function renderGift(data) {
    // Apply box style
    const boxEl = document.getElementById('giftBox');
    boxEl.classList.add('style-' + data.style);

    // Greeting
    recipientGreeting.textContent = `🎁 ${data.name || ''}, יש לך מתנה!`;

    // Card content
    cardTo.textContent      = `ל${data.name || ''}`;
    cardMessage.textContent = data.message || '';

    if (data.image) {
      cardImage.src = data.image;
      cardImageWrap.classList.remove('hidden');
    }

    // Click to open
    giftWrapper.addEventListener('click', openGiftBox, { once: true });
  }

  function openGiftBox() {
    clickHint.style.opacity = '0';
    clickHint.style.transition = 'opacity 0.3s';

    giftBox.classList.add('open');
    giftBox.style.animation = 'none';

    // Start confetti
    setTimeout(() => {
      launchConfetti();
    }, 400);

    // Show message card
    setTimeout(() => {
      messageCard.classList.remove('hidden');
      clickHint.classList.add('hidden');
    }, 900);
  }

  createOwnBtn.addEventListener('click', () => {
    window.location.href = window.location.origin + window.location.pathname;
  });

  /* ================================================================
     CONFETTI
     ================================================================ */
  function launchConfetti() {
    const canvas = confettiCanvas;
    const ctx    = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#e63946','#ffd166','#06d6a0','#118ab2','#ef476f','#ffc6ff','#a8dadc'];
    const pieces = [];
    const COUNT  = 120;

    // Origin around where the box roughly is (centre of screen)
    const ox = canvas.width  / 2;
    const oy = canvas.height / 2 - 60;

    for (let i = 0; i < COUNT; i++) {
      pieces.push({
        x:      ox,
        y:      oy,
        vx:     (Math.random() - 0.5) * 14,
        vy:     (Math.random() * -14) - 4,
        color:  COLORS[Math.floor(Math.random() * COLORS.length)],
        size:   Math.random() * 8 + 5,
        shape:  Math.random() > 0.5 ? 'rect' : 'circle',
        angle:  Math.random() * Math.PI * 2,
        spin:   (Math.random() - 0.5) * 0.25,
        alpha:  1,
        decay:  Math.random() * 0.012 + 0.005,
      });
    }

    let start = null;
    const DURATION = 4000;

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((p) => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += 0.35;        // gravity
        p.vx    *= 0.98;        // air resistance
        p.angle += p.spin;
        p.alpha -= p.decay;
        if (p.alpha < 0) p.alpha = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (elapsed < DURATION) {
        confettiAnimId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    confettiAnimId = requestAnimationFrame(step);
  }

  /* ================================================================
     HELPERS
     ================================================================ */
  function showError(msg) {
    createError.textContent = msg;
    createError.classList.remove('hidden');
    setTimeout(hideError, 4000);
  }

  function hideError() {
    createError.classList.add('hidden');
  }

  /* Handle resize for confetti canvas */
  window.addEventListener('resize', () => {
    if (confettiCanvas.style.display !== 'none') {
      confettiCanvas.width  = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });

  /* ── boot ─────────────────────────────────────────────────── */
  init();
})();

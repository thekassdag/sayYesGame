// Helper functions for UTF-8 safe Base64 encoding/decoding (Modern)
const encodeData = (data) => {
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
};

const decodeData = (str) => {
    try {
        const binary = atob(str);
        // Try modern TextDecoder first (default UTF-8)
        try {
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const json = new TextDecoder().decode(bytes);
            return JSON.parse(json);
        } catch (e) {
            // Fallback for older formats (Simple JSON or URI-encoded)
            try { return JSON.parse(binary); } catch (e) {}
            try { return JSON.parse(decodeURIComponent(binary)); } catch (e) {}
            try { return JSON.parse(decodeURIComponent(escape(binary))); } catch (e) {}
            return {};
        }
    } catch (e) {
        console.error("Decoding error:", e);
        return {};
    }
};

const urlParams = new URLSearchParams(window.location.search);
let params = Object.fromEntries(urlParams.entries());

// If 'play' param exists, decode it and merge with params
if (params.play) {
    const decoded = decodeData(params.play);
    params = { ...params, ...decoded };
}

const { name: userName = "UserX", gender, question, sucess_msg, lang = 'en' } = params;
console.log(userName, gender, question, sucess_msg, lang);

// Image Pre-loading
const preLoadImages = () => {
    const images = [
        'assets/imgs/romance-6781983.jpg',
        'assets/imgs/yeyesyes.gif'
    ];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};
preLoadImages();

// Mobile Detection
const checkMobile = () => {
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isMobile) {
        document.getElementById('mobile-restriction').classList.remove('hidden');
    }
};
checkMobile();

const texts = {
    am: {
        greeting: `${userName}, ጨዋታው 'እሺ OR እምቢ' ማለት ነው ለቀጣይ ጥያቄ:: <br>እንጀምር?`,
        question: question || "የምትወጂውን Chocolate ገዝቼልሽ, <br>በገንደጄ street walk እናርግ?",
        sucess_msg: sucess_msg || "እሺ እሺ እሺ!! let's go",
        beggining_msg: `${userName}, እሺ በይ!!!(please)`,
        start: 'እንጀምር',
        yes: 'እሺ',
        no: 'እምቢ',
    },
    en: {
        greeting: `${userName}, The game is just saying "Yes OR No" for next question <br>Shall we start?`,
        question: question || "I bought you your favorite Chocolate, <br> and then shall we walk on the street?",
        sucess_msg: sucess_msg || "yes yes yes!! let's go",
        beggining_msg: `${userName}, Please say Yes`,
        start: 'Start',
        yes: 'Yes',
        no: 'No',
    }
}
const text = texts[lang];

// action buttons
const noBtn = document.getElementById('no');
const yesBtn = document.getElementById('yes');
const startBtn = document.getElementById('start');

startBtn.textContent = text.start;
yesBtn.textContent = text.yes;
noBtn.textContent = text.no;

// message text
const msgText = document.getElementById('chat-msg');

// greeting messages
msgText.innerHTML = text.greeting;

// background container
const bgContainer = document.getElementById('bg-container');

// bubble container
const bubbleWrapper = document.getElementById('bubble-wrapper');
const bubbleContainer = document.getElementById('bubble-container');

// dynamic positioning based on gender
if (gender === 'm') {
    // move to opposite side (right)
    bubbleWrapper.classList.remove('justify-center');
    bubbleWrapper.classList.add('justify-end');
}

// controls container
const controls = document.getElementById('controls');

let isNoActive = false;
let isDetached = false;

startBtn.addEventListener("click", function () {
    msgText.innerHTML = text.question;
    this.classList.add('hidden');
    yesBtn.classList.remove('hidden');
    noBtn.classList.remove('hidden');
    isNoActive = true;
    isDetached = false;

    // Initially, it stays inside the flex container (beside Yes)
    noBtn.style.position = 'relative';
    noBtn.style.left = 'auto';
    noBtn.style.top = 'auto';
});

function updateButtonPosition(x, y) {
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
}

function moveButton() {
    if (!isDetached) {
        // First time moving: detach from flex container and move to body
        document.body.appendChild(noBtn);
        noBtn.style.position = 'absolute';
        isDetached = true;
    }

    const padding = 120;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;

    const randomX = Math.max(padding, Math.random() * maxX);
    const randomY = Math.max(padding, Math.random() * maxY);

    updateButtonPosition(randomX, randomY);
    msgText.innerHTML = text.beggining_msg;
}

// Mouse distance monitoring removed to trigger only on direct hover
noBtn.addEventListener('mouseenter', moveButton);

const createOwnBtn = document.getElementById('create-own');

yesBtn.addEventListener("click", () => {
    msgText.textContent = text.sucess_msg;
    // controls.classList.add('hidden'); // We used to hide everything, but now we'll show another button
    yesBtn.classList.add('hidden');
    noBtn.classList.add('hidden');
    createOwnBtn.classList.remove('hidden');

    bgContainer.classList.remove('bg-chat-main');
    bgContainer.classList.add('bg-chat-success');
    isNoActive = false;
});

createOwnBtn.addEventListener('click', () => {
    configModal.classList.remove('hidden');
});

// Modal Logic
const configModal = document.getElementById('config-modal');
const closeModal = document.getElementById('close-modal');
const configForm = document.getElementById('config-form');
const resultContainer = document.getElementById('result-container');
const generatedLinkInput = document.getElementById('generated-link');
const copyBtn = document.getElementById('copy-btn');

closeModal.addEventListener('click', () => {
    configModal.classList.add('hidden');
});

// Show modal if no query parameters
if (!window.location.search) {
    configModal.classList.remove('hidden');
}

configForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const config = {
        name: document.getElementById('input-name').value,
        gender: document.getElementById('input-gender').value,
        lang: document.getElementById('input-lang').value,
        question: document.getElementById('input-question').value,
        sucess_msg: document.getElementById('input-sucess-msg').value
    };

    // Remove empty optional fields
    if (!config.question) delete config.question;
    if (!config.sucess_msg) delete config.sucess_msg;

    const encoded = encodeData(config);
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = `${baseUrl}?play=${encoded}`;

    generatedLinkInput.value = newUrl;
    resultContainer.classList.remove('hidden');
});

copyBtn.addEventListener('click', () => {
    generatedLinkInput.select();
    document.execCommand('copy');

    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.replace('bg-premium', 'bg-green-600');

    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.replace('bg-green-600', 'bg-premium');
    }, 2000);
});
// ==========================================================================
// mostkbal (مستقبل) - Interactive Scripts & Business Logic
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initBusinessHours();
    initMobileNav();
    initScrollSpy();
});

/**
 * Check Saudi Local Business Hours (UTC+3)
 * Working Hours: Sun - Thu, 8:00 AM - 6:00 PM (08:00 - 18:00)
 * Weekend: Friday & Saturday
 */
function initBusinessHours() {
    const statusTextTop = document.getElementById('status-text');
    const statusDotTop = document.querySelector('.status-dot');
    const cardStatusText = document.getElementById('card-status-text');
    const cardLivePill = document.getElementById('card-live-pill');

    if (!statusTextTop) return;

    // Get current time in Saudi Arabia (Asia/Riyadh - UTC+3)
    const options = { timeZone: 'Asia/Riyadh', hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric' };
    const nowInSaudi = new Date();
    
    // We can also extract the day and hour using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Riyadh',
        weekday: 'narrow',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });
    
    // Convert to Saudi time object
    const saudiDateStr = nowInSaudi.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });
    const saudiDate = new Date(saudiDateStr);
    const day = saudiDate.getDay(); // 0 is Sunday, 1 is Monday ... 4 is Thursday, 5 is Friday, 6 is Saturday
    const hours = saudiDate.getHours();
    const minutes = saudiDate.getMinutes();

    // Check if within work days (Sunday to Thursday) and hours (08:00 to 18:00)
    const isWorkDay = (day >= 0 && day <= 4);
    const isOpen = isWorkDay && (hours >= 8 && hours < 18);

    if (isOpen) {
        const remainingHours = 18 - hours;
        statusTextTop.textContent = `متاح الآن لاستقبال طلباتكم (يغلق عند 6:00 م)`;
        if (cardStatusText) {
            cardStatusText.textContent = `مفتوح الآن (دوام رسمي)`;
        }
    } else {
        if (statusDotTop) {
            statusDotTop.classList.add('closed');
        }
        let nextOpen = 'يفتح الأحد 8:00 صباحاً';
        if (day === 4 && hours >= 18) {
            nextOpen = 'عطلة أسبوعية - يفتح الأحد 8:00 ص';
        } else if (day === 5 || day === 6) {
            nextOpen = 'عطلة أسبوعية - يفتح الأحد 8:00 ص';
        } else if (hours < 8) {
            nextOpen = 'يفتح اليوم الساعة 8:00 ص';
        } else {
            nextOpen = 'يفتح غداً الساعة 8:00 ص';
        }

        statusTextTop.textContent = `مغلق حالياً • ${nextOpen}`;
        if (cardStatusText) {
            cardStatusText.textContent = `مغلق حالياً (${nextOpen})`;
        }
        if (cardLivePill) {
            cardLivePill.style.background = '#fef3c7';
            cardLivePill.style.color = '#92400e';
        }
    }
}

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (!mobileBtn || !navMenu) return;

    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });

    // Close menu when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
            navMenu.classList.remove('open');
        }
    });
}

/**
 * Copy to Clipboard with Toast Notification
 */
function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage);
        }).catch(() => {
            fallbackCopy(text, successMessage);
        });
    } else {
        fallbackCopy(text, successMessage);
    }
}

function fallbackCopy(text, successMessage) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(successMessage);
    } catch (err) {
        showToast("يرجى نسخ النص يدوياً: " + text);
    }
    document.body.removeChild(textArea);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

/**
 * Handle Contact Form submission
 * Redirects straight to WhatsApp with formatted inquiry
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('senderName').value.trim();
    const phone = document.getElementById('senderPhone').value.trim();
    const service = document.getElementById('serviceType').value;
    const details = document.getElementById('messageContent').value.trim();

    if (!name || !phone || !details) {
        showToast('يرجى ملء كافة الحقول المطلوبة');
        return;
    }

    const waText = `*طلب تواصل جديد من موقع mostkbal.github.io*
--------------------------------
👤 *الاسم / المنشأة:* ${name}
📱 *رقم الجوال:* ${phone}
💼 *نوع الخدمة:* ${service}
📝 *التفاصيل:* 
${details}
--------------------------------
تم الإرسال عبر الموقع الرسمي: https://mosttkbal.github.io`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/966535292474?text=${encodedText}`;

    showToast('جاري فتح تطبيق واتساب لإرسال رسالتك...');
    setTimeout(() => {
        window.open(waUrl, '_blank');
    }, 800);
}

/**
 * ScrollSpy for Active Navigation Links
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

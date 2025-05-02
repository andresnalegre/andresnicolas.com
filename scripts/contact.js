document.addEventListener('DOMContentLoaded', function() {
    const contactButton = document.createElement('div');
    contactButton.classList.add('floating-contact-btn');
    contactButton.innerHTML = `<svg height="30px" width="30px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M510.678,112.275c-2.308-11.626-7.463-22.265-14.662-31.054c-1.518-1.915-3.104-3.63-4.823-5.345 c-12.755-12.818-30.657-20.814-50.214-20.814H71.021c-19.557,0-37.395,7.996-50.21,20.814c-1.715,1.715-3.301,3.43-4.823,5.345 C8.785,90.009,3.63,100.649,1.386,112.275C0.464,116.762,0,121.399,0,126.087V385.92c0,9.968,2.114,19.55,5.884,28.203 c3.497,8.26,8.653,15.734,14.926,22.001c1.59,1.586,3.169,3.044,4.892,4.494c12.286,10.175,28.145,16.32,45.319,16.32h369.958 c17.18,0,33.108-6.145,45.323-16.384c1.718-1.386,3.305-2.844,4.891-4.43c6.27-6.267,11.425-13.741,14.994-22.001v-0.064 c3.769-8.653,5.812-18.171,5.812-28.138V126.087C512,121.399,511.543,116.762,510.678,112.275z M46.509,101.571 c6.345-6.338,14.866-10.175,24.512-10.175h369.958c9.646,0,18.242,3.837,24.512,10.175c1.122,1.129,2.179,2.387,3.112,3.637 L274.696,274.203c-5.348,4.687-11.954,7.002-18.696,7.002c-6.674,0-13.276-2.315-18.695-7.002L43.472,105.136 C44.33,103.886,45.387,102.7,46.509,101.571z M36.334,385.92V142.735L176.658,265.15L36.405,387.435 C36.334,386.971,36.334,386.449,36.334,385.92z M440.979,420.597H71.021c-6.281,0-12.158-1.651-17.174-4.552l147.978-128.959 l13.815,12.018c11.561,10.046,26.028,15.134,40.36,15.134c14.406,0,28.872-5.088,40.432-15.134l13.808-12.018l147.92,128.959 C453.137,418.946,447.26,420.597,440.979,420.597z M475.666,385.92c0,0.529,0,1.051-0.068,1.515L335.346,265.221L475.666,142.8 V385.92z"></path> </g> </g></svg>`;
    document.body.appendChild(contactButton);

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    modalOverlay.style.display = 'none';
    document.body.appendChild(modalOverlay);

    const contactModal = document.createElement('div');
    contactModal.classList.add('contact-modal');
    contactModal.innerHTML = `
        <div class="modal-header">
            <h3>Get in Touch</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="contact-form">
                <div class="form-group">
                    <label for="name">Name <span class="required">*</span></label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email <span class="required">*</span></label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message <span class="required">*</span></label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <div id="form-status"></div>
                <div class="form-group">
                    <button type="submit" class="submit-btn">Send Message</button>
                </div>
            </form>
        </div>
    `;
    modalOverlay.appendChild(contactModal);

    function loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                emailjs.init({
                    publicKey: "snWDTS8oEMk_09bNP"
                });
                resolve();
                return;
            }
            
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof emailjs !== 'undefined') {
                    clearInterval(checkInterval);
                    emailjs.init({
                        publicKey: "snWDTS8oEMk_09bNP"
                    });
                    resolve();
                } else if (attempts >= 10) {
                    clearInterval(checkInterval);
                    reject(new Error('EmailJS library not found after multiple attempts'));
                }
            }, 200);
        });
    }

    loadEmailJS().catch(error => console.warn('Failed to load EmailJS:', error));
    
    function showMessagePopup(message, type) {
        const popup = document.createElement('div');
        popup.classList.add('message-popup', type);
        popup.textContent = message;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    contactButton.addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    const closeBtn = contactModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');
        
        if (!nameField.value.trim()) {
            formStatus.textContent = 'Please enter your name.';
            formStatus.style.color = 'red';
            nameField.focus();
            return;
        }
        
        if (!emailField.value.trim()) {
            formStatus.textContent = 'Please enter your email.';
            formStatus.style.color = 'red';
            emailField.focus();
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.style.color = 'red';
            emailField.focus();
            return;
        }
        
        if (!messageField.value.trim()) {
            formStatus.textContent = 'Please enter your message.';
            formStatus.style.color = 'red';
            messageField.focus();
            return;
        }
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        formStatus.textContent = '';
        
        try {
            if (typeof emailjs === 'undefined') {
                await loadEmailJS();
            }
            
            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const message = messageField.value.trim();
            const currentDate = new Date().toLocaleString();
            
            const templateParams = {
                name: name,
                email: email,
                message: message,
                time: currentDate,
                reply_to: email
            };
            
            await emailjs.send(
                'service_b1cceuk',
                'template_o7f6pwp',
                templateParams
            );
            
            showMessagePopup('Message sent successfully!', 'success');
            contactForm.reset();
            
            setTimeout(function() {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 2000);
        } catch (error) {
            showMessagePopup('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
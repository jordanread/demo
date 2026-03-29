/* js/contact.js */
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  VFC.accordion.init();
  const form = document.getElementById('contactForm');
  const typeSelect = document.getElementById('fieldType');
  const visitSubform = document.getElementById('visitSubform');

  // Show/hide visit subform
  typeSelect?.addEventListener('change', () => {
    if (typeSelect.value === 'visit') {
      visitSubform.style.display = 'block';
    } else {
      visitSubform.style.display = 'none';
    }
  });

  // Form submission
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    // Honeypot check
    const hp = form.querySelector('[name="website"]');
    if (hp && hp.value) return;

    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }
    setTimeout(() => {
      form.style.display = 'none';
      const success = document.getElementById('formSuccess');
      if (success) success.style.display = 'block';
    }, 1200);
  });

  function validateForm() {
    let valid = true;

    // Name
    const name = document.getElementById('fieldName');
    const nameGroup = name?.closest('.form-group');
    if (name && !name.value.trim()) {
      nameGroup?.classList.add('has-error');
      valid = false;
    } else {
      nameGroup?.classList.remove('has-error');
    }

    // Email
    const email = document.getElementById('fieldEmail');
    const emailGroup = email?.closest('.form-group');
    const emailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    if (!emailValid) {
      emailGroup?.classList.add('has-error');
      valid = false;
    } else {
      emailGroup?.classList.remove('has-error');
    }

    // Type
    const type = document.getElementById('fieldType');
    const typeGroup = type?.closest('.form-group');
    if (type && !type.value) {
      typeGroup?.classList.add('has-error');
      valid = false;
    } else {
      typeGroup?.classList.remove('has-error');
    }

    // Message
    const msg = document.getElementById('fieldMessage');
    const msgGroup = msg?.closest('.form-group');
    if (msg && msg.value.trim().length < 20) {
      msgGroup?.classList.add('has-error');
      valid = false;
    } else {
      msgGroup?.classList.remove('has-error');
    }

    return valid;
  }

  // Real-time validation on blur
  ['fieldName','fieldEmail','fieldType','fieldMessage'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('blur', () => {
      el.closest('.form-group')?.classList.remove('has-error');
    });
  });
});

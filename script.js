// Menu mobile
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  const setOpen = (open) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}

// Lien actif dans le menu selon la section visible
const navLinks = [...document.querySelectorAll('.menu a[href^="#"]:not(.btn)')];
const targets = navLinks
  .map((a) => [a, document.querySelector(a.getAttribute('href'))])
  .filter(([, el]) => el);
const updateActive = () => {
  const y = window.scrollY + 120;
  let current = targets[0];
  let best = -Infinity;
  targets.forEach((t) => {
    // L'en-tête (#top) est fixe : on le considère toujours en haut de page
    const top = t[1].id === 'top' ? 0 : t[1].getBoundingClientRect().top + window.scrollY;
    if (top <= y && top > best) { best = top; current = t; }
  });
  navLinks.forEach((a) => a.classList.toggle('active', current && a === current[0]));
};
window.addEventListener('scroll', updateActive, { passive: true });
updateActive();

// Année du pied de page
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Formulaire de contact : envoi direct par e-mail (EmailJS) ou message WhatsApp
const WHATSAPP = '2250501098607';
const EMAIL = 'contact@digiframeci.com';

// Identifiants EmailJS (tableau de bord emailjs.com). La clé publique est faite
// pour être visible dans le site : ce n'est pas un mot de passe.
const EMAILJS = {
  publicKey: '',   // Account > General > Public Key
  serviceId: '',   // Email Services > Service ID
  templateId: '',  // Email Templates > Template ID
};
const emailjsReady = () =>
  window.emailjs && EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId;

const form = document.getElementById('contact-form');
const result = document.getElementById('form-result');

const showResult = (msg, type) => {
  result.textContent = msg;
  result.classList.toggle('error', type === 'error');
  result.classList.toggle('success', type === 'success');
};

if (form) {
  if (window.emailjs && EMAILJS.publicKey) {
    window.emailjs.init({ publicKey: EMAILJS.publicKey, limitRate: { throttle: 10000 } });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const via = e.submitter ? e.submitter.dataset.via : 'whatsapp';
    const d = new FormData(form);

    // Robot détecté (champ piège rempli) : on fait semblant que tout va bien
    if (d.get('website')) { showResult('Merci, votre message a bien été envoyé.', 'success'); form.reset(); return; }

    // Vérification des champs obligatoires
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.value.trim() !== '';
      field.classList.toggle('invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    // Pour l'e-mail, il faut un moyen de répondre : e-mail ou téléphone
    const emailField = form.elements.email;
    const phoneField = form.elements.phone;
    if (via === 'email' && !firstInvalid) {
      const email = emailField.value.trim();
      if (email && !emailField.checkValidity()) {
        emailField.classList.add('invalid');
        showResult('Cette adresse e-mail ne semble pas valide.', 'error');
        emailField.focus();
        return;
      }
      if (!email && !phoneField.value.trim()) {
        emailField.classList.add('invalid');
        showResult('Indiquez votre e-mail ou votre téléphone pour que nous puissions vous répondre.', 'error');
        emailField.focus();
        return;
      }
    }
    if (firstInvalid) {
      showResult('Merci de remplir les champs marqués d\'un astérisque (*).', 'error');
      firstInvalid.focus();
      return;
    }

    const text =
      'Bonjour DIGIFRAME,\n\n' +
      'Nom : ' + d.get('name') + '\n' +
      (d.get('email') ? 'E-mail : ' + d.get('email') + '\n' : '') +
      (d.get('phone') ? 'Téléphone : ' + d.get('phone') + '\n' : '') +
      'Service : ' + d.get('service') + '\n\n' +
      d.get('message');

    if (via !== 'email') {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      showResult('WhatsApp s\'ouvre avec votre message prêt à envoyer.');
      return;
    }

    // Sans EmailJS configuré (ou si le service ne charge pas) : on ouvre la messagerie du visiteur
    if (!emailjsReady()) {
      const subject = 'Demande de projet – ' + d.get('service');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      showResult('Votre messagerie va s\'ouvrir avec votre message prêt à envoyer.');
      return;
    }

    const btn = e.submitter;
    const label = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    showResult('Envoi de votre message…');
    try {
      await window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        from_name: d.get('name'),
        reply_to: d.get('email') || EMAIL,
        email: d.get('email') || 'non renseigné',
        phone: d.get('phone') || 'non renseigné',
        service: d.get('service'),
        message: d.get('message'),
        title: 'Demande de projet – ' + d.get('service'),
      });
      showResult('✓ Merci ' + d.get('name') + ' ! Votre message a bien été envoyé. Nous vous répondons très vite.', 'success');
      form.reset();
    } catch (err) {
      console.error('EmailJS', err);
      showResult('L\'envoi a échoué. Réessayez, ou écrivez-nous sur WhatsApp au 05 01 09 86 07.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('invalid'));
  });
}

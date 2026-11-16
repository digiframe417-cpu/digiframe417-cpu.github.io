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

// Formulaire : prépare un message WhatsApp ou e-mail
const WHATSAPP = '2250501098607';
const EMAIL = 'digiframe417@gmail.com';
const form = document.getElementById('contact-form');
const result = document.getElementById('form-result');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const via = e.submitter ? e.submitter.dataset.via : 'whatsapp';

    // Vérification des champs obligatoires
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.value.trim() !== '';
      field.classList.toggle('invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      result.textContent = 'Merci de remplir les champs marqués d\'un astérisque (*).';
      result.classList.add('error');
      firstInvalid.focus();
      return;
    }
    result.classList.remove('error');

    const d = new FormData(form);
    const text =
      'Bonjour DIGIFRAME,\n\n' +
      'Nom : ' + d.get('name') + '\n' +
      (d.get('phone') ? 'Téléphone : ' + d.get('phone') + '\n' : '') +
      'Service : ' + d.get('service') + '\n\n' +
      d.get('message');

    if (via === 'email') {
      const subject = 'Demande de projet – ' + d.get('service');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      result.textContent = 'Votre messagerie va s\'ouvrir avec votre message prêt à envoyer.';
    } else {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      result.textContent = 'WhatsApp s\'ouvre avec votre message prêt à envoyer.';
    }
  });

  form.querySelectorAll('[required]').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('invalid'));
  });
}

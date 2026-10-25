/**
 * Profezie per la Pace — Reportage
 * Logica interattiva principale (JavaScript Vanilla)
 */

(function () {
  'use strict';

  // Dati della galleria fotografica
  const gallery = [
    {
      src: 'images/FotoDiGruppo.jpeg',
      alt: 'Spazio 5C',
      caption: 'Fotografia principale — Foto di gruppo.',
      width: 2434,
      height: 1706,
    },
    {
      src: 'images/ArcoMuseo.jpeg',
      alt: 'Dettaglio dell’allestimento della Università',
      caption: 'Dettaglio dell’allestimento — immagine segnaposto.',
      width: 1600,
      height: 1066,
    },
    {
      src: 'images/SalaUniversita.jpg',
      alt: 'Una sala del museo di Piazza Università',
      caption: 'Gli spazi dell’incontro — immagine segnaposto.',
      width: 860,
      height: 484,
    },
    {
      src: 'images/Materiale1.jpeg',
      alt: 'Materiali esposti durante la visita',
      caption: 'Materiali della mostra — immagine segnaposto.',
      width: 1536,
      height: 1721,
    },
  ];

  // =========================================================================
  // 1. Menu di navigazione (Indice)
  // =========================================================================

  const menuButton = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');

  function setMenuOpen(isOpen) {
    if (!menuButton || !siteNav) return;

    menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    siteNav.classList.toggle('is-open', isOpen);

    const iconMenu = menuButton.querySelector('.icon-menu');
    const iconClose = menuButton.querySelector('.icon-close');
    if (iconMenu) iconMenu.hidden = isOpen;
    if (iconClose) iconClose.hidden = !isOpen;
  }

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', () => {
      const isCurrentlyOpen = menuButton.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isCurrentlyOpen);
    });

    // Chiudi il menu al click su una voce dell'indice
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    // Chiudi il menu cliccando fuori dall'header quando è aperto
    document.addEventListener('click', (event) => {
      if (
        menuButton.getAttribute('aria-expanded') === 'true' &&
        !siteNav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  // =========================================================================
  // 2. Fisarmonica Testimonianze (Disclosure & hidden="until-found")
  // =========================================================================

  const testimonyGrid = document.getElementById('testimony-grid');
  const testimonyCards = testimonyGrid
    ? Array.from(testimonyGrid.querySelectorAll('.testimony-card'))
    : [];

  function setCardState(card, isOpen) {
    const panel = card.querySelector('.card-detail');
    const button = card.querySelector('.card-button');
    if (!panel || !button) return;

    card.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', 'until-found');
    }

    const label = button.querySelector('.card-button-label');
    const chevronDown = button.querySelector('.icon-chevron-down');
    const chevronUp = button.querySelector('.icon-chevron-up');

    if (label) {
      label.textContent = isOpen ? 'Riduci' : 'Leggi la testimonianza';
    }
    if (chevronDown) chevronDown.hidden = isOpen;
    if (chevronUp) chevronUp.hidden = !isOpen;
  }

  if (testimonyGrid) {
    // Gestione click sui pulsanti delle card (apertura mutuamente esclusiva)
    testimonyGrid.addEventListener('click', (event) => {
      const button = event.target.closest('.card-button');
      if (!button) return;

      const clickedCard = button.closest('.testimony-card');
      if (!clickedCard) return;

      const isCurrentlyOpen = button.getAttribute('aria-expanded') === 'true';

      testimonyCards.forEach((card) => {
        if (card === clickedCard) {
          setCardState(card, !isCurrentlyOpen);
        } else {
          setCardState(card, false);
        }
      });
    });

    // Sincronizzazione stato UI se l'utente trova il testo tramite ricerca nella pagina (Ctrl+F)
    testimonyGrid.addEventListener('beforematch', (event) => {
      const matchedPanel = event.target.closest('.card-detail');
      if (!matchedPanel) return;

      const matchedCard = matchedPanel.closest('.testimony-card');
      testimonyCards.forEach((card) => {
        setCardState(card, card === matchedCard);
      });
    });

    // Fallback per browser che non supportano ancora l'evento beforematch
    if (!('onbeforematch' in HTMLElement.prototype)) {
      document.querySelectorAll('[hidden="until-found"]').forEach((el) => {
        el.removeAttribute('hidden');
        const card = el.closest('.testimony-card');
        if (card) {
          setCardState(card, true);
        }
      });
    }
  }

  // =========================================================================
  // 3. Galleria Fotografica & Lightbox (<dialog>)
  // =========================================================================

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryGrid = document.getElementById('gallery-grid');
  let lastFocus = null;

  function openImage(index, triggerElement) {
    const item = gallery[index];
    if (!item || !lightbox || !lightboxImg || !lightboxCaption) return;

    lastFocus = triggerElement || document.activeElement;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxImg.width = item.width;
    lightboxImg.height = item.height;
    lightboxCaption.textContent = item.caption;

    document.body.style.overflow = 'hidden';
    lightbox.showModal();
  }

  if (galleryGrid) {
    galleryGrid.addEventListener('click', (event) => {
      const trigger = event.target.closest('.gallery-trigger');
      if (!trigger) return;

      const index = Number(trigger.getAttribute('data-gallery-index'));
      if (!Number.isNaN(index)) {
        openImage(index, trigger);
      }
    });
  }

  if (lightbox) {
    // Ripristina scroll e focus alla chiusura del dialog
    lightbox.addEventListener('close', () => {
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') {
        requestAnimationFrame(() => {
          lastFocus.focus();
        });
      }
    });

    // Fallback light-dismiss per browser che non supportano <dialog closedby="any">
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      lightbox.addEventListener('click', (event) => {
        if (event.target !== lightbox) return;

        const rect = lightbox.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (isDialogContent) return;

        lightbox.close();
      });
    }
  }

  // Gestione globale del tasto Escape per il menu
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });
})();


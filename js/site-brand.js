// ─────────────────────────────────────────────
// Flip to true on 16 Aug (or whenever) and redeploy
export const SHOW_LOGO = true;
// ─────────────────────────────────────────────

/**
 * Renders the site brand (logo + TGTWURJC Alumni) into a container.
 *
 * @param {string | HTMLElement} target - CSS selector or element
 * @param {object} [options]
 * @param {string} [options.href='../'] - home link
 * @param {string} [options.logoSrc] - path to logo (differs per page depth)
 * @param {string} [options.className] - extra classes on the <a>
 */
export function initSiteBrand(target, options = {}) {
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const {
    href = '../',
    logoSrc = 'assets/logo.png',
    className = 'flex items-center gap-2.5 font-display text-xl font-bold tracking-wide text-white',
  } = options;

  el.innerHTML = `
    <a href="${href}" class="${className}">
      <img
        src="${logoSrc}"
        alt="TGTWURJC"
        class="site-brand-logo h-8 w-8 object-contain sm:h-9 sm:w-9 ${SHOW_LOGO ? '' : 'hidden'}"
      />
      <span>
        TGTWURJC <span class="text-sun">Alumni</span>
      </span>
    </a>
  `;
}

export function applyLogoVisibility(...targets) {
  targets.forEach((t) => {
    const el = typeof t === 'string' ? document.getElementById(t) : t;
    if (!el) return;
    el.classList.toggle('hidden', !SHOW_LOGO);
  });
}
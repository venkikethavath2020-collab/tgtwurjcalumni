/**
 * Simple component loader — fetches HTML partials and injects them.
 * Usage: await loadComponent("components/contact-modal.html", "#modals-root");
 */
export async function loadComponent(url, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      console.warn(`Target not found: ${targetSelector}`);
      return;
    }
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      const html = await res.text();
      target.insertAdjacentHTML("beforeend", html);
    } catch (e) {
      console.error(e);
      target.insertAdjacentHTML(
        "beforeend",
        `<p class="p-4 text-sm text-coral">Could not load component: ${url}</p>`
      );
    }
  }
  
  export async function loadComponents(list) {
    await Promise.all(list.map(({ url, target }) => loadComponent(url, target)));
  }
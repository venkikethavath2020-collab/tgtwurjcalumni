// Association Committee Modal — Filterable UI (self-contained)
export function initAssociationModal() {
    const contactButtonAssociation = document.getElementById("contactButtonAssociation");
    const contactModal = document.getElementById("contactModal");
    const contactBody = document.getElementById("contactBody");
    const contactButtonTop = document.getElementById("contactButtonTop");
    const contactButtonFooter = document.getElementById("contactButtonFooter");
    const closeContact = document.getElementById("closeContact");
    const searchInput = document.getElementById("committeeSearch");
    const filtersEl = document.getElementById("committeeFilters");
  
    if (!contactModal || !contactBody) return;
  
    let contactLoaded = false;
    let associationData = null;
    let activeFilter = "all";
    let searchQuery = "";
  
    const FILTERS = [
      { id: "all", label: "All" },
      { id: "leadership", label: "Leadership", keywords: ["president", "vice president"] },
      { id: "secretaries", label: "Secretaries", keywords: ["secretary"] },
      { id: "finance", label: "Finance", keywords: ["treasurer"] },
      { id: "events", label: "Events", keywords: ["event coordinator"] },
      { id: "pr", label: "PR & Media", keywords: ["pr", "media"] },
      { id: "connect", label: "Connect", keywords: ["alumni connect", "school association"] },
      { id: "committees", label: "Committees", keywords: ["discipline", "ethics"] },
      { id: "advisory", label: "Advisory", keywords: ["advisory"] },
    ];
  
    function initials(name) {
      return String(name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
    }
  
    function memberMeta(m) {
      const parts = [];
      if (m.batch) parts.push(m.batch);
      if (m.location) parts.push(m.location);
      if (m.profession) parts.push(m.profession);
      if (m.qualification) parts.push(m.qualification);
      return parts.join(" · ");
    }
  
    function matchesSearch(post, query) {
      if (!query) return true;
      const q = query.toLowerCase();
      if (post.post.toLowerCase().includes(q)) return true;
      return (post.members || []).some((m) => {
        const hay = [m.name, m.batch, m.location, m.profession, m.qualification]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
  
    function matchesFilter(post, filterId) {
      if (filterId === "all") return true;
      const filter = FILTERS.find((f) => f.id === filterId);
      if (!filter?.keywords) return true;
      const postName = (post.post || "").toLowerCase();
      return filter.keywords.some((kw) => postName.includes(kw));
    }
  
    function renderFilters() {
      if (!filtersEl) return;
      filtersEl.innerHTML = FILTERS.map(
        (f) => `
        <button
          type="button"
          data-filter="${f.id}"
          class="filter-chip shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition
            ${activeFilter === f.id ? "bg-ink text-white" : "bg-mist text-ink/70 hover:bg-ink/10"}"
        >
          ${f.label}
        </button>
      `
      ).join("");
  
      filtersEl.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeFilter = btn.dataset.filter;
          renderFilters();
          renderList();
        });
      });
    }
  
    function renderList() {
      if (!contactBody || !associationData) return;
  
      const assoc = associationData.association || associationData;
      const members = assoc.members || [];
  
      const president = members.find((p) => p.post === "President")?.members?.[0];
      const vp = members.find((p) => p.post === "Vice President")?.members?.[0];
  
      let html = "";
  
      // Hero cards
      if (
        (activeFilter === "all" || activeFilter === "leadership") &&
        !searchQuery &&
        (president || vp)
      ) {
        html += `<div class="mb-6 grid gap-3 sm:grid-cols-2">`;
        if (president) {
          html += `
            <article class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1a4543] to-ink p-5 text-white shadow-lift">
              <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sun/15 blur-2xl"></div>
              <p class="relative text-[10px] font-bold uppercase tracking-[0.18em] text-sun">President</p>
              <div class="relative mt-3 flex items-center gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-sun ring-2 ring-sun/30">
                  ${initials(president.name)}
                </div>
                <div class="min-w-0">
                  <h4 class="font-display text-lg font-bold leading-tight">${president.name}</h4>
                  <p class="text-xs text-white/60">${president.batch || ""} Batch</p>
                </div>
              </div>
            </article>`;
        }
        if (vp) {
          html += `
            <article class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-[#1a4543] to-ink p-5 text-white shadow-lift">
              <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-coral/20 blur-2xl"></div>
              <p class="relative text-[10px] font-bold uppercase tracking-[0.18em] text-sun">Vice President</p>
              <div class="relative mt-3 flex items-center gap-3">
                <img
                  src="assets/vamsi.jpeg"
                  alt="${vp.name}"
                  class="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-sun/40"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-sun ring-2 ring-sun/30">
                  ${initials(vp.name)}
                </div>
                <div class="min-w-0">
                  <h4 class="font-display text-lg font-bold leading-tight">${vp.name}</h4>
                  <p class="text-xs text-white/60">${vp.batch || ""} Batch</p>
                </div>
              </div>
            </article>`;
        }
        html += `</div>`;
      }
  
      const filtered = members.filter(
        (p) => matchesFilter(p, activeFilter) && matchesSearch(p, searchQuery)
      );
  
      if (filtered.length === 0) {
        html += `
          <div class="rounded-2xl border border-dashed border-ink/15 bg-mist/40 px-6 py-12 text-center">
            <p class="text-sm font-medium text-ink">No matches found</p>
            <p class="mt-1 text-xs text-muted">Try a different search or filter</p>
          </div>`;
      } else {
        html += `<div class="space-y-3">`;
        filtered.forEach((post) => {
          const people = post.members || [];
          const isCore = ["President", "Vice President"].includes(post.post);
          html += `
            <article class="overflow-hidden rounded-2xl border border-ink/8 bg-white transition hover:border-ink/15 hover:shadow-soft">
              <div class="flex items-center gap-3 border-b border-ink/6 bg-mist/50 px-4 py-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isCore ? "bg-leaf/15 text-leaf" : "bg-ink/8 text-muted"
                } text-[11px] font-bold">
                  ${isCore ? "✓" : post.s_no || "•"}
                </span>
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-bold text-ink">${post.post}</h3>
                  <p class="text-[11px] text-muted">${people.length} member${people.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div class="divide-y divide-ink/6">
                ${
                  people.length
                    ? people
                        .map(
                          (m) => `
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-sun">
                      ${initials(m.name)}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold text-ink truncate">${m.name}</p>
                      <p class="text-xs text-muted truncate">${memberMeta(m) || "—"}</p>
                    </div>
                  </div>`
                        )
                        .join("")
                    : `<p class="px-4 py-3 text-xs text-muted">To be filled</p>`
                }
              </div>
            </article>`;
        });
        html += `</div>`;
      }
  
      const notes = assoc.notes || [];
      if (notes.length && activeFilter === "all" && !searchQuery) {
        html += `
          <p class="mt-6 text-center text-xs leading-5 text-muted">
            ${notes.join(" · ")}
          </p>`;
      }
  
      contactBody.innerHTML = html;
    }
  
    function renderAssociation(data) {
      associationData = data;
      renderFilters();
      renderList();
    }
  
    async function loadAssociation() {
      if (contactLoaded) return;
      try {
        const res = await fetch("data/association.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load committee data");
        const data = await res.json();
        renderAssociation(data);
        contactLoaded = true;
      } catch (e) {
        contactBody.innerHTML = `<p class="text-sm text-coral">${e.message}. Check that <code>data/association.json</code> is deployed.</p>`;
      }
    }
  
    function openContactModal() {
      contactModal.classList.remove("hidden");
      contactModal.classList.add("flex");
      document.body.style.overflow = "hidden";
      loadAssociation();
    }
  
    function closeContactModal() {
      contactModal.classList.add("hidden");
      contactModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  
    searchInput?.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderList();
    });
  
    contactButtonTop?.addEventListener("click", openContactModal);
    contactButtonFooter?.addEventListener("click", openContactModal);
    contactButtonAssociation?.addEventListener("click", openContactModal);
    closeContact?.addEventListener("click", closeContactModal);
    contactModal?.addEventListener("click", (e) => {
      if (e.target === contactModal) closeContactModal();
    });
  
    // Expose for external use if needed
    window.openAssociationModal = openContactModal;
  }
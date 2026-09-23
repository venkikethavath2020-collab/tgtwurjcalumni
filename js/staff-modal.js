// Staff Contacts Modal — passcode gate + list rendering
export function initStaffModal() {
    // ─────────────────────────────────────────────
    // Change this passcode before deploy
    const STAFF_PASSCODE = "tgtwurjc-admin";
    // ─────────────────────────────────────────────
    const STAFF_UNLOCK_KEY = "reunion26_staff_unlocked";
  
    const staffModal = document.getElementById("staffModal");
    const staffBtn = document.getElementById("staffContactsBtn");
    const closeStaff = document.getElementById("closeStaff");
    const staffGate = document.getElementById("staffGate");
    const staffContent = document.getElementById("staffContent");
    const staffGateForm = document.getElementById("staffGateForm");
    const staffPasscode = document.getElementById("staffPasscode");
    const staffGateError = document.getElementById("staffGateError");
    const teachersList = document.getElementById("teachersList");
    const workersList = document.getElementById("workersList");
  
    if (!staffModal) return;
  
    let staffLoaded = false;
  
    function openStaffModal() {
      staffModal.classList.remove("hidden");
      staffModal.classList.add("flex");
      document.body.style.overflow = "hidden";
  
      if (sessionStorage.getItem(STAFF_UNLOCK_KEY) === "1") {
        showStaffContent();
      } else {
        staffGate?.classList.remove("hidden");
        staffContent?.classList.add("hidden");
        staffGateError?.classList.add("hidden");
        if (staffPasscode) staffPasscode.value = "";
      }
    }
  
    function closeStaffModal() {
      staffModal.classList.add("hidden");
      staffModal.classList.remove("flex");
      document.body.style.overflow = "";
    }
  
    function formatPhone(phone) {
      const digits = String(phone).replace(/\D/g, "");
      if (digits.length === 10) {
        return `${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      return phone;
    }
  
    function telHref(phone) {
      const digits = String(phone).replace(/\D/g, "");
      return digits.length === 10 ? `tel:+91${digits}` : `tel:${digits}`;
    }
  
    function initials(name) {
      return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
    }
  
    function renderGroup(list, container) {
      if (!container) return;
      container.innerHTML = list
        .map((person) => {
          const role = person.role
            ? `<p class="text-xs text-muted">${person.role}</p>`
            : "";
          return `
            <div class="staff-card">
              <div class="staff-avatar" aria-hidden="true">${initials(person.name)}</div>
              <div class="staff-info min-w-0 flex-1">
                <p class="font-semibold text-ink truncate">${person.name}</p>
                ${role}
              </div>
              <a class="staff-phone" href="${telHref(person.phone)}" title="Call ${person.name}">
                ${formatPhone(person.phone)}
              </a>
            </div>
          `;
        })
        .join("");
    }
  
    async function loadStaff() {
      if (staffLoaded) return;
      const res = await fetch("data/school-staff.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load staff contacts");
      const data = await res.json();
      renderGroup(data.teachers || [], teachersList);
      renderGroup(data.workers || [], workersList);
      staffLoaded = true;
    }
  
    async function showStaffContent() {
      staffGate?.classList.add("hidden");
      staffContent?.classList.remove("hidden");
      try {
        await loadStaff();
      } catch (e) {
        if (teachersList) {
          teachersList.innerHTML = `<p class="text-sm text-coral">${e.message}</p>`;
        }
      }
    }
  
    staffBtn?.addEventListener("click", openStaffModal);
    closeStaff?.addEventListener("click", closeStaffModal);
    staffModal?.addEventListener("click", (e) => {
      if (e.target === staffModal) closeStaffModal();
    });
  
    staffGateForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = staffPasscode?.value?.trim() || "";
      if (value === STAFF_PASSCODE) {
        sessionStorage.setItem(STAFF_UNLOCK_KEY, "1");
        staffGateError?.classList.add("hidden");
        showStaffContent();
      } else {
        staffGateError?.classList.remove("hidden");
      }
    });
  
    // Expose for external use
    window.openStaffModal = openStaffModal;
  }
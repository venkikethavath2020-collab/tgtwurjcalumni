import { MAX_CONCURRENT_UPLOADS } from "./config.js";
import { compressImage } from "./compress.js";
import { uploadImage } from "./r2.js";

const validTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const maxOriginalBytes = 25 * 1024 * 1024;
const MAX_FILES = 10;

// Hardcoded — same value the gate checks. Sent to the worker on every upload.
// Change here (and in upload.html gate) if the code is ever rotated.
const UPLOAD_ACCESS_CODE = "#TGTWURJC#";

export function initUpload() {
  const input = document.getElementById("photoInput");
  const zone = document.getElementById("dropZone");
  const form = document.getElementById("uploadForm");
  const message = document.getElementById("uploadMessage");
  const btn = document.getElementById("uploadBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const selectedSummary = document.getElementById("selectedSummary");
  const selectedCount = document.getElementById("selectedCount");
  const clearBtn = document.getElementById("clearFiles");
  const progressPanel = document.getElementById("progressPanel");
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  const progressPercent = document.getElementById("progressPercent");
  const progressDetail = document.getElementById("progressDetail");

  const nameInput = form?.querySelector('[name="name"]');
  const batchSelect = form?.querySelector('[name="batch"]');

  if (!input || !zone || !form) return;

  let selected = [];

  // ── Validate required fields + files (no access code — gate already passed)
  const updateButtonState = () => {
    if (!btn) return;
    const hasName = nameInput?.value.trim().length > 0;
    const hasBatch = batchSelect?.value.trim().length > 0;
    const hasFiles = selected.length > 0;

    btn.disabled = !(hasName && hasBatch && hasFiles);
  };

  const setLoading = (loading) => {
    if (!btn) return;
    btn.disabled = loading;
    if (btnText) btnText.textContent = loading ? "Uploading…" : "Upload Photos";
    if (btnSpinner) btnSpinner.classList.toggle("hidden", !loading);
    if (!loading) updateButtonState();
  };

  const showMessage = (text, type = "error") => {
    message.innerHTML = text;
    message.className =
      type === "success"
        ? "mt-5 rounded-xl bg-[#E5E9DF] px-4 py-4 text-sm font-semibold text-ink"
        : "mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700";
  };

  const clearMessage = () => {
    message.textContent = "";
    message.className = "mt-5 text-center text-sm";
  };

  const updateSummary = () => {
    if (!selectedSummary || !selectedCount) return;
    if (selected.length === 0) {
      selectedSummary.classList.add("hidden");
    } else {
      selectedSummary.classList.remove("hidden");
      selectedCount.textContent =
        selected.length === 1
          ? "1 photo selected"
          : `${selected.length} photos selected`;
    }
    updateButtonState();
  };

  const setProgress = (percent, label, detail = "") => {
    if (progressPanel) progressPanel.classList.remove("hidden");
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
    if (progressLabel) progressLabel.textContent = label;
    if (progressDetail) progressDetail.textContent = detail;
  };

  const hideProgress = () => {
    if (progressPanel) progressPanel.classList.add("hidden");
    if (progressBar) progressBar.style.width = "0%";
  };

  // Listen for required field changes
  nameInput?.addEventListener("input", updateButtonState);
  batchSelect?.addEventListener("change", updateButtonState);

  const choose = (files) => {
    const incoming = [...files];
    const accepted = incoming.filter(
      (file) => validTypes.includes(file.type) && file.size <= maxOriginalBytes
    );
    const typeOrSizeRejected = incoming.length - accepted.length;

    let final = accepted;
    let overLimit = 0;
    if (accepted.length > MAX_FILES) {
      overLimit = accepted.length - MAX_FILES;
      final = accepted.slice(0, MAX_FILES);
    }

    selected = final;
    updateSummary();

    if (typeOrSizeRejected || overLimit) {
      const parts = [];
      if (typeOrSizeRejected) {
        parts.push(
          `${typeOrSizeRejected} file${typeOrSizeRejected > 1 ? "s" : ""} skipped (invalid type or over 25 MB)`
        );
      }
      if (overLimit) {
        parts.push(
          `only the first ${MAX_FILES} photos were kept (max ${MAX_FILES} at a time)`
        );
      }
      showMessage(parts.join(". ") + ".");
    } else {
      clearMessage();
    }

    input.value = "";
  };

  input.addEventListener("change", (event) => choose(event.target.files));

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      selected = [];
      updateSummary();
      clearMessage();
      hideProgress();
      input.value = "";
    });
  }

  ["dragenter", "dragover"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add("is-active");
    })
  );

  ["dragleave", "drop"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.remove("is-active");
    })
  );

  zone.addEventListener("drop", (event) => choose(event.dataTransfer.files));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!navigator.onLine) {
      showMessage("You appear to be offline. Reconnect to the internet and try again.");
      return;
    }

    const name = form.name.value.trim();
    const batch = form.batch.value.trim();

    if (!name) {
      showMessage("Please enter your name.");
      nameInput?.focus();
      return;
    }
    if (!batch) {
      showMessage("Please select your batch.");
      batchSelect?.focus();
      return;
    }
    if (!selected.length) {
      showMessage("Choose at least one image to upload.");
      return;
    }

    setLoading(true);
    clearMessage();
    setProgress(0, "Starting…", `0 of ${selected.length} photos`);

    // Access code is hardcoded — gate already verified the user on this page
    const metadata = {
      accessCode: UPLOAD_ACCESS_CODE,
      name,
      batch,
      caption: form.caption.value.trim(),
    };

    const total = selected.length;
    let complete = 0;
    let failed = 0;
    const fileWeight = 100 / total;

    async function uploadOne(file) {
      const base = complete * fileWeight;

      try {
        setProgress(
          base + fileWeight * 0.1,
          "Compressing…",
          `${complete} of ${total} done`
        );
        const compressed = await compressImage(file);

        setProgress(
          base + fileWeight * 0.2,
          "Uploading…",
          `${complete} of ${total} done`
        );

        await uploadImage(compressed, metadata, (percent) => {
          const overall = base + fileWeight * (0.2 + 0.8 * (percent / 100));
          setProgress(
            Math.min(overall, 99),
            "Uploading…",
            `${complete} of ${total} done · current ${percent}%`
          );
        });

        complete++;
        setProgress(
          (complete / total) * 100,
          complete === total ? "Finishing…" : "Uploading…",
          `${complete} of ${total} done`
        );
      } catch (error) {
        failed++;
        complete++;
        const msg = error?.message || "";
        if (msg.toLowerCase().includes("access code") || msg.includes("403")) {
          showMessage("Upload was rejected by the server. Please contact the committee.");
        }
        setProgress(
          (complete / total) * 100,
          "Uploading…",
          `${complete} of ${total} processed (${failed} failed)`
        );
      }
    }

    const queue = selected.map((file) => () => uploadOne(file));
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, queue.length) },
      async () => {
        while (queue.length) {
          await queue.shift()();
        }
      }
    );

    await Promise.all(workers);

    setLoading(false);

    const successCount = complete - failed;

    if (successCount > 0) {
      setProgress(100, "Complete", `${successCount} of ${total} uploaded`);
      showMessage(
        `<span class="mr-1.5 inline-block text-lg" aria-hidden="true">🎉</span> ${
          successCount === total
            ? "Your memories have been uploaded successfully."
            : `${successCount} of ${total} photos uploaded successfully.`
        } Thank you for contributing to the TGTWURJC Grand Reunion 2026.`,
        "success"
      );
      form.reset();
      selected = [];
      updateSummary();
      window.setTimeout(() => {
        window.location.href = "../gallery/";
      }, 2200);
    } else {
      hideProgress();
      if (!message.textContent) {
        showMessage("None of the photos could be uploaded. Please try again.");
      }
    }
  });

  // Initial state
  updateButtonState();
}

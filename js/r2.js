const PHOTO_API =
  "https://grand-reunion-2026-photos.venkikethavath2020.workers.dev";

export async function uploadImage(file, metadata, onProgress) {
  const formData = new FormData();
  formData.append('accessCode', metadata.accessCode || '');
  formData.append("image", file, file.name);
  formData.append("name", metadata.name || "Anonymous");
  formData.append("batch", metadata.batch || "Not specified");
  formData.append("caption", metadata.caption || "");

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", PHOTO_API);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      let payload = {};

      try {
        payload = JSON.parse(request.responseText);
      } catch {}

      if (request.status >= 200 && request.status < 300) {
        resolve(payload);
      } else {
        reject(
          new Error(
            payload.error || "The photo could not be uploaded. Please try again."
          )
        );
      }
    });

    request.addEventListener("error", () => {
      reject(
        new Error(
          "You appear to be offline. Check your connection and try again."
        )
      );
    });

    request.send(formData);
  });
}

export async function fetchGallery(cursor = "", limit = 24) {
  const url = `${PHOTO_API}?limit=${limit}${
    cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
  }`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load the photo gallery right now.");
  }

  return response.json();
}

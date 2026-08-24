const MAX_SOURCE_BYTES = 40 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 2.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2_000;
const JPEG_QUALITIES = [0.82, 0.72, 0.62, 0.52];

export async function prepareImageForExtraction(file: File): Promise<string> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("40MB 이하의 이미지를 선택해 주세요.");
  }

  try {
    const image = await decodeImage(file);

    try {
      return await renderOptimizedDataUrl(image);
    } finally {
      image.close();
    }
  } catch (error) {
    throw new Error(
      "사진을 변환하지 못했어요. 다른 사진을 선택해 주세요.",
      { cause: error },
    );
  }
}

async function decodeImage(file: File): Promise<ImageBitmap> {
  if (await isHeic(file)) {
    const { heicTo } = await import("heic-to");

    return heicTo({ blob: file, type: "bitmap" });
  }

  return createImageBitmap(file, { imageOrientation: "from-image" });
}

async function isHeic(file: File): Promise<boolean> {
  if (/^image\/hei[cf](?:-sequence)?$/i.test(file.type)) return true;
  if (/\.(?:heic|heif)$/i.test(file.name)) return true;

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (header.length < 12) return false;

  const brand = new TextDecoder().decode(header.slice(8, 12));

  return ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
}

async function renderOptimizedDataUrl(image: ImageBitmap): Promise<string> {
  let scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");

  try {
    for (let resizeAttempt = 0; resizeAttempt < 4; resizeAttempt += 1) {
      drawImage(canvas, image, scale);

      for (const quality of JPEG_QUALITIES) {
        const output = await canvasToBlob(canvas, quality);
        if (output.size <= MAX_OUTPUT_BYTES) return blobToDataUrl(output);
      }

      scale *= 0.8;
    }

    throw new Error("Optimized image exceeds the upload limit.");
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function drawImage(
  canvas: HTMLCanvasElement,
  image: ImageBitmap,
  scale: number,
) {
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas could not encode the image."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed."));
    reader.readAsDataURL(blob);
  });
}

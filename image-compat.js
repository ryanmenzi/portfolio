(() => {
    const SUPPORTED_EXTENSIONS = new Set([
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'svg',
        'avif'
    ]);

    const FALLBACK_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];

    function getExtension(path) {
        try {
            const cleanPath = path.split('?')[0].split('#')[0];
            const parts = cleanPath.split('.');
            if (parts.length < 2) {
                return '';
            }
            return parts[parts.length - 1].toLowerCase();
        } catch (error) {
            return '';
        }
    }

    function buildPathWithExtension(path, extension) {
        const cleanPath = path.split('?')[0].split('#')[0];
        const dotIndex = cleanPath.lastIndexOf('.');
        if (dotIndex < 0) {
            return path;
        }
        const base = cleanPath.slice(0, dotIndex);
        return `${base}.${extension}`;
    }

    function loadImageSource(src) {
        return new Promise((resolve, reject) => {
            const testImage = new Image();
            testImage.onload = () => resolve(src);
            testImage.onerror = reject;
            testImage.src = src;
        });
    }

    async function findFallbackSource(originalSource) {
        for (const extension of FALLBACK_EXTENSIONS) {
            const candidate = buildPathWithExtension(originalSource, extension);
            if (candidate === originalSource) {
                continue;
            }
            try {
                await loadImageSource(candidate);
                return candidate;
            } catch (error) {
                // Try the next extension.
            }
        }
        return '';
    }

    async function convertImageToWebp(source) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error('Unable to fetch image for conversion.');
        }

        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Canvas context unavailable.');
        }
        context.drawImage(bitmap, 0, 0);

        const webpBlob = await new Promise((resolve, reject) => {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('WebP conversion failed.'));
                }
            }, 'image/webp', 0.92);
        });

        return URL.createObjectURL(webpBlob);
    }

    async function normalizeImageSource(imageElement) {
        const source = imageElement.getAttribute('src');
        if (!source || source.startsWith('data:') || source.startsWith('blob:')) {
            return;
        }

        const extension = getExtension(source);
        if (!extension || SUPPORTED_EXTENSIONS.has(extension)) {
            return;
        }

        try {
            const convertedUrl = await convertImageToWebp(source);
            imageElement.src = convertedUrl;
            return;
        } catch (error) {
            // Fall through to file fallback checks.
        }

        const fallbackSource = await findFallbackSource(source);
        if (fallbackSource) {
            imageElement.src = fallbackSource;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img[src]');
        images.forEach((image) => {
            normalizeImageSource(image);

            image.addEventListener('error', async () => {
                const fallbackSource = await findFallbackSource(image.getAttribute('src') || '');
                if (fallbackSource) {
                    image.src = fallbackSource;
                }
            }, { once: true });
        });
    });
})();

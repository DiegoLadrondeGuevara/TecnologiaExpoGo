/**
 * Cloudinary Image Upload Helper
 * 
 * Uploads images directly from the browser to Cloudinary using an unsigned preset.
 * Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
 * 
 * If Cloudinary is not configured, falls back gracefully (admin can still use URL input).
 */

const CLOUD_NAME = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = () => !!(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Upload a file to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export const uploadImage = async (file) => {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'techstore');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
};

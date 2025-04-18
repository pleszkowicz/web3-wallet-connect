'use server'

export async function validateImageUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || '';

        if (!res.ok) {
            return { valid: false, message: 'Image is unreachable' };
        }

        if (!contentType.startsWith('image/')) {
            return { valid: false, message: 'URL must point to the image' };
        }

        return { valid: true };
    } catch (error) {
        return { valid: false, message: 'Invalid or blocked URL' };
    }
}

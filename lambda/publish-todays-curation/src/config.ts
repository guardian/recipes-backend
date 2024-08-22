export const Bucket = process.env['STATIC_BUCKET'];

export const Today = new Date();

export const FastlyApiKey = process.env['FASTLY_API_KEY'];

export const Stage = process.env['STAGE'] ?? '';

export const Stack = process.env['STACK'] ?? '';

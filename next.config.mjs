/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // This allows using images from the app directory
    },
};

// module.exports = {
//     env: {
//         MONGODB_URI: process.env.MONGODB_URI,
//         SESSION_PASSWORD: process.env.SESSION_PASSWORD,
//     },
// }
export default nextConfig;

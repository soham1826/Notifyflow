/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We can add rewrites or redirects if needed, but since we will make raw fetches to http://localhost:5001/api/v1 from the browser, we'll configure CORS on the API (which is already configured via cors()).
};

export default nextConfig;

import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Silence Turbopack messages about optional Node built-ins during client/static builds
	turbopack: {
		resolveAlias: {
			fs: path.resolve('./src/shims/empty.js'),
			'node:fs': path.resolve('./src/shims/empty.js'),
			zlib: path.resolve('./src/shims/empty.js'),
			'node:zlib': path.resolve('./src/shims/empty.js'),
		},
	},
	// Keep webpack fallback for non-Turbopack environments
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve = config.resolve || {};
			config.resolve.fallback = {
				...(config.resolve.fallback || {}),
				fs: false,
				zlib: false,
				'node:fs': false,
				'node:zlib': false,
			};
		}
		return config;
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/login',
				permanent: false,
			},
		]
	},
};

export default nextConfig;

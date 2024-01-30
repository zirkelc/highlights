// import * as fs from 'browserify-fs';
import Module from "node:module";

const require = Module.createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
	// webpack: (config, options) => {
	// 	config.resolve.fallback = {
	// 		...config.resolve.fallback,
	// 		fs: require.resolve('browserify-fs'),
	// 		path: require.resolve('path-browserify'),
	// 		crypto: require.resolve('crypto-browserify'),
	// 	}

	// 	return config;
	// }
};

export default nextConfig;

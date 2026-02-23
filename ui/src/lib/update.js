/**
 * Compare two version strings.
 * Version format: 
 * - 3-digit: all numbers (e.g., "1.0.0")
 * - 4-digit: first three are numbers, last is string (e.g., "1.0.0-beta")
 * 
 * @param {string} v1 - First version string
 * @param {string} v2 - Second version string
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
	if (v1 === v2) return 0;
	
	const parts1 = v1.split('.');
	const parts2 = v2.split('.');
	
	const maxLength = Math.max(parts1.length, parts2.length);
	
	for (let i = 0; i < maxLength; i++) {
		const p1 = i < parts1.length ? parts1[i] : '0';
		const p2 = i < parts2.length ? parts2[i] : '0';
		
		// If both are numeric, compare as numbers
		if (!isNaN(p1) && !isNaN(p2)) {
			const num1 = parseInt(p1, 10);
			const num2 = parseInt(p2, 10);
			if (num1 !== num2) {
				return num1 > num2 ? 1 : -1;
			}
		} else {
			// Compare as strings (for suffix like "beta", "rc", etc.)
			if (p1 !== p2) {
				return p1 > p2 ? 1 : -1;
			}
		}
	}
	
	return 0;
}

/**
 * Check for app updates by calling the update API.
 * Compares the current version with the latest version from the server.
 * If a newer version is available, returns the download URL.
 *
 * @param {string} baseUrl - Base URL of the server (e.g. https://example.com)
 * @param {string} currentVersion - Current app version (e.g., "1.0.0")
 * @returns {Promise<null|{version:string, url:string}>}
 */
export async function checkUpdate(baseUrl = '', currentVersion = '') {
	if (!currentVersion) {
		throw new Error('currentVersion is required');
	}
	
	const apiPath = '/api/update/app';
	const url = new URL(apiPath, baseUrl);
	url.searchParams.append('version', currentVersion);
	url.searchParams.append('app', 'neutron');
	
	try {
		const resp = await fetch(url.toString(), { method: 'GET' });
		
		if (!resp.ok) {
			throw new Error(`Update API failed: ${resp.status} ${resp.statusText}`);
		}
		
		const data = await resp.json();
		
		// Validate response structure
		if (!data.version || !data.url) {
			throw new Error('Invalid response from update API');
		}
		
		// Compare versions
		if (compareVersions(data.version, currentVersion) > 0) {
			// Newer version available
			return {
				version: data.version,
				url: data.url
			};
		}
		
		// No update available
		return null;
	} catch (err) {
		// Bubble up error for caller to handle as needed
		throw err;
	}
}

// Import Capacitor modules for native file operations
let Capacitor = null;
let Filesystem = null;
let Directory = null;

// Dynamically import Capacitor modules to avoid errors in web environment
async function ensureCapacitorModules() {
	if (typeof window !== 'undefined' && window.Capacitor) {
		if (!Capacitor) {
			Capacitor = (await import('@capacitor/core')).Capacitor;
		}
		if (!Filesystem || !Directory) {
			const fsModule = await import('@capacitor/filesystem');
			Filesystem = fsModule.Filesystem;
			Directory = fsModule.Directory;
		}
	}
	return Capacitor && Capacitor.isNativePlatform();
}

/**
 * Check if running in native Capacitor environment
 * @returns {Promise<boolean>}
 */
async function isNativeEnvironment() {
	try {
		await ensureCapacitorModules();
		return Capacitor && Capacitor.isNativePlatform();
	} catch (error) {
		console.warn('Failed to check native environment:', error);
		return false;
	}
}

/**
 * Get the updates directory path in app's DATA directory
 * @returns {Promise<string>} Directory path
 */
async function getUpdatesDirectory() {
	await ensureCapacitorModules();
	
	// Create updates directory if it doesn't exist
	const updatesDir = 'updates';
	const dirResult = await Filesystem.mkdir({
		path: updatesDir,
		directory: Directory.Data,
		recursive: true
	});
	
	return updatesDir;
}

/**
 * Check if a version APK already exists locally
 * @param {string} version - Version string
 * @returns {Promise<boolean>}
 */
async function isVersionDownloaded(version) {
	try {
		await ensureCapacitorModules();
		const updatesDir = await getUpdatesDirectory();
		const fileName = `${version}.apk`;
		
		// Try to stat the file
		await Filesystem.stat({
			path: `${updatesDir}/${fileName}`,
			directory: Directory.Data
		});
		
		return true;
	} catch (error) {
		// File doesn't exist or other error
		return false;
	}
}

/**
 * Download APK file to local storage
 * Only works in native Capacitor environment
 * 
 * @param {string} version - Version string (e.g., "1.0.0")
 * @param {string} url - Download URL
 * @param {boolean} force - Force re-download even if already exists
 * @returns {Promise<{success: boolean, filePath: string, message: string}>}
 */
export async function downloadApp(version, url, force = false) {
	try {
		// Check if running in native environment
		const isNative = await isNativeEnvironment();
		if (!isNative) {
			return {
				success: false,
				filePath: '',
				message: 'downloadApp only works in native Capacitor environment'
			};
		}
		
		// Validate parameters
		if (!version || !url) {
			throw new Error('version and url parameters are required');
		}
		
		// Check if already downloaded
		if (!force) {
			const alreadyDownloaded = await isVersionDownloaded(version);
			if (alreadyDownloaded) {
				const updatesDir = await getUpdatesDirectory();
				const filePath = `${updatesDir}/${version}.apk`;
				return {
					success: true,
					filePath: filePath,
					message: `Version ${version} already downloaded`
				};
			}
		}
		
		// Download the file
		console.log(`Downloading version ${version} from ${url}`);
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to download from ${url}: ${response.status} ${response.statusText}`);
		}
		
		const blob = await response.blob();
		const arrayBuffer = await blob.arrayBuffer();
		
		// Create temporary file name
		const tempFileName = `${version}.apk.tmp`;
		const finalFileName = `${version}.apk`;
		const updatesDir = await getUpdatesDirectory();
		
		// Write to temporary file
		await Filesystem.writeFile({
			path: `${updatesDir}/${tempFileName}`,
			data: new Uint8Array(arrayBuffer),
			directory: Directory.Data,
			recursive: true
		});
		
		// Rename temporary file to final file
		await Filesystem.rename({
			from: `${updatesDir}/${tempFileName}`,
			to: `${updatesDir}/${finalFileName}`,
			directory: Directory.Data
		});
		
		console.log(`Successfully downloaded version ${version} to ${updatesDir}/${finalFileName}`);
		
		return {
			success: true,
			filePath: `${updatesDir}/${finalFileName}`,
			message: `Version ${version} downloaded successfully`
		};
		
	} catch (error) {
		console.error('Failed to download app:', error);
		
		// Try to clean up temporary file if it exists
		try {
			await ensureCapacitorModules();
			const updatesDir = await getUpdatesDirectory();
			const tempFileName = `${version}.apk.tmp`;
			await Filesystem.deleteFile({
				path: `${updatesDir}/${tempFileName}`,
				directory: Directory.Data
			});
		} catch (cleanupError) {
			// Ignore cleanup errors
		}
		
		return {
			success: false,
			filePath: '',
			message: `Download failed: ${error.message}`
		};
	}
}

/**
 * Get the local file path of a downloaded APK
 * @param {string} version - Version string
 * @returns {Promise<{success: boolean, filePath: string, message: string}>}
 */
export async function getDownloadedAppPath(version) {
	try {
		// Check if running in native environment
		const isNative = await isNativeEnvironment();
		if (!isNative) {
			return {
				success: false,
				filePath: '',
				message: 'getDownloadedAppPath only works in native Capacitor environment'
			};
		}
		
		// Validate parameter
		if (!version) {
			throw new Error('version parameter is required');
		}
		
		// Check if file exists
		const alreadyDownloaded = await isVersionDownloaded(version);
		if (!alreadyDownloaded) {
			return {
				success: false,
				filePath: '',
				message: `Version ${version} not found in local storage`
			};
		}
		
		// Get file path
		const updatesDir = await getUpdatesDirectory();
		const filePath = `${updatesDir}/${version}.apk`;
		
		// Convert to usable file URL for Capacitor
		const fileUrl = Capacitor.convertFileSrc(
			`${Directory.Data}/${filePath}`
		);
		
		return {
			success: true,
			filePath: filePath,
			fileUrl: fileUrl,
			message: `Version ${version} found locally`
		};
		
	} catch (error) {
		console.error('Failed to get downloaded app path:', error);
		return {
			success: false,
			filePath: '',
			message: `Failed to get file path: ${error.message}`
		};
	}
}

export default { checkUpdate, downloadApp, getDownloadedAppPath };


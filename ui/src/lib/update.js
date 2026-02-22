/**
 * Check for an updated /neutron-app.apk on the server using HTTP ETag.
 * If the remote file has changed (ETag differs from `currentEtag`),
 * downloads the new file and returns an object with the `fileUrl` (blob URL)
 * and the new `etag`. If there is no change, returns null.
 *
 * @param {string} baseUrl - Base URL of the server (e.g. https://example.com)
 * @param {string|null} currentEtag - Previously known ETag for /neutron-app.apk
 * @returns {Promise<null|{fileUrl:string, etag:string}>}
 */
export async function checkUpdate(baseUrl = '', currentEtag = null) {
	const apkPath = '/neutron-app.apk';
	const url = (new URL(apkPath, baseUrl)).toString();

	try {
		// Try HEAD first to fetch ETag without downloading body
		let resp = await fetch(url, { method: 'HEAD' });

		// Some servers (or CORS setups) may disallow HEAD; fall back to GET for headers only
		if (!resp.ok) {
			resp = await fetch(url, { method: 'GET' });
		}

		const remoteEtag = resp.headers.get('etag');

		// If ETag exists and matches currentEtag, nothing to do
		if (remoteEtag && currentEtag && remoteEtag === currentEtag) {
			return null;
		}

		// Download the file (GET) and return a blob URL
		const getResp = await fetch(url, { method: 'GET' });
		if (!getResp.ok) {
			throw new Error(`Failed to download ${url}: ${getResp.status} ${getResp.statusText}`);
		}

		const blob = await getResp.blob();
		const blobUrl = URL.createObjectURL(blob);

		// Prefer ETag from the final response if available
		const finalEtag = getResp.headers.get('etag') || remoteEtag || null;

		return { fileUrl: blobUrl, etag: finalEtag };
	} catch (err) {
		// Bubble up error for caller to handle as needed
		throw err;
	}
}

export default { checkUpdate };


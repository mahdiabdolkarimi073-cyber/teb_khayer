

export function isCSApplication() {
	return typeof window !== "undefined" && (window.navigator.userAgent?.includes("unity") || window.isApplication || window.document.body.className.includes("app"));
}

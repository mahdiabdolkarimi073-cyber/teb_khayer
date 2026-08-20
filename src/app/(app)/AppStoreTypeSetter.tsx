'use client'

declare global {
	var appType: "myket" | 'bazaar' | 'other'
}

if (typeof window !== 'undefined') {
	const type = new URL(window.location.href).searchParams.get('type');
	const ag = window.navigator.userAgent;
	window.appType = (type === "other" || ag.endsWith('other')) ? 'other':(type === "myket" || ag.endsWith('myket')) ? 'myket':'bazaar';
}

const AppStoreTypeSetter = () => {



	return null;
};

export default AppStoreTypeSetter;

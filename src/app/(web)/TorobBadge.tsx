import { getVar } from "@backend/utils/setting";

export const dynamic = 'force-dynamic';

export async function TorobBadge() {
	const torobEnabled = await getVar<string>('TOROB_ENABLED');
	if (torobEnabled !== "true") return null;

	return (
		<a
			href="https://torob.com"
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-l from-cyan-500 to-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
			aria-label="ما در ترب"
		>
			<svg viewBox="0 0 24 24" fill="white" width="16" height="16">
				<path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/>
			</svg>
			<span>ما در ترب</span>
		</a>
	);
}

export default TorobBadge;

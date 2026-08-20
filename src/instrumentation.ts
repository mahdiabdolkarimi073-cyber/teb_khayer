export async function register() {
	console.log("WAIT PRISMA BE READY...");
	// await PrismaSubscription()
	// setInterval(()=>{
	// 	const myHeaders = new Headers();
	// 	myHeaders.append("Authorization", "Bearer 1717476420787utKQdFhXr3JlnNg7ruRkq9jVqI8E27cDGkEfPpdbZg0nz2TSarurSXG92uBCcADU1016434018");
	// 	myHeaders.append("Content-Type", "application/json");
	// 	myHeaders.append("User-Agent", "Mozilla/5.0 (Linux; Android 13;Xiaomi 10 Pro Build/MBFMIEK) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5060.134 Mobile Safari/537.36 EdgA/104.0.1264.77");
	//
	// 	const date = new Date();
	// 	date.setDate(date.getDate() + 1);
	// 	const raw = JSON.stringify({
	// 		"count": 100,
	// 		"availableTaps": 1900,
	// 		"timestamp": Math.round(date.getTime() / 1000)
	// 	});
	//
	// 	['1718401260',new Date().getTime()+""].map(s => {
	// 		fetch("https://api.hamsterkombat.io/clicker/buy-boost", {
	// 			"headers": myHeaders,
	// 			"body": `{"boostId":"BoostFullAvailableTaps","timestamp":${s}}`,
	// 			"method": "POST"
	// 		}).catch(e => true);
	// 	})
	// 	fetch("https://api.hamsterkombat.io/clicker/tap", {
	// 		method: "POST",
	// 		headers: myHeaders,
	// 		body: raw
	// 	}).catch((error) => console.error(error));
	// }, 5000)
	// appStoresSync().catch(console.error);
}

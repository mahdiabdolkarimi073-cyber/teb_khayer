import prisma from "@backend/modules/prisma/Prisma";

const AppConfig = {
	name: "طِب خیّر",
	logo: "/logo.webp",
	contact: {
		"gmail": "mailto:tebkhayyer.1358@gmail.com",
		"instagram": "https://www.instagram.com/hejamat_ardabil",
		"telegram": "https://t.me/Teb_khayyer_Ardabil",
		"eitaa": "https://eitaa.com/joinchat/2771714572C9cc8f60c1b",
		"whatsapp": "https://chat.whatsapp.com/IZYUWEyod5BEg30iLcfCpR",
		"rubika": "https://rubika.ir/joing/GABEBDBA0ECLIFMMENGUUGSQSURLUCON"
	},
	ADMINS: `
09147434120
09141535689
09145302605
09396575090
09397791019
09131791663
`.split("\n").map(s =>s.trim()).map(s => +s),
	TID: "98730799"
}

export default AppConfig;

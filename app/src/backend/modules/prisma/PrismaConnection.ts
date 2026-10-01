// lib/prisma.js
import { PrismaClient } from '@prisma/client';
declare const global: {
	instance: PrismaClient
}
let PrismaSingle: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	console.log("PRISMA CREATION!")
	PrismaSingle = new PrismaClient();
} else {
	if (!global.instance) {
		global.instance = new PrismaClient();
	}
	PrismaSingle = global.instance;
}

export default PrismaSingle;

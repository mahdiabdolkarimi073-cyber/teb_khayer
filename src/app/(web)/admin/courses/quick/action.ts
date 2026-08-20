'use server';

import * as fs from "fs";

export async function readDir(path: string) {
	const final = process.cwd()+"/public/contents/"+path;
	return fs.readdirSync(final);
}

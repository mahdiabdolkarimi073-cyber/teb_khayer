// FileStorage.js
import { openDB } from 'idb';

const DB_NAME = 'MyFilesDB';
const STORE_NAME = 'files';

async function saveFile(key: string, buffer: Buffer) {
	try {
		const db = await openDB(DB_NAME, 1, {
			upgrade(db) {
				db.createObjectStore(STORE_NAME, { keyPath: 'key' });
			},
		});

		await db.put(STORE_NAME, { key, buffer });
		db.close();
	} catch (error) {
		console.error('Error saving file to IndexedDB:', error);
	}
}

async function readFile(key: string) {
	try {
		const db = await openDB(DB_NAME, 1);
		const value = await db.get(STORE_NAME, key);
		db.close();

		if (value) {
			return value.buffer as Buffer;
		}
	} catch (error) {
		console.error('Error retrieving file from IndexedDB:', error);
	}

	return null;
}

export { saveFile, readFile };

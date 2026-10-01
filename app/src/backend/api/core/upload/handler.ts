import Handler from "@backend/modules/Handler";
import {updateFile} from "@backend/utils/file";

export default class UploadHandler extends Handler {
	async handler() {
		const formData = (await this.requestCloned.formData());
		const file = formData.get('file') as File;
		const path = formData.get('path') as string;
		const newPath = await updateFile(file, path,path);

		return {
			path: newPath
		}
	}
}

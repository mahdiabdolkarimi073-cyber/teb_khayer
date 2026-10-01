import prisma from "@backend/modules/prisma/Prisma";
import ViewAttachment from "@/app/(app)/app/dashboard/courses/[id]/ViewAttachment";
import {Attachment} from "@prisma/client";
import {getUserFromCookie} from "@/utils/serverComponents/user";

const Page = async (props: any) => {
    const taghvim = await prisma.taghvim.findUnique({
        where: {
            id: props?.params?.key
        }
    });
    if (!taghvim) return "تقویم یافت نشد";

	return (
		<ViewAttachment attachment={taghvim as unknown as Attachment} />
	)
}

export default Page;

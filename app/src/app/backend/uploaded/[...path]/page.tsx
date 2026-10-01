import {redirect} from "next/navigation";

const Page = (props: any) => {
    redirect(`/api/file/${props?.params?.path?.join?.('/')}`)

	return (
		<div>

		</div>
	)
}

export default Page;

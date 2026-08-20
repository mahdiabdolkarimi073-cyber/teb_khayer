import {Loader} from "@mantine/core";

const Loading = (props: any) => {

	return (
		<div className={'min-h-[50vh] relative w-full center flex-col gap-3'}>
			<Loader size={'xl'} color="primary"/>
			<h2>درحال بارگذاری</h2>
		</div>
	)
}

export default Loading;

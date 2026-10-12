import {getAddresses} from "@/app/(web)/dashboard/addresses/action";
import AddressesView from "@/app/(web)/dashboard/addresses/AddressesView";
import {ssrOptimize} from "@/utils/other";

const Page = async () => {
    const addresses = await getAddresses();
    return <AddressesView initialAddresses={ssrOptimize(addresses) as any} />;
};

export default Page;

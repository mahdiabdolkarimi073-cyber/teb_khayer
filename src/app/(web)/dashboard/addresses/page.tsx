import {getAddresses} from "@/app/(web)/dashboard/addresses/action";
import AddressesView from "@/app/(web)/dashboard/addresses/AddressesView";
import {ssrOptimize} from "@/utils/other";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import {redirect} from "next/navigation";

const Page = async () => {
    const user = await getUserFromCookie();
    if (!user) {
        redirect("/auth/login");
    }

    const addresses = await getAddresses();
    return <AddressesView initialAddresses={ssrOptimize(addresses) as any} />;
};

export default Page;

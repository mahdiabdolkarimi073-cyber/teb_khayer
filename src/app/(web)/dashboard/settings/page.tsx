const Page = async () => {
    const {getProfile} = await import("@/app/(web)/dashboard/settings/action");
    const {ssrOptimize} = await import("@/utils/other");
    const profile = await getProfile();
    const SettingsView = (await import("./SettingsView")).default;

    return <SettingsView initialProfile={ssrOptimize(profile) as any} />;
};

export default Page;

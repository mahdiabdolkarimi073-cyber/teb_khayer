const Page = async () => {
    const {getProfile, getLastLogin} = await import("@/app/(web)/dashboard/settings/action");
    const {ssrOptimize} = await import("@/utils/other");
    const [profile, lastLogin] = await Promise.all([getProfile(), getLastLogin()]);
    const SettingsView = (await import("./SettingsView")).default;

    return <SettingsView initialProfile={ssrOptimize(profile) as any} lastLogin={lastLogin} />;
};

export default Page;

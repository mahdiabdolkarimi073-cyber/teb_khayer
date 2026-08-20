import AuthGate from "@/app/(web)/auth/page";

function Page() {
    return (
        <div>
            <AuthGate login="/app/login" signup="/app/signup" />
        </div>
    );
};

export default Page;
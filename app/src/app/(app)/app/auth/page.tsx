import AuthGate from "@/app/(web)/auth/page";

function Page() {
  return <AuthGate login="/app/login" signup="/app/signup" />;
}

export default Page;

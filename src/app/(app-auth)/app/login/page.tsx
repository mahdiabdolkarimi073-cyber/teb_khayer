import LoginComponent from "@/app/(app)/app/login/LoginComponent";
import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "@/app/(app)/app/login/login.module.css";

const Page = async (props: any) => {
  const user = await getUserFromCookie();
  if (!!user) {
    redirect("/app/dashboard");
    return;
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell}>
        <img src="/logo.webp" alt="طب خیر" className={styles.loginBrand} width={74} height={74} />
        <h1 className={styles.heading}>ورود به حساب کاربری</h1>
        <p className={styles.subtitle}>سلامتی، آرامش و زندگی بهتر — وارد شوید و ادامه دهید.</p>

        <div className={styles.signupRow}>
          <span>حساب کاربری ندارید؟</span>
          <Link className={styles.signupLink} href="/app/signup">ثبت نام کنید</Link>
        </div>

        <div className={styles.divider} />

        <LoginComponent glass />

        <p className={styles.terms}>
          شرایط{" "}
          <a href="/privacy/service" target="_blank" rel="noreferrer">استفاده از خدمات</a>{" "}
          و{" "}
          <a href="/privacy" target="_blank" rel="noreferrer">حریم خصوصی</a>{" "}
          طب خیر را می‌پذیرم.
        </p>
      </section>
    </main>
  );
};

export const metadata = {
  title: "ورود",
};

export default Page;

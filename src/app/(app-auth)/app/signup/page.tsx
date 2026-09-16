import { getUserFromCookie } from "@/utils/serverComponents/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignupComponent from "@/app/(app)/app/signup/SignupComponent";
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
        <h1 className={styles.heading}>ثبت نام در طب خیر</h1>
        <p className={styles.subtitle}>سلامتی، آرامش و زندگی بهتر — همین حالا حساب خود را بسازید.</p>

        <div className={styles.signupRow}>
          <span>قبلا ثبت نام کرده‌اید؟</span>
          <Link className={styles.signupLink} href="/app/login">ورود</Link>
        </div>

        <div className={styles.divider} />

        <SignupComponent glass />

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
  title: "ثبت نام",
};

export default Page;

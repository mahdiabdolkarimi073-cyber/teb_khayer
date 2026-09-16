import Link from "next/link";
import { Button } from "@mantine/core";
import styles from "@/app/(app)/app/login/login.module.css";

function Page() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell}>
        <img src="/logo.webp" alt="طب خیر" className={styles.loginBrand} width={74} height={74} />
        <h1 className={styles.heading}>به طب خیر خوش آمدید</h1>
        <p className={styles.subtitle}>سلامتی، آرامش و زندگی بهتر — برای ادامه یکی از گزینه‌ها را انتخاب کنید.</p>
        <div className={styles.divider} />
        <div className="flex flex-col gap-4 w-full">
          <Link href="/app/signup" className="w-full">
            <Button size="lg" w="100%">ثبت نام</Button>
          </Link>
          <Link href="/app/login" className="w-full">
            <Button size="lg" color="green" w="100%">قبلا ثبت نام کرده‌ام</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Page;

"use client";

import Link from "next/link";
import Image from "next/image";
import SignupComponent from "@/app/(app)/app/signup/SignupComponent";
import styles from "@/app/(app)/app/login/login.module.css";

export default function WebSignupPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell}>
        <Image src="/logo.webp" alt="طب خیر" width={74} height={74} className={styles.loginBrand} />
        <h1 className={styles.heading}>ثبت نام در طب خیر</h1>
        <p className={styles.subtitle}>سلامتی، آرامش و زندگی بهتر — همین حالا حساب خود را بسازید.</p>

        <div className={styles.signupRow}>
          <span>قبلا ثبت نام کرده‌اید؟</span>
          <Link className={styles.signupLink} href="/auth/login">ورود</Link>
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
}

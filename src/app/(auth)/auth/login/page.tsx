"use client";

import Link from "next/link";
import Image from "next/image";
import LoginComponent from "@/app/(app)/app/login/LoginComponent";
import styles from "@/app/(app)/app/login/login.module.css";

export default function WebLoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell}>
        <Image src="/logo.webp" alt="طب خیر" width={74} height={74} className={styles.loginBrand} />
        <h1 className={styles.heading}>ورود به حساب کاربری</h1>
        <p className={styles.subtitle}>سلامتی، آرامش و زندگی بهتر — وارد شوید و ادامه دهید.</p>

        <div className={styles.signupRow}>
          <span>حساب کاربری ندارید؟</span>
          <Link className={styles.signupLink} href="/auth/signup">ثبت نام می‌کنم</Link>
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
}

import React from "react";
import TrackProduct from "@/app/(web)/track/TrackProduct";
import styles from "@/app/(web)/track/track.module.css";

const heroImage = "/ChatGPT_Image_Sep_22,_2026,_10_51_08_AM.png";

const Page = (props: any) => {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>پیگیری سفارش</span>
          <h1>سفارش خود را پیگیری کنید</h1>
          <p>
            برای پیگیری محصول، لطفاً شماره سفارش و شماره تلفن خود را در کادرهای
            زیر وارد کرده و دکمه پیگیری را فشار دهید. شماره سفارش قبلاً از طریق
            رسید پیامکی به شماره شما ارسال شده است.
          </p>
        </div>
      </section>

      {/* Floating form card */}
      <div className={styles.card}>
        <TrackProduct />
      </div>

      {/* Status steps */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsHeader}>
          <span className={styles.stepsLabel}>مراحل سفارش</span>
          <h2>وضعیت سفارش شما چگونه تغییر می‌کند؟</h2>
          <p>پس از ثبت سفارش، وضعیت آن طی چهار مرحله زیر به‌روزرسانی می‌شود.</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>۱</div>
            <h3>ثبت سفارش</h3>
            <p>سفارش شما با موفقیت در سیستم ثبت می‌شود.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>۲</div>
            <h3>آماده‌سازی</h3>
            <p>سفارش شما توسط انبار آماده و بسته‌بندی می‌شود.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>۳</div>
            <h3>ارسال</h3>
            <p>سفارش تحویل پست یا تیپاکس شده و کد رهگیری پیامک می‌شود.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>۴</div>
            <h3>تحویل</h3>
            <p>سفارش به دست شما می‌رسد و فرآیند تکمیل می‌شود.</p>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className={styles.benefitsStrip}>
        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon} style={{ background: "#1468d8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <div>
            <p className={styles.benefitTitle}>پیگیری آنی</p>
            <p className={styles.benefitDesc}>در هر لحظه وضعیت سفارش را ببینید</p>
          </div>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon} style={{ background: "#18a56d" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className={styles.benefitTitle}>اطلاعات شفاف</p>
            <p className={styles.benefitDesc}>جزئیات کامل محصول و مبلغ سفارش</p>
          </div>
        </div>
        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon} style={{ background: "#ed812d" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className={styles.benefitTitle}>پشتیبانی سریع</p>
            <p className={styles.benefitDesc}>در صورت مشکل با ما در ارتباط باشید</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;

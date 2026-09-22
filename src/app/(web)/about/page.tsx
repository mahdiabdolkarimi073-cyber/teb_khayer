"use client";

import Link from "next/link";
import {
  IconArrowLeft,
  IconBook2,
  IconBrandAndroid,
  IconCheck,
  IconChevronDown,
  IconHeartHandshake,
  IconLeaf,
  IconPlayerPlay,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import styles from "./about.module.css";

const heroImage = "/ChatGPT_Image_Sep_16,_2026,_09_13_08_AM.png";
const naturalImage = "/ChatGPT_Image_Sep_14,_2026,_11_47_59_AM.png";
const herbsImage = "/ChatGPT_Image_Sep_14,_2026,_11_49_32_AM.png";

const services = [
  { icon: IconBook2, title: "آموزش‌های تخصصی", text: "دوره‌های کاربردی طب سنتی و ایرانی", tone: "blue" },
  { icon: IconLeaf, title: "محصولات طبیعی", text: "گیاهان دارویی اصیل و باکیفیت", tone: "green" },
  { icon: IconHeartHandshake, title: "مشاوره و همراهی", text: "پاسخ‌گویی و راهنمایی در مسیر سلامت", tone: "orange" },
  { icon: IconShieldCheck, title: "اعتماد و کیفیت", text: "محتوای معتبر و خدمات قابل اطمینان", tone: "teal" },
];

const reasons = [
  [IconUsers, "صدها هزار دانشجو", "جامعه‌ای رو به رشد از علاقه‌مندان طب سنتی"],
  [IconBook2, "هزاران ساعت آموزش", "محتوای علمی و کاربردی برای همه"],
  [IconPlayerPlay, "دسترسی همیشگی", "یادگیری در هر زمان و هر مکان"],
  [IconCheck, "تضمین کیفیت", "انتخاب مطمئن برای سلامت شما"],
];

const questions = [
  ["طب خیر چه خدماتی ارائه می‌دهد؟", "آموزش‌های تخصصی طب سنتی، محصولات طبیعی و راهنمایی برای انتخاب بهتر را در اختیار شما قرار می‌دهیم."],
  ["آیا دوره‌ها برای همه مناسب هستند؟", "دوره‌ها از سطح مقدماتی تا تخصصی آماده شده‌اند تا هر فرد با توجه به نیاز خود مسیر یادگیری را شروع کند."],
  ["چطور می‌توانم از اپلیکیشن استفاده کنم؟", "اپلیکیشن طب خیر را دریافت کنید و به آموزش‌ها و خدمات مجموعه در هر زمان دسترسی داشته باشید."],
];

export default function AboutPage() {
  return (
    <main className={styles.page} dir="rtl">
      <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>سلامت، آگاهی، زندگی بهتر</span>
          <h1>دانش طب سنتی،<br /><strong>همراه زندگی شما</strong></h1>
          <p>در طب خیر، آموزش طب سنتی و محصولات طبیعی را با زبانی ساده و نگاهی علمی در کنار شما قرار داده‌ایم.</p>
          <div className={styles.heroActions}>
            <Link href="/category/all" className={styles.primaryButton}>مشاهده دوره‌ها <IconArrowLeft size={18} /></Link>
            <Link href="#story" className={styles.lightButton}>بیشتر بدانید</Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div><strong>+۱۰۰</strong><span>دوره آموزشی</span></div>
          <div><strong>+۵۰هزار</strong><span>دانشجوی فعال</span></div>
          <div><strong>۲۴/۷</strong><span>دسترسی به محتوا</span></div>
          <div><strong>۱۰۰٪</strong><span>تجربه مطمئن</span></div>
        </div>
      </section>

      <section className={styles.services}>
        {services.map(({ icon: Icon, title, text, tone }) => (
          <Link href="/category/all" className={`${styles.serviceCard} ${styles[tone]}`} key={title}>
            <span className={styles.serviceIcon}><Icon size={25} /></span>
            <span className={styles.serviceCopy}><strong>{title}</strong><small>{text}</small></span>
            <span className={styles.serviceArrow}><IconArrowLeft size={15} /></span>
          </Link>
        ))}
      </section>

      <section className={styles.story} id="story">
        <div className={styles.storyImage} style={{ backgroundImage: `url(${herbsImage})` }}><span>از طبیعت، برای زندگی</span></div>
        <div className={styles.storyCopy}>
          <span className={styles.sectionEyebrow}>درباره مجموعه طب خیر</span>
          <h2>آگاهی، اولین قدم<br /><strong>برای سلامتی است</strong></h2>
          <p>مجموعه طب خیر با همراهی پزشکان، طبیبان و استادان مجرب طب سنتی و طب ایرانی اسلامی شکل گرفته است تا مسیر دسترسی به دانش معتبر و کاربردی را برای همه آسان‌تر کند.</p>
          <p>ما باور داریم شناخت بدن و طبیعت، شروع یک زندگی سالم‌تر است. به همین دلیل دوره‌های آموزشی، محصولات طبیعی و محتوای قابل اعتماد را در یک مجموعه گرد هم آورده‌ایم.</p>
          <Link href="/contact" className={styles.textLink}>با ما در ارتباط باشید <IconArrowLeft size={17} /></Link>
        </div>
      </section>

      <section className={styles.naturalBanner} style={{ backgroundImage: `url(${naturalImage})` }}>
        <div className={styles.naturalShade} />
        <div className={styles.naturalCopy}>
          <span className={styles.sectionEyebrow}>طبیعت را بهتر بشناسیم</span>
          <h2>سلامتی، هدیه‌ای از دل طبیعت</h2>
          <p>محصولات گیاهی و آموزش‌های طب سنتی را با خیال آسوده انتخاب کنید.</p>
          <Link href="/category/all" className={styles.greenButton}>ورود به فروشگاه <IconArrowLeft size={17} /></Link>
        </div>
      </section>

      <section className={styles.reasons}>
        <div className={styles.sectionHeading}><span className={styles.sectionEyebrow}>چرا طب خیر؟</span><h2>همراهی مطمئن در مسیر یادگیری</h2><p>هر آنچه برای شناخت بهتر سلامت و طب سنتی نیاز دارید، یک‌جا در اختیار شماست.</p></div>
        <div className={styles.reasonGrid}>
          {reasons.map(([Icon, title, text]) => <div className={styles.reason} key={String(title)}><span><Icon size={23} /></span><strong>{title}</strong><p>{text}</p></div>)}
        </div>
      </section>

      <section className={styles.appSection}>
        <div className={styles.appArt}><img src="/logo.webp" alt="لوگوی طب خیر" /><span><IconSparkles size={18} /> یک تجربه بهتر</span></div>
        <div className={styles.appCopy}><span className={styles.sectionEyebrow}>همیشه همراه شما</span><h2>اپلیکیشن طب خیر</h2><p>با نصب اپلیکیشن، دوره‌ها و خدمات مجموعه را سریع‌تر و راحت‌تر در گوشی خود داشته باشید.</p><div className={styles.appActions}><a href="https://cafebazaar.ir" target="_blank" rel="noreferrer" className={styles.primaryButton}><IconBrandAndroid size={19} /> دریافت از بازار</a><Link href="/app" className={styles.outlineButton}>آشنایی بیشتر</Link></div></div>
      </section>

      <section className={styles.faq}>
        <div className={styles.sectionHeading}><span className={styles.sectionEyebrow}>پاسخ پرسش‌های شما</span><h2>سؤالات متداول</h2></div>
        <div className={styles.questionList}>{questions.map(([question, answer]) => <details key={question}><summary>{question}<IconChevronDown size={18} /></summary><p>{answer}</p></details>)}</div>
      </section>
    </main>
  );
}

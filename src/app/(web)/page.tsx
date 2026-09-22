"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import {
  IconArrowLeft,
  IconBook2,
  IconBox,
  IconCircleCheck,
  IconHeadphones,
  IconLeaf,
  IconLock,
  IconMedicineSyrup,
  IconShieldCheck,
  IconStethoscope,
  IconTruckDelivery,
  IconUserCircle,
} from "@tabler/icons-react";
import styles from "./home.module.css";

const heroImage = "/ChatGPT_Image_Sep_22,_2026,_10_51_08_AM.png";
const naturalImage = "/ChatGPT_Image_Sep_14,_2026,_11_47_59_AM.png";
const appImage = "/ChatGPT_Image_Sep_14,_2026,_11_47_59_AM.png";

const quickServices = [
  { title: "محصولات گیاهی و سوغات محلی", text: "بهترین محصولات و سوغات سنتی", icon: IconLeaf, tone: "green" },
  { title: "دوره ها و آموزش ها", text: "دوره های علمی آموزش طب خیر", icon: IconBook2, tone: "blue" },
  { title: "پشتیبانی و مشاوره آنلاین", text: "با کارشناسان ما در ارتباط باشید", icon: IconUserCircle, tone: "purple" },
  { title: "تضمین کیفیت محصولات", text: "بهترین محصولات اصیل و با کیفیت", icon: IconBox, tone: "orange" },
];

function HeroBanner() {
  return (
    <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }} role="banner">
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>به فروشگاه اینترنتی طب خیر خوش آمدید</span>
        <h1>سلامت، آرامش و زندگی بهتر<br />با محصولاتی با کیفیت ما</h1>
        <p>ما در طب خیر با ارائه محصولات متنوع و باکیفیت، به بهبود سبک زندگی شما کمک می‌کنیم.</p>
        <Button component={Link} href="/category/all" className={styles.primaryButton} rightSection={<IconArrowLeft size={18} />} aria-label="مشاهده محصولات">
          مشاهده محصولات
        </Button>
      </div>
      <div className={styles.heroBenefits} role="list">
        <Benefit icon={IconTruckDelivery} title="ارسال سریع" text="به سراسر کشور" />
        <Benefit icon={IconShieldCheck} title="ضمانت اصالت کالا" text="و کیفیت تضمینی" />
        <Benefit icon={IconHeadphones} title="پشتیبانی واقعی" text="و پاسخگو" />
        <Benefit icon={IconLock} title="پرداخت امن" text="و مطمئن" />
      </div>
    </section>
  );
}

function Benefit({ icon: Icon, title, text }: { icon: typeof IconTruckDelivery; title: string; text: string }) {
  return (
    <div className={styles.benefit} role="listitem">
      <Icon size={27} stroke={1.7} aria-hidden="true" />
      <span>{title}</span>
      <small>{text}</small>
    </div>
  );
}

function QuickServices() {
  return (
    <section className={styles.servicesGrid} aria-label="خدمات طب خیر">
      {quickServices.map(({ title, text, icon: Icon, tone }) => (
        <Link href="/about" key={title} className={`${styles.serviceCard} ${styles[tone]}`} aria-label={title}>
          <div className={styles.serviceIcon}><Icon size={24} stroke={1.8} aria-hidden="true" /></div>
          <div><h2>{title}</h2><p>{text}</p></div>
          <span className={styles.circleArrow}><IconArrowLeft size={15} aria-hidden="true" /></span>
        </Link>
      ))}
    </section>
  );
}

function NaturalProductsBanner() {
  return (
    <section className={styles.naturalBanner} style={{ backgroundImage: `url(${naturalImage})` }} aria-label="محصولات طبیعی و ارگانیک">
      <div className={styles.naturalShade} />
      <div className={styles.naturalContent}>
        <span>سلامتی واقعی از دل طبیعت</span>
        <h2>محصولات طبیعی و ارگانیک</h2>
        <p>انتخابی سالم برای زندگی بهتر شما</p>
        <Button component={Link} href="/category/all" className={styles.greenButton} rightSection={<IconArrowLeft size={18} />} aria-label="مشاهده محصولات طبیعی">
          مشاهده محصولات
        </Button>
        <div className={styles.naturalFeatures}>
          <span><IconShieldCheck size={20} aria-hidden="true" /> کیفیت تضمینی</span>
          <span><IconLeaf size={20} aria-hidden="true" /> محصولات ارگانیک</span>
          <span><IconMedicineSyrup size={20} aria-hidden="true" /> تشخیص اصالت</span>
        </div>
      </div>
    </section>
  );
}

function AppSection() {
  return (
    <section className={styles.appSection} aria-label="اپلیکیشن طب خیر">
      <div className={styles.appImageWrap}>
        <img src={appImage} alt="اپلیکیشن طب خیر" loading="lazy" width="390" height="190" />
      </div>
      <div className={styles.appCopy}>
        <span className={styles.eyebrow}>همراه همیشگی سلامتی شما</span>
        <h2>اپلیکیشن طب خیر</h2>
        <p>با دریافت اپلیکیشن طب خیر، می‌توانید با استفاده از گوشی همراه به راحتی در هر مکان و هر زمان از امکانات مجموعه آموزشی و فروشگاه گیاهان دارویی بهره‌مند شوید.</p>
        <Button className={styles.primaryButton} rightSection={<IconArrowLeft size={18} />} aria-label="دانلود اپلیکیشن طب خیر">
          دانلود اپلیکیشن طب خیر
        </Button>
        <div className={styles.appStats}>
          <span><IconBook2 size={22} aria-hidden="true" /> صدها هزار دانشجو</span>
          <span><IconStethoscope size={22} aria-hidden="true" /> هزاران ساعت آموزش</span>
          <span><IconCircleCheck size={22} aria-hidden="true" /> دسترسی آسان و همیشگی</span>
        </div>
      </div>
    </section>
  );
}

function ProductCategories() {
  return (
    <section className={styles.productSection} aria-label="دسته‌بندی محصولات">
      <div className={styles.sectionHeading}>
        <span>انتخابی برای سبک زندگی سالم</span>
        <h2>دسته‌بندی محصولات</h2>
        <p>محصولات متنوع ما را در دسته‌بندی‌های مختلف مشاهده کنید</p>
      </div>
      <div className={styles.categoryTabs}>
        <Link href="/category/all" className={`${styles.categoryTab} ${styles.specialTab}`} aria-label="محصولات ویژه">
          <IconBox size={20} aria-hidden="true" /> محصولات ویژه
        </Link>
        <Link href="/about" className={`${styles.categoryTab} ${styles.consultTab}`} aria-label="خدمات مشاوره">
          <IconUserCircle size={20} aria-hidden="true" /> خدمات مشاوره
        </Link>
        <Link href="/about" className={`${styles.categoryTab} ${styles.courseTab}`} aria-label="دوره های آموزشی">
          <IconBook2 size={20} aria-hidden="true" /> دوره های آموزشی
        </Link>
        <Link href="/category/all" className={`${styles.categoryTab} ${styles.herbalTab}`} aria-label="محصولات گیاهی">
          <IconLeaf size={20} aria-hidden="true" /> محصولات گیاهی
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <main className={styles.page}>
      <HeroBanner />
      <QuickServices />
      <NaturalProductsBanner />
      <AppSection />
      <ProductCategories />
    </main>
  );
}

export default function Home() {
  return <HomePage />;
}

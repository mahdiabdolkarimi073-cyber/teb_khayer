"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import {
  IconArrowLeft,
  IconBook2,
  IconBox,
  IconChevronLeft,
  IconCircleCheck,
  IconHeadphones,
  IconLeaf,
  IconLock,
  IconMapPin,
  IconMedicineSyrup,
  IconPlant2,
  IconSearch,
  IconShieldCheck,
  IconShoppingCart,
  IconStethoscope,
  IconTruckDelivery,
  IconUserCircle,
} from "@tabler/icons-react";
import styles from "./home.module.css";

const heroImage = "https://images.pexels.com/photos/31468385/pexels-photo-31468385.jpeg?auto=compress&cs=tinysrgb&h=1200&w=2000";
const naturalImage = "https://images.pexels.com/photos/105028/pexels-photo-105028.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600";
const appImage = "https://images.pexels.com/photos/4871295/pexels-photo-4871295.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200";

const productImages = [
  "https://images.pexels.com/photos/9228574/pexels-photo-9228574.jpeg?auto=compress&cs=tinysrgb&h=500&w=500",
  "https://images.pexels.com/photos/29387145/pexels-photo-29387145.jpeg?auto=compress&cs=tinysrgb&h=500&w=500",
  "https://images.pexels.com/photos/34299347/pexels-photo-34299347.jpeg?auto=compress&cs=tinysrgb&h=500&w=500",
  "https://images.pexels.com/photos/35156986/pexels-photo-35156986.jpeg?auto=compress&cs=tinysrgb&h=500&w=500",
];

const quickServices = [
  { title: "محصولات گیاهی و سوغات محلی", text: "بهترین محصولات و سوغات سنتی", icon: IconLeaf, tone: "green" },
  { title: "دوره ها و آموزش ها", text: "دوره های علمی آموزش طب خیر", icon: IconBook2, tone: "blue" },
  { title: "پشتیبانی و مشاوره آنلاین", text: "با کارشناسان ما در ارتباط باشید", icon: IconUserCircle, tone: "purple" },
  { title: "تضمین کیفیت محصولات", text: "بهترین محصولات اصیل و با کیفیت", icon: IconBox, tone: "orange" },
];

const products = [
  { name: "عسل طبیعی کوهستان", price: "۲۸۵,۰۰۰ تومان", tag: "محبوب", image: productImages[0] },
  { name: "دمنوش گیاهی آرامش", price: "۱۶۵,۰۰۰ تومان", tag: "جدید", image: productImages[1] },
  { name: "اسطوخودوس اعلا", price: "۱۲۵,۰۰۰ تومان", tag: "ویژه", image: productImages[2] },
  { name: "سیاه دانه خالص", price: "۱۹۵,۰۰۰ تومان", tag: "اصیل", image: productImages[3] },
];

function HeroBanner() {
  return (
    <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>به فروشگاه اینترنتی طب خیر خوش آمدید</span>
        <h1>سلامت، آرامش و زندگی بهتر<br />با محصولاتی با کیفیت ما</h1>
        <p>ما در طب خیر با ارائه محصولات متنوع و باکیفیت، به بهبود سبک زندگی شما کمک می‌کنیم.</p>
        <Button component={Link} href="/category/all" className={styles.primaryButton} rightSection={<IconArrowLeft size={18} />}>
          مشاهده محصولات
        </Button>
      </div>
      <div className={styles.heroBenefits}>
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
    <div className={styles.benefit}>
      <Icon size={27} stroke={1.7} />
      <span>{title}</span>
      <small>{text}</small>
    </div>
  );
}

function QuickServices() {
  return (
    <section className={styles.servicesGrid} aria-label="خدمات طب خیر">
      {quickServices.map(({ title, text, icon: Icon, tone }) => (
        <Link href="/about" key={title} className={`${styles.serviceCard} ${styles[tone]}`}>
          <div className={styles.serviceIcon}><Icon size={24} stroke={1.8} /></div>
          <div><h2>{title}</h2><p>{text}</p></div>
          <span className={styles.circleArrow}><IconArrowLeft size={15} /></span>
        </Link>
      ))}
    </section>
  );
}

function NaturalProductsBanner() {
  return (
    <section className={styles.naturalBanner} style={{ backgroundImage: `url(${naturalImage})` }}>
      <div className={styles.naturalShade} />
      <div className={styles.naturalContent}>
        <span>سلامتی واقعی از دل طبیعت</span>
        <h2>محصولات طبیعی و ارگانیک</h2>
        <p>انتخابی سالم برای زندگی بهتر شما</p>
        <Button component={Link} href="/category/all" className={styles.greenButton} rightSection={<IconArrowLeft size={18} />}>مشاهده محصولات</Button>
        <div className={styles.naturalFeatures}><span><IconShieldCheck size={20} /> کیفیت تضمینی</span><span><IconLeaf size={20} /> محصولات ارگانیک</span><span><IconMedicineSyrup size={20} /> تشخیص اصالت</span></div>
      </div>
    </section>
  );
}

function AppSection() {
  return (
    <section className={styles.appSection}>
      <div className={styles.appImageWrap}><img src={appImage} alt="محصولات گیاهی طب خیر" /></div>
      <div className={styles.appCopy}>
        <span className={styles.eyebrow}>همراه همیشگی سلامتی شما</span>
        <h2>اپلیکیشن طب خیر</h2>
        <p>با دریافت اپلیکیشن طب خیر، می‌توانید با استفاده از گوشی همراه به راحتی در هر مکان و هر زمان از امکانات مجموعه آموزشی و فروشگاه گیاهان دارویی بهره‌مند شوید.</p>
        <Button className={styles.primaryButton} rightSection={<IconArrowLeft size={18} />}>دانلود اپلیکیشن طب خیر</Button>
        <div className={styles.appStats}><span><IconBook2 size={22} /> صدها هزار دانشجو</span><span><IconStethoscope size={22} /> هزاران ساعت آموزش</span><span><IconCircleCheck size={22} /> دسترسی آسان و همیشگی</span></div>
      </div>
    </section>
  );
}

function ProductCategories() {
  return (
    <section className={styles.productSection}>
      <div className={styles.sectionHeading}><span>انتخابی برای سبک زندگی سالم</span><h2>دسته‌بندی محصولات</h2><p>محصولات متنوع ما را در دسته‌بندی‌های مختلف مشاهده کنید</p></div>
      <div className={styles.categoryTabs}><Link href="/category/all" className={styles.activeTab}><IconBox size={20} /> محصولات ویژه</Link><Link href="/about"><IconUserCircle size={20} /> خدمات مشاوره</Link><Link href="/about"><IconBook2 size={20} /> دوره های آموزشی</Link><Link href="/category/all"><IconLeaf size={20} /> محصولات گیاهی</Link></div>
      <div className={styles.productGrid}>{products.map((product) => <Link href="/category/all" className={styles.productCard} key={product.name}><div className={styles.productImage}><span>{product.tag}</span><img src={product.image} alt={product.name} /></div><h3>{product.name}</h3><p>{product.price}</p><div className={styles.productFooter}><span>مشاهده محصول</span><IconChevronLeft size={17} /></div></Link>)}</div>
    </section>
  );
}

export function HomePage() {
  return <main className={styles.page}><HeroBanner /><QuickServices /><NaturalProductsBanner /><AppSection /><ProductCategories /></main>;
}

export default function Home() {
  return <HomePage />;
}

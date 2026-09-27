"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@mantine/core";
import {
  IconArrowLeft,
  IconBook2,
  IconBox,
  IconChevronDown,
  IconCircleCheck,
  IconHeadphones,
  IconLeaf,
  IconLock,
  IconMedicineSyrup,
  IconMicroscope,
  IconPhoneCall,
  IconShieldCheck,
  IconStethoscope,
  IconTruckDelivery,
  IconUserCircle,
} from "@tabler/icons-react";
import AppDownloadModal from "@/app/(web)/AppDownloadModal";
import VpnWarning from "@/app/(web)/VpnWarning";
import styles from "./home.module.css";

const heroImage = "/ChatGPT_Image_Sep_22,_2026,_10_51_08_AM.png";
const naturalImage = "/ChatGPT_Image_Sep_14,_2026,_11_47_59_AM.png";
const appImage = "/ChatGPT_Image_Sep_22,_2026,_11_17_00_AM.png";

const quickServices = [
  { title: "محصولات گیاهی و سوغات محلی", text: "بهترین محصولات و سوغات سنتی", icon: IconLeaf, tone: "green" },
  { title: "دوره ها و آموزش ها", text: "دوره های علمی آموزش طِب خیّر", icon: IconBook2, tone: "blue" },
  { title: "پشتیبانی و مشاوره آنلاین", text: "با کارشناسان ما در ارتباط باشید", icon: IconUserCircle, tone: "purple", isSupport: true },
  { title: "تضمین کیفیت محصولات", text: "بهترین محصولات اصیل و با کیفیت", icon: IconBox, tone: "orange" },
];

const consultServices = [
  { title: "ویزیت آنلاین", link: "/service/VISIT" },
  { title: "تفسیر برگه آزمایش و سونوگرافی", link: "/service/EXPLAIN" },
  { title: "تشخیص بیماری ها از روی زبان", link: "/service/IDENTIFY" },
];

const supportOptions = [
  { title: "تماس تلفنی", phone: "04533790667", icon: IconPhoneCall },
  { title: "مشاوره از طریق ایتا", link: "https://eitaa.com/Teb_khayyerr", icon: IconHeadphones },
  { title: "مشاوره از طریق روبیکا", link: "https://rubika.ir/Teb_khayyerr", icon: IconHeadphones },
];

function HeroBanner() {
  return (
    <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }} role="banner">
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>به فروشگاه اینترنتی طِب خیّر خوش آمدید</span>
        <h1>سلامت، آرامش و زندگی بهتر<br />با محصولاتی با کیفیت ما</h1>
        <p>ما در طِب خیّر با ارائه محصولات متنوع و باکیفیت، به بهبود سبک زندگی شما کمک می‌کنیم.</p>
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

function SupportMenu({ cardClass, icon, title, text }: { cardClass: string; icon: typeof IconUserCircle; title: string; text: string }) {
  const [opened, setOpened] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpened(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.supportWrap} ref={ref}>
      <button
        type="button"
        className={`${styles.serviceCard} ${cardClass}`}
        onClick={() => setOpened((v) => !v)}
        aria-label={title}
        aria-expanded={opened}
      >
        <div className={styles.serviceIcon}><Icon size={24} stroke={1.8} aria-hidden="true" /></div>
        <div><h2>{title}</h2><p>{text}</p></div>
        <span className={styles.circleArrow}><IconChevronDown size={15} aria-hidden="true" style={{ transition: "transform .2s", transform: opened ? "rotate(180deg)" : "none" }} /></span>
      </button>
      {opened && (
        <div className={styles.supportMenu}>
          {supportOptions.map((opt, i) => {
            const OptIcon = opt.icon;
            if (opt.phone) {
              return (
                <a key={i} href={`tel:${opt.phone}`} className={styles.supportMenuItem}>
                  <OptIcon size={20} aria-hidden="true" />
                  <span>{opt.title}</span>
                  <small dir="ltr">{opt.phone}</small>
                </a>
              );
            }
            return (
              <a key={i} href={opt.link} target="_blank" rel="noreferrer" className={styles.supportMenuItem}>
                <OptIcon size={20} aria-hidden="true" />
                <span>{opt.title}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuickServices() {
  return (
    <section className={styles.servicesGrid} aria-label="خدمات طِب خیّر">
      {quickServices.map(({ title, text, icon: Icon, tone, isSupport }) => {
        if (isSupport) {
          return (
            <SupportMenu
              key={title}
              cardClass={styles[tone]}
              icon={Icon as typeof IconUserCircle}
              title={title}
              text={text}
            />
          );
        }
        return (
          <Link href="/about" key={title} className={`${styles.serviceCard} ${styles[tone]}`} aria-label={title}>
            <div className={styles.serviceIcon}><Icon size={24} stroke={1.8} aria-hidden="true" /></div>
            <div><h2>{title}</h2><p>{text}</p></div>
            <span className={styles.circleArrow}><IconArrowLeft size={15} aria-hidden="true" /></span>
          </Link>
        );
      })}
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

function AppSection({onDownload}: {onDownload: () => void}) {
  return (
    <section className={styles.appSection} aria-label="اپلیکیشن طِب خیّر">
      <div className={styles.appImageWrap}>
        <img src={appImage} alt="اپلیکیشن طِب خیّر" loading="lazy" width="100%" height="100%" />
      </div>
      <div className={styles.appCopy}>
        <span className={styles.eyebrow}>همراه همیشگی سلامتی شما</span>
        <h2>اپلیکیشن طِب خیّر</h2>
        <p>با دریافت اپلیکیشن طِب خیّر، می‌توانید با استفاده از گوشی همراه به راحتی در هر مکان و هر زمان از امکانات مجموعه آموزشی و فروشگاه گیاهان دارویی بهره‌مند شوید.</p>
        <Button className={styles.primaryButton} rightSection={<IconArrowLeft size={18} />} aria-label="دانلود اپلیکیشن طِب خیّر" onClick={onDownload}>
          دانلود اپلیکیشن طِب خیّر
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

function MedicalServices() {
  return (
    <section className={styles.medicalSection} aria-label="خدمات تشخیصی طِب خیّر">
      <div className={styles.sectionHeading}>
        <span>خدمات تخصصی طب سنتی</span>
        <h2>تشخیص و تفسیر آنلاین</h2>
        <p>با ارسال تصویر زبان یا برگه آزمایش، توسط کارشناسان بررسی و تفسیر می‌شود</p>
      </div>
      <div className={styles.medicalGrid}>
        <Link href="/service/IDENTIFY" className={`${styles.medicalCard} ${styles.medicalIdentify}`} aria-label="تشخیص بیماری از روی زبان">
          <div className={styles.medicalIcon}><IconStethoscope size={32} stroke={1.7} aria-hidden="true" /></div>
          <div className={styles.medicalBody}>
            <h2>تشخیص بیماری‌ها از روی زبان</h2>
            <p>جهت ارسال عکس زبان کلیک کنید</p>
          </div>
          <span className={styles.medicalArrow}><IconArrowLeft size={18} aria-hidden="true" /></span>
        </Link>
        <Link href="/service/EXPLAIN" className={`${styles.medicalCard} ${styles.medicalExplain}`} aria-label="تفسیر برگه آزمایش و سونوگرافی">
          <div className={styles.medicalIcon}><IconMicroscope size={32} stroke={1.7} aria-hidden="true" /></div>
          <div className={styles.medicalBody}>
            <h2>تفسیر برگه آزمایش و سونوگرافی</h2>
            <p>جهت تفسیر کلیک کنید</p>
          </div>
          <span className={styles.medicalArrow}><IconArrowLeft size={18} aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  );
}

function ConsultDropdown() {
  const [opened, setOpened] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpened(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.consultWrap} ref={ref}>
      <button
        type="button"
        className={`${styles.categoryTab} ${styles.consultTab}`}
        onClick={() => setOpened((v) => !v)}
        aria-label="خدمات مشاوره"
        aria-expanded={opened}
      >
        <IconUserCircle size={20} aria-hidden="true" /> خدمات مشاوره
        <IconChevronDown size={16} aria-hidden="true" style={{ transition: "transform .2s", transform: opened ? "rotate(180deg)" : "none" }} />
      </button>
      {opened && (
        <div className={styles.consultMenu}>
          {consultServices.map((s, i) => (
            <Link key={i} href={s.link} className={styles.consultMenuItem} onClick={() => setOpened(false)}>
              {s.title}
              <IconArrowLeft size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
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
        <ConsultDropdown />
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
  const [downloadOpened, setDownloadOpened] = useState(false);

  return (
    <main className={styles.page}>
      <VpnWarning />
      <HeroBanner />
      <QuickServices />
      <NaturalProductsBanner />
      <MedicalServices />
      <AppSection onDownload={() => setDownloadOpened(true)} />
      <ProductCategories />
      <AppDownloadModal opened={downloadOpened} onClose={() => setDownloadOpened(false)} />
    </main>
  );
}

export default function Home() {
  return <HomePage />;
}

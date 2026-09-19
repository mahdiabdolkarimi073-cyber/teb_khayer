"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import {
  IconArrowLeft,
  IconBook2,
  IconLeaf,
  IconShieldCheck,
} from "@tabler/icons-react";
import styles from "./about.module.css";

const heroImage = "/file_00000000b064820a9cb8bd476301fad1.png";

const cards = [
  {
    icon: IconBook2,
    title: "آموزش تخصصی",
    text: "دوره‌های جامع طب سنتی، حجامت، مزاج‌شناسی، ماساژ درمانی و… در قالب فیلم و فایل PDF.",
  },
  {
    icon: IconLeaf,
    title: "محصولات طبیعی",
    text: "ارائه گیاهان دارویی اصیل و محصولات ارگانیک برای سلامتی جسم و روان.",
  },
  {
    icon: IconShieldCheck,
    title: "تضمین کیفیت",
    text: "کادر مجرب و تاییدیه‌های مجاز برای دسترسی مطمئن به خدمات و محصولات.",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} style={{ backgroundImage: `linear-gradient(135deg, rgba(228,243,255,.92) 0%, rgba(250,253,255,.86) 55%, rgba(232,247,239,.9) 100%), url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>مجموعه آموزشی طب خیر</span>
          <h1 className={styles.title}>آموزش جامع طب سنتی<br />با کادری مجرب و متخصص</h1>
          <p className={styles.lead}>
            مجموعه بزرگ طب خیر با همراهی کادر مجرب متشکل از پزشک عمومی، طبیب و استاد حاذق طب سنتی و طب ایرانی اسلامی و کارشناسان حوزه طب سنتی، نمایندگان مجاز و مربیان دارای مجوز، تدابیری خاص فراهم نموده است تا مردم ایران زمین و کشورهای دوست و همسایه بتوانند ضمن دریافت دوره‌های آموزشی تخصصی و فرادرسی مشتمل بر آموزش مجازی طب سنتی، حجامت، مزاج‌شناسی، ماساژ درمانی و… از خواص بیشمار گیاهان دارویی نیز برای سالمتی جسم و روان خویش بهره‌مند شوند.
          </p>
          <div className={styles.actions}>
            <Button component={Link} href="/category/all" className={styles.primary} rightSection={<IconArrowLeft size={18} />} radius="xl" size="lg">
              مشاهده دوره‌ها
            </Button>
            <Button component={Link} href="/contact" variant="outline" className={styles.secondary} radius="xl" size="lg">
              ارتباط با ما
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.story}>
        <span className={styles.sectionLabel}>درباره ما</span>
        <h2 className={styles.sectionTitle}>آموزش طب سنتی در کنار محصولات طبیعی</h2>
        <p className={styles.storyText}>
          همان‌طور که مستحضرید، طب سنتی و روایی که مورد تایید حکیم خیراندیش، دکتر روازاده و آیت‌الله تبریزیان نیز هست، نعمتی ارزشمند برای درمان بیماری‌های سخت می‌باشد. مجموعه طب خیر دوره‌هایی چون حجامت خشک و تر، فصد، مزاج‌شناسی، ماساژ درمانی، آشنایی با اسکلت و عضلات بدن، آموزش هزار سوال و پاسخ آزمون مربی‌گری ماساژ، زبان‌شناسی، کف‌شناسی، گوش‌شناسی، ناخ‌شناسی، ناف‌شناسی، چهره‌شناسی، طب سوزنی، زالودرمانی، کایروپراکتیک، شناخت گیاهان دارویی، آزمایش‌خوانی، لاغری و… را در اختیار کاربران محترم قرار داده است تا با پرداخت کمترین هزینه ممکن از طریق اپلیکیشن طب خیر بتوانند به دانش علمی و عملی خود بیافزایند.
        </p>
        <div className={styles.cards}>
          {cards.map(({ icon: Icon, title, text }) => (
            <div className={styles.card} key={title}>
              <div className={styles.icon}><Icon size={24} stroke={1.8} /></div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardText}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

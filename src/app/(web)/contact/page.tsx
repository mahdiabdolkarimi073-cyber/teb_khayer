"use client";

import React from "react";
import {
  IconMapPin,
  IconPhoneCall,
  IconMail,
} from "@tabler/icons-react";
import styles from "./contact.module.css";
import AppConfig from "@/config/AppConfig";
import { socialsNames } from "@/app/(web)/contact/socials";

const heroImage = "/ChatGPT_Image_Sep_22,_2026,_10_51_08_AM.png";

export function ContactUs() {
  const contactEntries = Object.entries(AppConfig.contact);

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>ما اینجاییم تا به شما کمک کنیم</span>
          <h1>ارتباط با ما</h1>
          <p>
            هرگونه سوال، پیشنهاد یا انتقادی دارید، خوشحال می‌شویم با ما در میان بگذارید.
            کارشناسان طب خیر آماده پاسخگویی به شما هستند.
          </p>
        </div>
      </section>

      {/* Map + Socials */}
      <div className={styles.shell}>
        {/* Map */}
        <div className={styles.mapWrap}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1600903.7788177046!2d46.782780605598724!3d38.40067786579188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40187bd58365be6f%3A0xa184329c761eafd5!2sArdabil%20Province%2C%20Iran!5e0!3m2!1sen!2sde!4v1708017327161!5m2!1sen!2sde"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="نقشه موقعیت طب خیر"
          />
        </div>

        {/* Socials */}
        <div className={styles.socialsSide}>
          <span className={styles.sectionLabel}>شبکه‌های اجتماعی</span>
          <h2 className={styles.sectionTitle}>ما را دنبال کنید</h2>
          <p className={styles.sectionDesc}>
            برای دریافت آخرین مطالب و دوره‌ها، در شبکه‌های اجتماعی ما را دنبال کنید
            و از طریق هر یک از پلتفرم‌های زیر با ما در ارتباط باشید.
          </p>

          <div className={styles.socialsGrid}>
            {contactEntries.map(([key, link]) => {
              const upperKey = key.toUpperCase() as keyof typeof socialsNames;
              const name = socialsNames[upperKey] || key;
              const username = link?.split?.("/")?.pop()?.split(":")?.pop() || "";

              return (
                <a
                  key={key}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialCard}
                >
                  <SocialBadge socialKey={upperKey} />
                  <div className={styles.socialInfo}>
                    <p className={styles.socialName}>{name}</p>
                    <span className={styles.socialHint}>
                      {username.length > 22 ? username.slice(0, 22) + "…" : username || "جهت مکالمه کلیک کنید"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className={styles.infoStrip}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon} style={{ background: "#1468d8" }}>
            <IconPhoneCall aria-hidden="true" />
          </div>
          <div>
            <p className={styles.infoLabel}>شماره تماس</p>
            <p className={styles.infoValue} dir="ltr">045-33790667</p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon} style={{ background: "#18a56d" }}>
            <IconMapPin aria-hidden="true" />
          </div>
          <div>
            <p className={styles.infoLabel}>آدرس</p>
            <p className={styles.infoValue}>استان اردبیل، ایران</p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon} style={{ background: "#ed812d" }}>
            <IconMail aria-hidden="true" />
          </div>
          <div>
            <p className={styles.infoLabel}>ایمیل</p>
            <p className={styles.infoValue} dir="ltr">tebkhayyer.1358@gmail.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SocialBadge({ socialKey }: { socialKey: string }) {
  const iconMap: Record<string, string> = {
    GMAIL: "/icons/gmail.webp",
    INSTAGRAM: "/icons/ins.webp",
    WHATSAPP: "/icons/whatsapp.webp",
    TELEGRAM: "/icons/telegram.webp",
    FACEBOOK: "/icons/facebook.webp",
    TWITTER: "/icons/x.webp",
    RUBIKA: "/icons/rubika.webp",
    EITAA: "/banners/eitaa.webp",
    WECHAT: "/icons/wechat.webp",
  };

  const src = iconMap[socialKey];
  if (src) {
    return (
      <div className={styles.socialIcon}>
        <img loading="lazy" src={src} alt={socialKey} />
      </div>
    );
  }

  return (
    <div className={styles.socialIcon}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#1468d8" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </div>
  );
}

export default ContactUs;

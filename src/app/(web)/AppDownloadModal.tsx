"use client";

import {useEffect} from "react";
import {IconBrandAndroid, IconBrandApple, IconCheck, IconDownload, IconX} from "@tabler/icons-react";
import AppConfig from "@/config/AppConfig";
import styles from "./AppDownloadModal.module.css";

const androidUrl = "https://teb-khayyer.ir/api/file/app.apk";
const phoneImage = "/طب_خیر.jpg";

type AppDownloadModalProps = {
  opened: boolean;
  onClose: () => void;
};

export default function AppDownloadModal({opened, onClose}: AppDownloadModalProps) {
  useEffect(() => {
    if (!opened) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [opened, onClose]);

  if (!opened) return null;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="app-download-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="بستن پنجره">
          <IconX size={22} />
        </button>
        <div className={styles.phonePanel}>
          <img className={styles.phoneArtwork} src={phoneImage} alt="نمایش اپلیکیشن طب خیر روی موبایل" />
        </div>
        <div className={styles.content} dir="rtl">
          <span className={styles.kicker}>یک قدم تا سلامتی بیشتر</span>
          <h2 id="app-download-title">اپلیکیشن طب سنتی طِب خّیر همیشه همراه شماست</h2>
          <p>با اپلیکیشن طِب خّیر پزشک خودت باش و به هزاران ساعت محتوای اموزشی،دوره های تخصصی و منابع معتبر طب سنتی در دسترس داشته باشید</p>
          <div className={styles.benefits}>
            <span><IconCheck size={17} /> دسترسی سریع و آسان</span>
            <span><IconCheck size={17} /> استفاده در هر زمان و مکان</span>
            <span><IconCheck size={17} /> تجربه‌ای روان‌تر از وب‌سایت</span>
          </div>
          <div className={styles.platformActions}>
            <a className={styles.downloadButton} href={androidUrl} download>
              <IconBrandAndroid size={21} />
              <span>دانلود نسخه اندروید از سایت</span>
            </a>
            <button type="button" className={styles.storeButton} onClick={onClose}>
              <IconBrandApple size={21} />
              <span>دانلود نسخه آیفون از سایت</span>
            </button>
          </div>
          <div className={styles.platforms}>
            <span><IconDownload size={16} /> دانلود رایگان و سریع</span>
          </div>
        </div>
      </div>
    </div>
  );
}

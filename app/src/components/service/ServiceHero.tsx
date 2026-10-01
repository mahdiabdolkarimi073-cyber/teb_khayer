import React from "react";
import classes from "./ServiceHero.module.css";

const ServiceHero = (props: { title: string; serviceKey?: string; children?: React.ReactNode }) => {
  const isIdentify = props.serviceKey === "IDENTIFY";
  const isVisit = props.serviceKey === "VISIT";
  const image = isIdentify
    ? "/Screenshot_۲۰۲۶۰۹۲۷_۱۰۲۹۵۵_Gallery.jpg"
    : isVisit
      ? "/Online-visit-services2.webp"
      : "/ChatGPT_Image_Sep_19,_2026,_11_41_28_AM.png";
  const description = isIdentify
    ? "تصویر زبان خود را ارسال کنید و برای شناخت بهتر نشانه‌های احتمالی بدن، راهنمایی دریافت کنید."
    : isVisit
      ? "در هر زمان و هر مکان، با پزشک مورد اعتماد خود به‌صورت آنلاین در ارتباط باشید."
      : "نتیجه آزمایش و سونوگرافی خود را با آگاهی بیشتری بشناسید و برای دریافت راهنمایی دقیق اقدام کنید.";

  return (
    <section className={classes.hero} aria-labelledby="service-hero-title">
      <img className={classes.image} src={image} alt={props.title.replace(/\n/g, " ")} />
      <div className={classes.overlay} />
      <div className={classes.content}>
        <span className={classes.eyebrow}>خدمات تخصصی سلامت</span>
        <h1 id="service-hero-title" className={classes.title}>{props.title}</h1>
        <p className={classes.description}>{description}</p>
        {props.children && <div className={classes.actions}>{props.children}</div>}
      </div>
      <div className={classes.badges} aria-label="ویژگی‌های خدمت">
        <span className={classes.badge}>بررسی دقیق نتایج</span>
        <span className={classes.badge}>پاسخ‌گویی آنلاین</span>
        <span className={classes.badge}>راهنمایی قابل فهم</span>
      </div>
    </section>
  );
};

export default ServiceHero;

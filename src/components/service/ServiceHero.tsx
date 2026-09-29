import React from "react";
import classes from "./ServiceHero.module.css";

const ServiceHero = (props: { title: string; children?: React.ReactNode }) => {
  return (
    <section className={classes.hero} aria-labelledby="service-hero-title">
      <img
        className={classes.image}
        src="/تفسیر-برگه-آزمایش-خون-2.jpg"
        alt="تفسیر برگه آزمایش خون و سونوگرافی"
      />
      <div className={classes.overlay} />
      <div className={classes.content}>
        <span className={classes.eyebrow}>خدمات تخصصی سلامت</span>
        <h1 id="service-hero-title" className={classes.title}>{props.title}</h1>
        <p className={classes.description}>
          نتیجه آزمایش و سونوگرافی خود را با آگاهی بیشتری بشناسید و برای دریافت راهنمایی دقیق اقدام کنید.
        </p>
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

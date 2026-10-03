import { notFound } from "next/navigation";
import SouvenirProductView from "@/app/(web)/souvenirs/SouvenirProductView";
import { getSouvenirProductCount, getSouvenirProducts, SortOption } from "@/app/(web)/souvenirs/action";
import { getVar } from "@backend/utils/setting";
import styles from "./souvenirs.module.css";

const validSorts: SortOption[] = ["new", "priceLow", "priceHigh", "bestSeller", "discount", "special"];

const Page = async (props: any) => {
  const search = props.searchParams.query;
  const sortRaw = props.searchParams.sort as string | undefined;
  const sort: SortOption = validSorts.includes(sortRaw as SortOption) ? (sortRaw as SortOption) : "new";

  const products = await getSouvenirProducts(0, search, undefined, sort);
  if (!products) {
    notFound();
    return;
  }
  const saleEnabled = (await getVar<string>("PRODUCTS_SALE_ENABLED")) !== "false";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroImage} src="/ChatGPT_Image_Sep_14,_2026,_11_49_32_AM.png" alt="سوغات محلی طِب خیّر" />
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>اصالت و سنت در سوغات محلی</span>
            <h1 className={styles.heroTitle}>سوغات محلی طِب خیّر</h1>
            <p className={styles.heroSubtitle}>بهترین سوغات سنتی و محلی اردبیل با کیفیت تضمینی</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#products">مشاهده همه سوغات</a>
              <a className={styles.secondaryButton} href="#categories">پیشنهادهای ویژه</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.benefits} aria-label="مزایای خرید">
        <div className={styles.benefit}><span className={styles.benefitIcon}>✓</span><span><strong>ضمانت اصالت کالا</strong><small>خریدی مطمئن و باکیفیت</small></span></div>
        <div className={styles.benefit}><span className={styles.benefitIcon}>▣</span><span><strong>پرداخت امن</strong><small>با درگاه‌های معتبر بانکی</small></span></div>
        <div className={styles.benefit}><span className={styles.benefitIcon}>⇢</span><span><strong>ارسال سریع</strong><small>به تمام نقاط کشور</small></span></div>
        <div className={styles.benefit}><span className={styles.benefitIcon}>◉</span><span><strong>پشتیبانی ۲۴ ساعته</strong><small>پاسخ‌گویی در همه روزها</small></span></div>
      </section>

      <SouvenirProductView
        id="products"
        search={search}
        sort={sort}
        products={products}
        count={await getSouvenirProductCount(search, sort)}
        saleEnabled={saleEnabled}
      />
    </main>
  );
};

export default Page;

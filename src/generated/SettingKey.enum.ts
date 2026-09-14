
  const SettingKeyEnum = { 
  VERCODE_EXPIRE_MINUTES: "مدت زمان اعتبار کد تایید به دقیقه",
  MAIN_PHONE: "شماره تلفن ثابت",
  PRODUCT_POST_FEE: "هزینه ارسال پست (تومان)",
  PRODUCT_BOX_FEE: "هزینه بسته بندی (تومان)",
  PRODUCTS_SALE_ENABLED: "فروش محصولات فعال است",
  TRUST_ENAMAD: "متن نماد اعتماد الکترونیکی",
  TRUST_BANK_ACCOUNT: "حساب بانکی طب خیر",
  TRUST_ADDRESS: "آدرس",
  TRUST_WEBSITE: "آدرس وب‌سایت"
 }
  export type SettingKeyEnumType = typeof SettingKeyEnum;
  export const SettingKeyInfo = {
  VERCODE_EXPIRE_MINUTES: {
    name: "مدت زمان اعتبار کد تایید به دقیقه",
    default: 5
  },
  MAIN_PHONE: {
    name: "شماره تلفن ثابت",
    default: "045-33790667"
  },
  PRODUCT_POST_FEE: {
    name: "هزینه ارسال پست (تومان)",
    default: 36000
  },
  PRODUCT_BOX_FEE: {
    name: "هزینه بسته بندی (تومان)",
    default: 36000
  },
  PRODUCTS_SALE_ENABLED: {
    name: "فروش محصولات فعال است",
    default: "true"
  },
  TRUST_ENAMAD: {
    name: "متن نماد اعتماد الکترونیکی",
    default: "طب خیر دارای نماد الکترونیکی (اینماد) از وزارت صنعت، معدن و تجارت می‌باشد. این نماد نشان‌دهنده اصالت و اعتبار فروشگاه آنلاین ماست."
  },
  TRUST_BANK_ACCOUNT: {
    name: "حساب بانکی طب خیر",
    default: "بانک ملت - به نام بهزاد خیّر - شماره کارت: 6104-xxxx-xxxx-xxxx"
  },
  TRUST_ADDRESS: {
    name: "آدرس",
    default: "آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳"
  },
  TRUST_WEBSITE: {
    name: "آدرس وب‌سایت",
    default: "https://teb-khayyer.ir"
  }
}
  export default SettingKeyEnum;

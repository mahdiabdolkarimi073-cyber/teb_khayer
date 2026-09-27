
  const SettingKeyEnum = { 
  VERCODE_EXPIRE_MINUTES: "مدت زمان اعتبار کد تایید به دقیقه",
  MAIN_PHONE: "شماره تلفن ثابت",
  PRODUCT_POST_FEE: "هزینه ارسال پست (تومان)",
  PRODUCT_BOX_FEE: "هزینه بسته بندی (تومان)",
  PRODUCTS_SALE_ENABLED: "فروش محصولات فعال است",
  TRUST_ENAMAD: "متن نماد اعتماد الکترونیکی",
  TRUST_BANK_ACCOUNT: "حساب بانکی طِب خیّر",
  TRUST_ADDRESS: "آدرس",
  TRUST_WEBSITE: "آدرس وب‌سایت",
  BASALAM_LINK: "لینک باسلام",
  TOROB_ENABLED: "ترب فعال است",
  TOROB_SHOP_NAME: "نام فروشگاه در ترب",
  TOROB_LINK: "لینک فروشگاه در ترب",
  BASALAM_ENABLED: "باسلام فعال است",
  BASALAM_CLIENT_ID: "Client ID باسلام",
  BASALAM_CLIENT_SECRET: "Client Secret باسلام",
  BASALAM_ACCESS_TOKEN: "Access Token باسلام",
  BASALAM_REFRESH_TOKEN: "Refresh Token باسلام",
  BASALAM_BOOTH_ID: "شناسه غرفه باسلام",
  BASALAM_PAT_TOKEN: "توکن شخصی باسلام (PAT)"
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
    default: "طِب خیّر دارای نماد الکترونیکی (اینماد) از وزارت صنعت، معدن و تجارت می‌باشد. این نماد نشان‌دهنده اصالت و اعتبار فروشگاه آنلاین ماست."
  },
  TRUST_BANK_ACCOUNT: {
    name: "حساب بانکی طِب خیّر",
    default: "بانک ملت - به نام بهزاد خیّر - شماره کارت: 6104-xxxx-xxxx-xxxx"
  },
  TRUST_ADDRESS: {
    name: "آدرس",
    default: "آدرس: تهران، خیابان ولیعصر، پلاک ۱۲۳"
  },
  TRUST_WEBSITE: {
    name: "آدرس وب‌سایت",
    default: "https://teb-khayyer.ir"
  },
  BASALAM_LINK: {
    name: "لینک باسلام",
    default: ""
  },
  TOROB_ENABLED: {
    name: "ترب فعال است",
    default: "false"
  },
  TOROB_SHOP_NAME: {
    name: "نام فروشگاه در ترب",
    default: ""
  },
  TOROB_LINK: {
    name: "لینک فروشگاه در ترب",
    default: ""
  },
  BASALAM_ENABLED: {
    name: "باسلام فعال است",
    default: "false"
  },
  BASALAM_CLIENT_ID: {
    name: "Client ID باسلام",
    default: ""
  },
  BASALAM_CLIENT_SECRET: {
    name: "Client Secret باسلام",
    default: ""
  },
  BASALAM_ACCESS_TOKEN: {
    name: "Access Token باسلام",
    default: ""
  },
  BASALAM_REFRESH_TOKEN: {
    name: "Refresh Token باسلام",
    default: ""
  },
  BASALAM_BOOTH_ID: {
    name: "شناسه غرفه باسلام",
    default: ""
  },
  BASALAM_PAT_TOKEN: {
    name: "توکن شخصی باسلام (PAT)",
    default: ""
  }
}
  export default SettingKeyEnum;

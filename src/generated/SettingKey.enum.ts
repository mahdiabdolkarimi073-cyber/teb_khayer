
  const SettingKeyEnum = { 
  VERCODE_EXPIRE_MINUTES: "مدت زمان اعتبار کد تایید به دقیقه",
  MAIN_PHONE: "شماره تلفن ثابت",
  PRODUCT_POST_FEE: "هزینه ارسال پست (تومان)",
  PRODUCT_BOX_FEE: "هزینه بسته بندی (تومان)"
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
  }
}
  export default SettingKeyEnum;
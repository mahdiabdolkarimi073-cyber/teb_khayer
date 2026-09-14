
  const ServiceTypeEnum = { 
  EXPLAIN: "تفسیر برگه آزمایش\nتفسیر سونوگرافی",
  IDENTIFY: "تشخیص بیماری",
  VISIT: "ویزیت آنلاین"
 }
  export type ServiceTypeEnumType = typeof ServiceTypeEnum;
  export const ServiceTypeInfo = {
  EXPLAIN: {
    name: "تفسیر برگه آزمایش\nتفسیر سونوگرافی"
  },
  IDENTIFY: {
    name: "تشخیص بیماری"
  },
  VISIT: {
    name: "ویزیت آنلاین"
  }
}
  export default ServiceTypeEnum;
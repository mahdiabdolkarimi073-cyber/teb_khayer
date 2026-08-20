
  const ServiceTypeEnum = { 
  EXPLAIN: "برگه آزمایش سونوگرافی",
  IDENTIFY: "تشخیص بیماری",
  VISIT: "ویزیت آنلاین"
 }
  export type ServiceTypeEnumType = typeof ServiceTypeEnum;
  export const ServiceTypeInfo = {
  EXPLAIN: {
    name: "برگه آزمایش سونوگرافی"
  },
  IDENTIFY: {
    name: "تشخیص بیماری"
  },
  VISIT: {
    name: "ویزیت آنلاین"
  }
}
  export default ServiceTypeEnum;
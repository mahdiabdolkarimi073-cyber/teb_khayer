
  const OrderStatusEnum = { 
  PENDING: "درحال آماده سازی سفارش شما هستیم",
  SENDED: "سفارش شما تحویل پست یا تیپاکس شد",
  DELAY: "کد رهگیری پیامک شده توسط پست یا تیپاکس را وارد سامانه مذکورکرده و پیگیری نمایید",
  CANCELED: "سفارش شما لغو شد"
 }
  export type OrderStatusEnumType = typeof OrderStatusEnum;
  export const OrderStatusInfo = {
  PENDING: {
    name: "درحال آماده سازی سفارش شما هستیم"
  },
  SENDED: {
    name: "سفارش شما تحویل پست یا تیپاکس شد"
  },
  DELAY: {
    name: "کد رهگیری پیامک شده توسط پست یا تیپاکس را وارد سامانه مذکورکرده و پیگیری نمایید"
  },
  CANCELED: {
    name: "سفارش شما لغو شد"
  }
}
  export default OrderStatusEnum;
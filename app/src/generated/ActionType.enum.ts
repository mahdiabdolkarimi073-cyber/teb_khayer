
  const ActionTypeEnum = { 
  CREATE_MODEL: "CREATE_MODEL",
  CHANGE_MODEL: "CHANGE_MODEL",
  CREATE_MANY: "CREATE_MANY"
 }
  export type ActionTypeEnumType = typeof ActionTypeEnum;
  export const ActionTypeInfo = {
  CREATE_MODEL: {},
  CHANGE_MODEL: {},
  CREATE_MANY: {}
}
  export default ActionTypeEnum;
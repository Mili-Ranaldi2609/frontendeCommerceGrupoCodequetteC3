export enum IEnumTalle {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  TALLE_25 = "TALLE_25",
  TALLE_26 = "TALLE_26",
  TALLE_27 = "TALLE_27",
  TALLE_28 = "TALLE_28",
  TALLE_29 = "TALLE_29",
  TALLE_30 = "TALLE_30",
  TALLE_31 = "TALLE_31",
  TALLE_32 = "TALLE_32",
  TALLE_33 = "TALLE_33",
  TALLE_34 = "TALLE_34",
  TALLE_35 = "TALLE_35",
  TALLE_36 = "TALLE_36",
  TALLE_37 = "TALLE_37",
  TALLE_38 = "TALLE_38",
  TALLE_39 = "TALLE_39",
  TALLE_40 = "TALLE_40",
  TALLE_41 = "TALLE_41",
  TALLE_42 = "TALLE_42",
  TALLE_43 = "TALLE_43",
  TALLE_44 = "TALLE_44",
  TALLE_45 = "TALLE_45",
  TALLE_46 = "TALLE_46",
  TALLE_47 = "TALLE_47",
  TALLE_48 = "TALLE_48",
  TALLE_49 = "TALLE_49",
  TALLE_50 = "TALLE_50",
  TALLE_51 = "TALLE_51",
  TALLE_52 = "TALLE_52"
}
export const TALLAS_ROPA: IEnumTalle[] = [IEnumTalle.S, IEnumTalle.M, IEnumTalle.L, IEnumTalle.XL];

export const TALLAS_CALZADO: IEnumTalle[] = [
  IEnumTalle.TALLE_25, IEnumTalle.TALLE_26, IEnumTalle.TALLE_27, IEnumTalle.TALLE_28,
  IEnumTalle.TALLE_29, IEnumTalle.TALLE_30, IEnumTalle.TALLE_31, IEnumTalle.TALLE_32,
  IEnumTalle.TALLE_33, IEnumTalle.TALLE_34, IEnumTalle.TALLE_35, IEnumTalle.TALLE_36,
  IEnumTalle.TALLE_37, IEnumTalle.TALLE_38, IEnumTalle.TALLE_39, IEnumTalle.TALLE_40,
  IEnumTalle.TALLE_41, IEnumTalle.TALLE_42, IEnumTalle.TALLE_43, IEnumTalle.TALLE_44,
  IEnumTalle.TALLE_45, IEnumTalle.TALLE_46, IEnumTalle.TALLE_47, IEnumTalle.TALLE_48,
  IEnumTalle.TALLE_49, IEnumTalle.TALLE_50, IEnumTalle.TALLE_51, IEnumTalle.TALLE_52
];

export const ALL_TALLAS: IEnumTalle[] = Object.values(IEnumTalle).filter(value => typeof value === 'string') as IEnumTalle[];


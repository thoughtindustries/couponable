type Variation = {
  priceInCents?: number
}

type Coupon = {
  percentOff?: number,
  amountOffInCents?: number,
  duration?: string,
  durationInMonths?: number
}

export type OrderItem = {
  total?: number,
  quantity?: number,
  priceInCents: number,
  variation?: Variation,
  purchasableType?: string,
  coupon?: Coupon,
  interval?: string,
  gift?: boolean
}

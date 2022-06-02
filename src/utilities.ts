import { OrderItem } from "./types";

// if the comma or decimal portions of the price need internationalization
// then considering switching to numbro or formatjs
function priceFormat(amountInCents: number, currencySymbol?: string) {
  currencySymbol = currencySymbol || '$';
  return currencySymbol + (amountInCents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function discountable(
  amountInCents: number, 
  percentOff?: number, 
  amountOffInCents?: number
) {
  let discount = 0;

  if (percentOff) {
    discount = amountInCents * percentOff / 100;
  } else if (amountOffInCents) {
    discount = amountOffInCents;
  }

  discount = Math.abs(discount);

  const appliedDiscount = amountInCents - discount;

  if (appliedDiscount <= 0) {
    return 0;
  } else {
    return appliedDiscount;
  }
}

export function totalDueNow({
  total,
  quantity = 0,
  priceInCents,
  variation,
  coupon,
  purchasableType
}: OrderItem) {
  if (total) {
    return total;
  }

  let finalQuantity = quantity;
  let finalTotal = priceInCents;

  finalTotal += variation?.priceInCents || 0;

  if (coupon) {
    if (purchasableType === 'bundle' && finalQuantity > 1) {
      finalTotal = finalTotal * finalQuantity;
      finalQuantity = 1;
    }
    finalTotal = Math.round(discountable(finalTotal, coupon.percentOff, coupon.amountOffInCents));
  }

  return finalTotal * finalQuantity;
}

// TODO: figure out i18n story here
export function totalLineOne(orderItem: OrderItem, currencySymbol?: string) {
  var total, totalWithInterval;
  if (totalDueNow(orderItem) === 0) {
    total = totalWithInterval = 'Free';
  } else {
    total = priceFormat(totalDueNow(orderItem), currencySymbol);
    totalWithInterval = total + ' / ' + orderItem.interval;
  }

  if (orderItem.purchasableType === 'bundle' && !orderItem.gift) {
    if (orderItem.coupon && orderItem.coupon.duration === 'repeating') {
      return totalWithInterval + ' for the first ' + orderItem.coupon.durationInMonths + ' months';
    } else if (orderItem.coupon && orderItem.coupon.duration === 'once') {
      return total + ' for the first ' + orderItem.interval;
    } else {
      return totalWithInterval;
    }
  } else {
    return total;
  }
}

export function totalLineTwo(orderItem: OrderItem, currencySymbol?: string) {
  if (orderItem.purchasableType === 'bundle' && !orderItem.gift && orderItem.coupon && orderItem.coupon.duration !== 'forever') {
    return priceFormat(totalRecurring(orderItem), currencySymbol) + ' / ' + orderItem.interval;
  } else {
    return null;
  }
}

export function totalDescription(orderItem: OrderItem, currencySymbol?: string) {
  var lineOne = totalLineOne(orderItem, currencySymbol),
    lineTwo = totalLineTwo(orderItem, currencySymbol);

  if (lineTwo) {
    return lineOne + ', then ' + lineTwo;
  } else {
    return lineOne;
  }
}

export function totalRecurring(orderItem: OrderItem) {
  if (orderItem.purchasableType === 'bundle') {
    if (orderItem.coupon && orderItem.coupon.duration === 'forever') {
      // 'due now' discount applies forever
      return totalDueNow(orderItem);
    } else {
      return orderItem.priceInCents * (orderItem.quantity || 1);
    }
  } else {
    return 0;
  }
}

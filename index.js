// if the comma or decimal portions of the price need internationalization
// then considering switching to numbro or formatjs
function priceFormat(amountInCents, currencySymbol) {
  currencySymbol = currencySymbol || '$';
  return currencySymbol + (amountInCents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function discountable(amountInCents, percentOff, amountOffInCents) {
  var discount, appliedDiscount;

  if (percentOff) {
    discount = amountInCents * percentOff / 100;
  } else if (amountOffInCents) {
    discount = amountOffInCents;
  } else {
    discount = 0;
  }

  discount = Math.abs(discount);

  appliedDiscount = amountInCents - discount;

  if (appliedDiscount <= 0) {
    return 0;
  } else {
    return appliedDiscount;
  }
}

function totalDueNow(orderItem) {
  if (orderItem.total) {
    return orderItem.total;
  } else {
    var quantity = orderItem.quantity || 0,
      total = orderItem.priceInCents;

    if (orderItem.variation) {
      total += orderItem.variation.priceInCents || 0;
    }

    if (orderItem.coupon) {
      total = Math.round(discountable(total, orderItem.coupon.percentOff, orderItem.coupon.amountOffInCents));
    }

    return total * quantity;
  }
}

// TODO: figure out i18n story here
function totalLineOne(orderItem, currencySymbol) {
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

function totalLineTwo(orderItem, currencySymbol) {
  if (orderItem.purchasableType === 'bundle' && !orderItem.gift && orderItem.coupon && orderItem.coupon.duration !== 'forever') {
    return priceFormat(totalRecurring(orderItem), currencySymbol) + ' / ' + orderItem.interval;
  } else {
    return null;
  }
}

function totalDescription(orderItem, currencySymbol) {
  var lineOne = totalLineOne(orderItem, currencySymbol),
    lineTwo = totalLineTwo(orderItem, currencySymbol);

  if (lineTwo) {
    return lineOne + ', then ' + lineTwo;
  } else {
    return lineOne;
  }
}

function totalRecurring(orderItem) {
  if (orderItem.purchasableType === 'bundle') {
    if (orderItem.coupon && orderItem.coupon.duration === 'forever') {
      // 'due now' discount applies forever
      return totalDueNow(orderItem);
    } else {
      return orderItem.priceInCents;
    }
  } else {
    return null;
  }
}

var couponable = {
  discountable: discountable,
  totalLineOne: totalLineOne,
  totalLineTwo: totalLineTwo,
  totalDescription: totalDescription,
  totalDueNow: totalDueNow,
  totalRecurring: totalRecurring
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = couponable;
} else {
  define('couponable', ['exports'], function (__exports__) { __exports__['default'] = couponable; });
}

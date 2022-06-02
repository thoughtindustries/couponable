import {
  discountable,
  totalDueNow,
  totalRecurring,
  totalLineOne,
  totalLineTwo,
  totalDescription
} from '../src/utilities';

describe('totalDueNow', function() {
  it('calculates correctly', function() {
    expect(totalDueNow({
      quantity: 2,
      variation: {priceInCents: 2},
      priceInCents: 2
    })).toEqual(8);
  });

  it('calculates correctly when a total is provided', function() {
    expect(totalDueNow({
      total: 8,
      priceInCents: 0
    })).toEqual(8);
  });

  it('handles coupons correctly', function() {
    expect(totalDueNow({
      quantity: 1,
      coupon: {percentOff: 50},
      priceInCents: 2
    })).toEqual(1);
  });

  it('handles coupons for bundles correctly', function() {
    expect(totalDueNow({
      quantity: 10,
      coupon: {amountOffInCents: 5},
      priceInCents: 10,
      purchasableType: 'bundle'
    })).toEqual(95);
  });
});

describe('totalRecurring', function() {
  it('returns null for non-bundles', function() {
    expect(totalRecurring({
      purchasableType: 'course',
      priceInCents: 0
    })).toBeNull();
  });

  it('returns priceInCents for bundles without coupons', function() {
    expect(totalRecurring({purchasableType: 'bundle', priceInCents: 2})).toEqual(2);
  });

  it('returns totalDueNow for bundles with forever coupons', function() {
    expect(totalRecurring({purchasableType: 'bundle', priceInCents: 2, quantity: 1, coupon: {duration: 'forever', percentOff: 50}})).toEqual(1);
  });
});

describe('totalLineOne', function() {
  describe('with a bundle', function() {
    it('returns the price with the interval if there is no coupon', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      })).toEqual('$2.00 / month');
    });

    it('returns an alternate currency symbol', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      }, '£')).toEqual('£2.00 / month');
    });

    it('returns the price without the interval if it is a gift', function() {
      expect(totalLineOne({
        quantity: 1,
        gift: true,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      })).toEqual('$2.00');
    });

    it('returns the price with the interval if there is no coupon', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      })).toEqual('$2.00 / month');
    });

    it('returns the price with the extended interval if there is a repeating coupon', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 199, duration: 'repeating', durationInMonths: 4},
        priceInCents: 200
      })).toEqual('$0.01 / month for the first 4 months');
    });

    it('returns the price with the extended interval if there is a once coupon', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 199, duration: 'once'},
        priceInCents: 200
      })).toEqual('$0.01 for the first month');
    });

    it('returns the price with interval if the coupon is forever', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 1, duration: 'forever'},
        priceInCents: 2
      })).toEqual('$0.01 / month');
    });

    it('returns Free if the due now is free and the coupon is forever', function() {
      expect(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        coupon: {amountOffInCents: 2, duration: 'forever'},
        priceInCents: 2
      })).toEqual('Free');
    });
  });

  describe('with a non-bundle', function() {
    it('returns the formatted price', function() {
      expect(totalLineOne({
        quantity: 1,
        priceInCents: 200000
      })).toEqual('$2,000.00');
    });

    it('returns Free if the due now is free', function() {
      expect(totalLineOne({
        quantity: 1,
        coupon: {amountOffInCents: 2},
        priceInCents: 2
      })).toEqual('Free');
    });
  });
});

describe('totalLineTwo', function() {
  describe('with a bundle', function() {
    it('returns null if there is no coupon', function() {
      expect(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        priceInCents: 2
      })).toBeNull();
    });

    it('returns the total recurring with the interval if there is a non-forever coupon', function() {
      expect(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      })).toEqual('$0.06 / month');
    });

    it('returns the total recurring while taking quantity into account', function() {
      expect(totalLineTwo({
        quantity: 10,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      })).toEqual('$0.60 / month');
    });

    it('returns an alternate currency symbol', function() {
      expect(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      }, '£')).toEqual('£0.06 / month');
    });


    it('returns null if there is a forever coupon', function() {
      expect(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'forever'},
        priceInCents: 6
      })).toBeNull();
    });
  });

  describe('with a non-bundle', function() {
    it('returns null', function() {
      expect(totalLineTwo({
        quantity: 1,
        priceInCents: 2
      })).toBeNull();
    });
  });
});

describe('totalDescription', function() {
  it('returns line one and two if they are both set', function() {
    expect(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'once'},
      priceInCents: 6
    })).toEqual('$0.02 for the first month, then $0.06 / month');
  });

  it('returns an alternate currency symbol', function() {
    expect(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'once'},
      priceInCents: 6
    }, '£')).toEqual('£0.02 for the first month, then £0.06 / month');
  });

  it('returns just line one if line two is not set', function() {
    expect(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'forever'},
      priceInCents: 6
    })).toEqual('$0.02 / month');
  });
});

describe('discountable', function() {
  it('prefers percentOff to amountOffInCents when both are given', function() {
    expect(discountable(10, 50, 7)).toEqual(5);
  });

  it('defaults to zero if not provided an amountOffInCents or percentOff', function() {
    expect(discountable(10)).toEqual(10);
  });

  describe('amountOffInCents', function() {
    it('calculates correctly', function() {
      expect(discountable(10, undefined, 7)).toEqual(3);
    });

    it('handles floats', function() {
      expect(discountable(10, undefined, 5.5)).toEqual(4.5);
    });

    it('will not go below zero', function() {
      expect(discountable(10, undefined, 11)).toEqual(0);
    });

    it('ignores negatives', function() {
      expect(discountable(10, undefined, -3)).toEqual(7);
    });
  });

  describe('percentOff', function() {
    it('calculates correctly', function() {
      expect(discountable(10, 10)).toEqual(9);
    });

    it('handles floats', function() {
      expect(discountable(10, 10.5)).toEqual(8.95);
    });

    it('calculates 100% off correctly', function() {
      expect(discountable(10, 100)).toEqual(0);
    });

    it('calculates > 100% off correctly', function() {
      expect(discountable(10, 200)).toEqual(0);
    });

    it('ignores negatives', function() {
      expect(discountable(10, -50)).toEqual(5);
    });
  });
});

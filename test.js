var couponable = require('.');

var discountable = couponable.discountable;
var totalDueNow = couponable.totalDueNow;
var totalRecurring = couponable.totalRecurring;
var totalLineOne = couponable.totalLineOne;
var totalLineTwo = couponable.totalLineTwo;
var totalDescription = couponable.totalDescription;
var assert = require('assert');

describe('totalDueNow', function() {
  it('calculates correctly', function() {
    assert.equal(totalDueNow({
      quantity: 2,
      variation: {priceInCents: 2},
      priceInCents: 2
    }), 8);
  });

  it('calculates correctly when a total is provided', function() {
    assert.equal(totalDueNow({
      total: 8
    }), 8);
  });

  it('handles coupons correctly', function() {
    assert.equal(totalDueNow({
      quantity: 1,
      coupon: {percentOff: 50},
      priceInCents: 2
    }), 1);
  });

  it('handles coupons for bundles & bulk purchases correctly', function() {
    assert.equal(totalDueNow({
      quantity: 10,
      coupon: {amountOffInCents: 5},
      priceInCents: 10,
      purchasableType: 'bundle'
    }), 95);

    assert.equal(totalDueNow({
      quantity: 10,
      coupon: {amountOffInCents: 5},
      priceInCents: 10,
      purchasableType: 'course',
      isBulkPurchase: true
    }), 95);
  });
});

describe('totalRecurring', function() {
  it('returns null for non-bundles', function() {
    assert.equal(totalRecurring({purchasableType: 'course'}), null);
  });

  it('returns priceInCents for bundles without coupons', function() {
    assert.equal(totalRecurring({purchasableType: 'bundle', priceInCents: 2}), 2);
  });

  it('returns totalDueNow for bundles with forever coupons', function() {
    assert.equal(totalRecurring({purchasableType: 'bundle', priceInCents: 2, quantity: 1, coupon: {duration: 'forever', percentOff: 50}}), 1);
  });
});

describe('totalLineOne', function() {
  describe('with a bundle', function() {
    it('returns the price with the interval if there is no coupon', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      }), '$2.00 / month');
    });

    it('returns an alternate currency symbol', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      }, '£'), '£2.00 / month');
    });

    it('returns the price without the interval if it is a gift', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        gift: true,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      }), '$2.00');
    });

    it('returns the price with the interval if there is no coupon', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        priceInCents: 200
      }), '$2.00 / month');
    });

    it('returns the price with the extended interval if there is a repeating coupon', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 199, duration: 'repeating', durationInMonths: 4},
        priceInCents: 200
      }), '$0.01 / month for the first 4 months');
    });

    it('returns the price with the extended interval if there is a once coupon', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 199, duration: 'once'},
        priceInCents: 200
      }), '$0.01 for the first month');
    });

    it('returns the price with interval if the coupon is forever', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 1, duration: 'forever'},
        priceInCents: 2
      }), '$0.01 / month');
    });

    it('returns Free if the due now is free and the coupon is forever', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        purchasableType: 'bundle',
        coupon: {amountOffInCents: 2, duration: 'forever'},
        priceInCents: 2
      }), 'Free');
    });
  });

  describe('with a non-bundle', function() {
    it('returns the formatted price', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        priceInCents: 200000
      }), '$2,000.00');
    });

    it('returns Free if the due now is free', function() {
      assert.equal(totalLineOne({
        quantity: 1,
        coupon: {amountOffInCents: 2},
        priceInCents: 2
      }), 'Free');
    });
  });
});

describe('totalLineTwo', function() {
  describe('with a bundle', function() {
    it('returns null if there is no coupon', function() {
      assert.equal(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        priceInCents: 2
      }), null);
    });

    it('returns the total recurring with the interval if there is a non-forever coupon', function() {
      assert.equal(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      }), '$0.06 / month');
    });

    it('returns the total recurring while taking quantity into account', function() {
      assert.equal(totalLineTwo({
        quantity: 10,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      }), '$0.60 / month');
    });

    it('returns an alternate currency symbol', function() {
      assert.equal(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'once'},
        priceInCents: 6
      }, '£'), '£0.06 / month');
    });


    it('returns null if there is a forever coupon', function() {
      assert.equal(totalLineTwo({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: {amountOffInCents: 4, duration: 'forever'},
        priceInCents: 6
      }), null);
    });
  });

  describe('with a non-bundle', function() {
    it('returns null', function() {
      assert.equal(totalLineTwo({
        quantity: 1,
        priceInCents: 2
      }), null);
    });
  });
});

describe('totalDescription', function() {
  it('returns line one and two if they are both set', function() {
    assert.equal(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'once'},
      priceInCents: 6
    }), '$0.02 for the first month, then $0.06 / month');
  });

  it('returns an alternate currency symbol', function() {
    assert.equal(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'once'},
      priceInCents: 6
    }, '£'), '£0.02 for the first month, then £0.06 / month');
  });

  it('returns just line one if line two is not set', function() {
    assert.equal(totalDescription({
      quantity: 1,
      purchasableType: 'bundle',
      interval: 'month',
      coupon: {amountOffInCents: 4, duration: 'forever'},
      priceInCents: 6
    }), '$0.02 / month');
  });
});

describe('discountable', function() {
  it('prefers percentOff to amountOffInCents when both are given', function() {
    assert.equal(discountable(10, 50, 7), 5);
  });

  it('defaults to zero if not provided an amountOffInCents or percentOff', function() {
    assert.equal(discountable(10), 10);
  });

  describe('amountOffInCents', function() {
    it('calculates correctly', function() {
      assert.equal(discountable(10, null, 7), 3);
    });

    it('handles floats', function() {
      assert.equal(discountable(10, null, 5.5), 4.5);
    });

    it('will not go below zero', function() {
      assert.equal(discountable(10, null, 11), 0);
    });

    it('ignores negatives', function() {
      assert.equal(discountable(10, null, -3), 7);
    });
  });

  describe('percentOff', function() {
    it('calculates correctly', function() {
      assert.equal(discountable(10, 10), 9);
    });

    it('handles floats', function() {
      assert.equal(discountable(10, 10.5), 8.95);
    });

    it('calculates 100% off correctly', function() {
      assert.equal(discountable(10, 100), 0);
    });

    it('calculates > 100% off correctly', function() {
      assert.equal(discountable(10, 200), 0);
    });

    it('ignores negatives', function() {
      assert.equal(discountable(10, -50), 5);
    });
  });
});

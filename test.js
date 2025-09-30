var couponable = require('.');

var discountable = couponable.discountable;
var discountableMulticurrency = couponable.discountableMulticurrency;
var totalDueNow = couponable.totalDueNow;
var totalDueNowMulticurrency = couponable.totalDueNowMulticurrency;
var totalRecurring = couponable.totalRecurring;
var totalRecurringMulticurrency = couponable.totalRecurringMulticurrency;
var totalLineOne = couponable.totalLineOne;
var totalLineOneMulticurrency = couponable.totalLineOneMulticurrency;
var totalLineTwo = couponable.totalLineTwo;
var totalLineTwoMulticurrency = couponable.totalLineTwoMulticurrency;
var totalDescription = couponable.totalDescription;
var assert = require('assert');

describe('totalDueNow', function () {
  it('calculates correctly', function () {
    assert.equal(
      totalDueNow({
        quantity: 2,
        variation: { priceInCents: 2 },
        priceInCents: 2
      }),
      8
    );
  });

  it('calculates correctly when a total is provided', function () {
    assert.equal(
      totalDueNow({
        total: 8
      }),
      8
    );
  });

  it('handles coupons correctly', function () {
    assert.equal(
      totalDueNow({
        quantity: 1,
        coupon: { percentOff: 50 },
        priceInCents: 2
      }),
      1
    );
  });

  it('handles coupons for bundles & bulk purchases correctly', function () {
    assert.equal(
      totalDueNow({
        quantity: 10,
        coupon: { amountOffInCents: 5 },
        priceInCents: 10,
        purchasableType: 'bundle'
      }),
      95
    );

    assert.equal(
      totalDueNow({
        quantity: 10,
        coupon: { amountOffInCents: 5 },
        priceInCents: 10,
        purchasableType: 'course',
        isBulkPurchase: true
      }),
      50
    );
  });
});

describe('totalDueNowMulticurrency', function () {
  it('calculates correctly mc', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 2,
        variation: { priceInCents: 2 },
        price: {
          unitAmount: 2,
          locale: 'en_US'
        }
      }),
      8
    );
  });

  it('calculates correctly when a total is provided', function () {
    assert.equal(
      totalDueNowMulticurrency({
        total: 8
      }),
      8
    );
  });

  it('handles coupons correctly', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: { percentOff: 50 },
        price: {
          unitAmount: 2
        }
      }),
      1
    );
  });

  it('handles coupons for bundles & bulk purchases correctly', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 10,
        coupon: { amountOffInCents: 5 },
        price: {
          unitAmount: 10
        },
        purchasableType: 'bundle'
      }),
      95
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 10,
        coupon: { amountOffInCents: 5 },
        price: {
          unitAmount: 10,
          locale: 'en_US'
        },
        purchasableType: 'course',
        isBulkPurchase: true
      }),
      50
    );
  });

  it('handles pickable groups', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: { percentOff: 50 },
        learningPaths: ['lp-1'],
        courses: ['course-1'],
        price: {
          unitsAmount: [500, 600],
          locale: 'en_US'
        },
        purchasableType: 'pickableGroup'
      }),
      300
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        learningPaths: ['lp-1'],
        courses: [],
        price: {
          unitsAmount: [500, 600],
          locale: 'en_US'
        },
        purchasableType: 'pickableGroup'
      }),
      500
    );
  });

  it('handles bundles', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        interval: 'year',
        price: {
          annualUnitAmount: 10000,
          unitAmount: 400,
          locale: 'en_US'
        },
        purchasableType: 'bundle'
      }),
      10000
    );
  });

  it('returns formatted price when using bulk purchasing', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 10,
        price: {
          unitAmount: 100,
          locale: 'en_US',
          unitsAmount: [120, 110]
        },
        isBulkPurchase: true,
        purchasableType: 'pickableGroup',
        courses: ['course-1'],
        learningPaths: []
      }),
      1000
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        price: {
          unitAmount: 100,
          locale: 'en_US',
          unitsAmount: [120, 110]
        },
        isBulkPurchase: false,
        purchasableType: 'pickableGroup',
        courses: ['course-1'],
        learningPaths: []
      }),
      120
    );
  });

  it('handles multicurrency coupons with specific currency amounts', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: {
          multicurrencyAmountOff: { USD: 500, EUR: 400, KRW: 50000 },
          currencyCode: 'USD'
        },
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      500
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: {
          multicurrencyAmountOff: { USD: 500, EUR: 400, KRW: 50000 },
          currencyCode: 'EUR'
        },
        price: {
          unitAmount: 1000,
          locale: 'de_DE'
        }
      }),
      600
    );
  });

  it('handles multicurrency coupons with bulk purchases', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 5,
        coupon: {
          multicurrencyAmountOff: { USD: 200, EUR: 150 },
          currencyCode: 'USD',
          amountOffInCents: 100 // fallback amount
        },
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        },
        purchasableType: 'bundle',
        isBulkPurchase: true
      }),
      4800 // (1000 * 5) - 200 = 5000 - 200 = 4800 (multicurrency amount is used, not amountOffInCents * quantity)
    );
  });

  it('handles multicurrency coupons with percent off', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: {
          percentOff: 25,
          multicurrencyAmountOff: { USD: 500, EUR: 400 },
          currencyCode: 'USD'
        },
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      750 // percentOff takes precedence over multicurrency amount
    );
  });

  it('falls back to amountOffInCents when multicurrency amount is not available', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        coupon: {
          multicurrencyAmountOff: { USD: 500, EUR: 400 },
          currencyCode: 'GBP', // not in multicurrency object
          amountOffInCents: 300
        },
        price: {
          unitAmount: 1000,
          locale: 'en_GB'
        }
      }),
      700 // 1000 - 300 = 700
    );
  });

  it('handles edge cases with missing price data', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        price: {
          // missing unitAmount
          locale: 'en_US'
        }
      }),
      0 // undefined * 1 = NaN, but the function should handle this
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        price: {
          unitAmount: 1000
          // missing locale
        }
      }),
      1000
    );
  });

  it('handles variation with unitAmount vs priceInCents', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        variation: { unitAmount: 200 },
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      1200
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        variation: { priceInCents: 200 }, // fallback to priceInCents
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      1200
    );
  });

  it('handles complex pickable group scenarios', function () {
    // Test with multiple learning paths and courses
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        learningPaths: ['lp-1', 'lp-2'],
        courses: ['course-1', 'course-2', 'course-3'],
        price: {
          unitsAmount: [500, 600, 700, 800, 900], // 5 items total
          locale: 'en_US'
        },
        purchasableType: 'pickableGroup'
      }),
      900 // unitsAmount[4] = 900 (index 4 for 2 LPs + 3 courses - 1)
    );

    // Test with only learning paths
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        learningPaths: ['lp-1', 'lp-2', 'lp-3'],
        courses: [],
        price: {
          unitsAmount: [500, 600, 700, 800],
          locale: 'en_US'
        },
        purchasableType: 'pickableGroup'
      }),
      700 // unitsAmount[2] = 700 (index 2 for 3 LPs + 0 courses - 1)
    );
  });

  it('handles annual vs monthly bundle pricing', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        interval: 'year',
        price: {
          annualUnitAmount: 12000,
          unitAmount: 1000,
          locale: 'en_US'
        },
        purchasableType: 'bundle'
      }),
      12000
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: 1,
        interval: 'month',
        price: {
          annualUnitAmount: 12000,
          unitAmount: 1000,
          locale: 'en_US'
        },
        purchasableType: 'bundle'
      }),
      1000
    );
  });

  it('handles zero and negative quantities', function () {
    assert.equal(
      totalDueNowMulticurrency({
        quantity: 0,
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      0
    );

    assert.equal(
      totalDueNowMulticurrency({
        quantity: -1,
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      -1000
    );
  });

  it('handles missing quantity (defaults to 0)', function () {
    assert.equal(
      totalDueNowMulticurrency({
        price: {
          unitAmount: 1000,
          locale: 'en_US'
        }
      }),
      0
    );
  });
});

describe('totalRecurring', function () {
  it('returns null for non-bundles', function () {
    assert.equal(totalRecurring({ purchasableType: 'course' }), null);
  });

  it('returns priceInCents for bundles without coupons', function () {
    assert.equal(totalRecurring({ purchasableType: 'bundle', priceInCents: 2 }), 2);
  });

  it('returns totalDueNow for bundles with forever coupons', function () {
    assert.equal(
      totalRecurring({
        purchasableType: 'bundle',
        priceInCents: 2,
        quantity: 1,
        coupon: { duration: 'forever', percentOff: 50 }
      }),
      1
    );
  });
});

describe('totalRecurringMulticurrency', function () {
  it('returns null for non-bundles', function () {
    assert.equal(totalRecurringMulticurrency({ purchasableType: 'course' }), null);
  });

  it('returns priceInCents for bundles without coupons', function () {
    assert.equal(
      totalRecurringMulticurrency({ purchasableType: 'bundle', price: { unitAmount: 2 } }),
      2
    );
  });

  it('returns totalDueNow for bundles with forever coupons', function () {
    assert.equal(
      totalRecurringMulticurrency({
        purchasableType: 'bundle',
        price: { unitAmount: 2 },
        quantity: 1,
        coupon: { duration: 'forever', percentOff: 50 }
      }),
      1
    );
  });
});

describe('totalLineOne', function () {
  describe('with a bundle', function () {
    it('returns the price with the interval if there is no coupon', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          priceInCents: 200
        }),
        '$2.00 / month'
      );
    });

    it('returns an alternate currency symbol', function () {
      assert.equal(
        totalLineOne(
          {
            quantity: 1,
            purchasableType: 'bundle',
            interval: 'month',
            priceInCents: 200
          },
          '£'
        ),
        '£2.00 / month'
      );
    });

    it('returns the price without the interval if it is a gift', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          gift: true,
          purchasableType: 'bundle',
          interval: 'month',
          priceInCents: 200
        }),
        '$2.00'
      );
    });

    it('returns the price with the interval if there is no coupon', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          priceInCents: 200
        }),
        '$2.00 / month'
      );
    });

    it('returns the price with the extended interval if there is a repeating coupon', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 199, duration: 'repeating', durationInMonths: 4 },
          priceInCents: 200
        }),
        '$0.01 / month for the first 4 months'
      );
    });

    it('returns the price with the extended interval if there is a once coupon', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 199, duration: 'once' },
          priceInCents: 200
        }),
        '$0.01 for the first month'
      );
    });

    it('returns the price with interval if the coupon is forever', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 1, duration: 'forever' },
          priceInCents: 2
        }),
        '$0.01 / month'
      );
    });

    it('returns Free if the due now is free and the coupon is forever', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          purchasableType: 'bundle',
          coupon: { amountOffInCents: 2, duration: 'forever' },
          priceInCents: 2
        }),
        'Free'
      );
    });
  });

  describe('with a non-bundle', function () {
    it('returns the formatted price', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          priceInCents: 200000
        }),
        '$2,000.00'
      );
    });

    it('returns Free if the due now is free', function () {
      assert.equal(
        totalLineOne({
          quantity: 1,
          coupon: { amountOffInCents: 2 },
          priceInCents: 2
        }),
        'Free'
      );
    });
  });
});

describe('totalLineOneMulticurrency', function () {
  describe('with a non-bundle', function () {
    it('returns the formatted price in usd', function () {
      assert.equal(
        totalLineOneMulticurrency(
          {
            quantity: 1,
            price: {
              unitAmount: 200000,
              locale: 'en_US'
            }
          },
          'usd'
        ),
        '$2,000.00'
      );
    });

    it('returns the formatted price in yen', function () {
      assert.equal(
        totalLineOneMulticurrency(
          {
            quantity: 1,
            price: {
              unitAmount: 4505,
              locale: 'ja_JP'
            }
          },
          'jpy'
        ),
        '￥4,505'
      );
    });

    it('returns the formatted price in euro', function () {
      assert.equal(
        totalLineOneMulticurrency(
          {
            quantity: 1,
            price: {
              unitAmount: 350002,
              locale: 'de_AT'
            }
          },
          'eur'
        ),
        // space is character U+00a0
        '€ 3.500,02'
      );
    });

    it('returns Free if the due now is free', function () {
      assert.equal(
        totalLineOneMulticurrency(
          {
            quantity: 1,
            coupon: { amountOffInCents: 2 },
            price: {
              unitAmount: 2,
              locale: 'en_US'
            }
          },
          'usd'
        ),
        'Free'
      );
    });
  });
});

describe('totalLineTwo', function () {
  describe('with a bundle', function () {
    it('returns null if there is no coupon', function () {
      assert.equal(
        totalLineTwo({
          quantity: 1,
          purchasableType: 'bundle',
          priceInCents: 2
        }),
        null
      );
    });

    it('returns the total recurring with the interval if there is a non-forever coupon', function () {
      assert.equal(
        totalLineTwo({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'once' },
          priceInCents: 6
        }),
        '$0.06 / month'
      );
    });

    it('returns the total recurring while taking quantity into account', function () {
      assert.equal(
        totalLineTwo({
          quantity: 10,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'once' },
          priceInCents: 6
        }),
        '$0.60 / month'
      );
    });

    it('returns an alternate currency symbol', function () {
      assert.equal(
        totalLineTwo(
          {
            quantity: 1,
            purchasableType: 'bundle',
            interval: 'month',
            coupon: { amountOffInCents: 4, duration: 'once' },
            priceInCents: 6
          },
          '£'
        ),
        '£0.06 / month'
      );
    });

    it('returns null if there is a forever coupon', function () {
      assert.equal(
        totalLineTwo({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'forever' },
          priceInCents: 6
        }),
        null
      );
    });
  });

  describe('with a non-bundle', function () {
    it('returns null', function () {
      assert.equal(
        totalLineTwo({
          quantity: 1,
          priceInCents: 2
        }),
        null
      );
    });
  });
});

describe('totalLineTwoMulticurrency', function () {
  describe('with a bundle', function () {
    it('returns null if there is no coupon', function () {
      assert.equal(
        totalLineTwoMulticurrency({
          quantity: 1,
          purchasableType: 'bundle',
          price: {
            unitAmount: 2
          }
        }),
        null
      );
    });

    it('returns the total recurring with the interval if there is a non-forever coupon', function () {
      assert.equal(
        totalLineTwoMulticurrency({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'once' },
          price: {
            unitAmount: 6,
            locale: 'en_US'
          }
        }),
        '$0.06 / month'
      );
    });

    it('returns the total recurring while taking quantity into account', function () {
      assert.equal(
        totalLineTwoMulticurrency({
          quantity: 10,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'once' },
          price: {
            unitAmount: 6,
            locale: 'en_US'
          }
        }),
        '$0.60 / month'
      );
    });

    it('returns an alternate currency symbol', function () {
      assert.equal(
        totalLineTwoMulticurrency(
          {
            quantity: 1,
            purchasableType: 'bundle',
            interval: 'month',
            coupon: { amountOffInCents: 4, duration: 'once' },
            price: {
              unitAmount: 6,
              locale: 'cy_GB'
            }
          },
          'gbp'
        ),
        '£0.06 / month'
      );
    });

    it('returns null if there is a forever coupon', function () {
      assert.equal(
        totalLineTwoMulticurrency({
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'forever' },
          price: {
            unitAmount: 6
          }
        }),
        null
      );
    });
  });

  describe('with a non-bundle', function () {
    it('returns null', function () {
      assert.equal(
        totalLineTwoMulticurrency({
          quantity: 1,
          price: {
            unitAmount: 2
          }
        }),
        null
      );
    });
  });
});

describe('totalDescription', function () {
  it('returns line one and two if they are both set', function () {
    assert.equal(
      totalDescription({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: { amountOffInCents: 4, duration: 'once' },
        priceInCents: 6
      }),
      '$0.02 for the first month, then $0.06 / month'
    );
  });

  it('returns an alternate currency symbol', function () {
    assert.equal(
      totalDescription(
        {
          quantity: 1,
          purchasableType: 'bundle',
          interval: 'month',
          coupon: { amountOffInCents: 4, duration: 'once' },
          priceInCents: 6
        },
        '£'
      ),
      '£0.02 for the first month, then £0.06 / month'
    );
  });

  it('returns just line one if line two is not set', function () {
    assert.equal(
      totalDescription({
        quantity: 1,
        purchasableType: 'bundle',
        interval: 'month',
        coupon: { amountOffInCents: 4, duration: 'forever' },
        priceInCents: 6
      }),
      '$0.02 / month'
    );
  });
});

describe('discountable', function () {
  it('prefers percentOff to amountOffInCents when both are given', function () {
    assert.equal(discountable(10, 50, 7), 5);
  });

  it('defaults to zero if not provided an amountOffInCents or percentOff', function () {
    assert.equal(discountable(10), 10);
  });

  describe('amountOffInCents', function () {
    it('calculates correctly', function () {
      assert.equal(discountable(10, null, 7), 3);
    });

    it('handles floats', function () {
      assert.equal(discountable(10, null, 5.5), 4.5);
    });

    it('will not go below zero', function () {
      assert.equal(discountable(10, null, 11), 0);
    });

    it('ignores negatives', function () {
      assert.equal(discountable(10, null, -3), 7);
    });
  });

  describe('percentOff', function () {
    it('calculates correctly', function () {
      assert.equal(discountable(10, 10), 9);
    });

    it('handles floats', function () {
      assert.equal(discountable(10, 10.5), 8.95);
    });

    it('calculates 100% off correctly', function () {
      assert.equal(discountable(10, 100), 0);
    });

    it('calculates > 100% off correctly', function () {
      assert.equal(discountable(10, 200), 0);
    });

    it('ignores negatives', function () {
      assert.equal(discountable(10, -50), 5);
    });
  });
});

describe('discountableMulticurrency', function () {
  it('prefers percentOff to multicurrency amount when both are given', function () {
    const multicurrencyAmountOff = { USD: 700, EUR: 600 };
    assert.equal(discountableMulticurrency(1000, 50, null, multicurrencyAmountOff, 'USD'), 500);
  });

  it('uses multicurrency amount when currency code is provided and amount exists', function () {
    const multicurrencyAmountOff = { USD: 700, EUR: 600, KRW: 75000 };
    assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'USD'), 300);
    assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'EUR'), 400);
    assert.equal(
      discountableMulticurrency(100000, null, null, multicurrencyAmountOff, 'KRW'),
      25000
    );
  });

  it('falls back to amountOffInCents when multicurrency amount is not available', function () {
    const multicurrencyAmountOff = { USD: 700, EUR: 600 };
    assert.equal(discountableMulticurrency(1000, null, 500, multicurrencyAmountOff, 'GBP'), 500);
  });

  it('falls back to amountOffInCents when multicurrency amount is null', function () {
    const multicurrencyAmountOff = { USD: 700, EUR: null, KRW: undefined };
    assert.equal(discountableMulticurrency(1000, null, 500, multicurrencyAmountOff, 'EUR'), 500);
    assert.equal(discountableMulticurrency(1000, null, 500, multicurrencyAmountOff, 'KRW'), 500);
  });

  it('defaults to zero discount when no discount parameters are provided', function () {
    assert.equal(discountableMulticurrency(1000), 1000);
  });

  it('defaults to zero discount when multicurrency object is empty', function () {
    const multicurrencyAmountOff = {};
    assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'USD'), 1000);
  });

  it('defaults to zero discount when multicurrency object is null', function () {
    assert.equal(discountableMulticurrency(1000, null, null, null, 'USD'), 1000);
  });

  it('defaults to zero discount when currency code is not provided', function () {
    const multicurrencyAmountOff = { USD: 700, EUR: 600 };
    assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff), 1000);
  });

  describe('multicurrency amount handling', function () {
    it('handles different currency amounts correctly', function () {
      const multicurrencyAmountOff = {
        USD: 100, // $1.00 in cents
        EUR: 150, // €1.50 in cents
        KRW: 2000, // ₩2000 (no minor units)
        JPY: 100 // ¥100 (no minor units)
      };

      assert.equal(discountableMulticurrency(500, null, null, multicurrencyAmountOff, 'USD'), 400);
      assert.equal(discountableMulticurrency(500, null, null, multicurrencyAmountOff, 'EUR'), 350);
      assert.equal(
        discountableMulticurrency(5000, null, null, multicurrencyAmountOff, 'KRW'),
        3000
      );
      assert.equal(discountableMulticurrency(500, null, null, multicurrencyAmountOff, 'JPY'), 400);
    });

    it('handles zero multicurrency amounts', function () {
      const multicurrencyAmountOff = { USD: 0, EUR: 0 };
      assert.equal(
        discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'USD'),
        1000
      );
      assert.equal(
        discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'EUR'),
        1000
      );
    });

    it('will not go below zero with multicurrency amounts', function () {
      const multicurrencyAmountOff = { USD: 1500, EUR: 1200 };
      assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'USD'), 0);
      assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'EUR'), 0);
    });

    it('ignores negative multicurrency amounts', function () {
      const multicurrencyAmountOff = { USD: -300, EUR: -200 };
      assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'USD'), 700);
      assert.equal(discountableMulticurrency(1000, null, null, multicurrencyAmountOff, 'EUR'), 800);
    });
  });

  describe('percentOff with multicurrency', function () {
    it('calculates percent off correctly when multicurrency data is present', function () {
      const multicurrencyAmountOff = { USD: 700, EUR: 600 };
      assert.equal(discountableMulticurrency(1000, 25, null, multicurrencyAmountOff, 'USD'), 750);
      assert.equal(discountableMulticurrency(1000, 25, null, multicurrencyAmountOff, 'EUR'), 750);
    });

    it('handles 100% off correctly', function () {
      const multicurrencyAmountOff = { USD: 700, EUR: 600 };
      assert.equal(discountableMulticurrency(1000, 100, null, multicurrencyAmountOff, 'USD'), 0);
    });

    it('handles > 100% off correctly', function () {
      const multicurrencyAmountOff = { USD: 700, EUR: 600 };
      assert.equal(discountableMulticurrency(1000, 150, null, multicurrencyAmountOff, 'USD'), 0);
    });
  });

  describe('fallback behavior', function () {
    it('falls back to amountOffInCents when currency code is missing from multicurrency object', function () {
      const multicurrencyAmountOff = { USD: 700, EUR: 600 };
      assert.equal(discountableMulticurrency(1000, null, 300, multicurrencyAmountOff, 'GBP'), 700);
    });

    it('falls back to amountOffInCents when multicurrency object is undefined', function () {
      assert.equal(discountableMulticurrency(1000, null, 300, undefined, 'USD'), 700);
    });

    it('prioritizes percentOff over both multicurrency and amountOffInCents', function () {
      const multicurrencyAmountOff = { USD: 700, EUR: 600 };
      assert.equal(discountableMulticurrency(1000, 20, 300, multicurrencyAmountOff, 'USD'), 800);
    });
  });
});

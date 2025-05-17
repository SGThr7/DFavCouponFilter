import { DiscountTypeEnum } from '@/type/coupon.type'

export function compare(a: DiscountTypeEnum, b: DiscountTypeEnum): number {
	switch (a) {
		case DiscountTypeEnum.Rate: {
			switch (b) {
				case DiscountTypeEnum.Rate: {
					// keep
					return 0
				}
				case DiscountTypeEnum.Price: {
					// a, b
					return -1
				}
			}
		}
		case DiscountTypeEnum.Price: {
			switch (b) {
				case DiscountTypeEnum.Rate: {
					// b, a
					return 1
				}
				case DiscountTypeEnum.Price: {
					// keep
					return 0
				}
			}
		}
	}
}
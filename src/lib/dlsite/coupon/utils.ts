import { DiscountType } from '@/type/dlsite/coupon'

export function compareDiscountType(a: DiscountType, b: DiscountType): number {
	switch (a) {
		case 'rate': {
			switch (b) {
				case 'rate': {
					// keep
					return 0
				}
				case 'price': {
					// a, b
					return -1
				}
			}
		}
		case 'price': {
			switch (b) {
				case 'rate': {
					// b, a
					return 1
				}
				case 'price': {
					// keep
					return 0
				}
			}
		}
	}

	console.trace(`Unexpected discount type (${a}, ${b})`)
	return 0
}

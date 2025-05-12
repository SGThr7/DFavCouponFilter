import { CouponData, CouponId } from "../../type/coupon.type"
import { DProduct } from "./payload"

export class DCoupon {
	private info: CouponData

	constructor(info: CouponData) {
		this.info = info
	}

	getId(): CouponId {
		return this.info.coupon_id
	}

	getName() {
		return this.info.coupon_name
	}

	getDiscountRate() {
		return this.info.discount
	}

	/**
	 * @return クーポンの使用期限
	 */
	getUserLimitDate() {
		const limitDateRaw = this.info.user_limit_date
		if (limitDateRaw == null) {
			return null
		}

		const limitDate = new Date(limitDateRaw)
		return limitDate
	}

	/**
	 * @returns 有効なクーポンかどうか
	 */
	isAvailable() {
		const hasPresented = this.info.issue.regist_present?.regist_present ?? false

		const limitDate = this.getUserLimitDate()
		const currentDate = new Date()
		const isInLimitDate = limitDate != null ? currentDate <= limitDate : false

		return hasPresented && isInLimitDate
	}

	/**
	 * @param product 対象の作品
	 * @returns クーポン対象の作品かどうか
	 */
	async canDiscount(product: DProduct) {
		const testProductAll = this.info.condition.product_all?.some(productId =>
			productId === product.getId()
		) ?? false

		const testCustomGenre = new Promise<boolean>(async (resolve) => {
			const pGenres = await product.asyncGetCustomGenres()
			const res = this.info.condition.custom_genre?.some(cGenre => pGenres.some(pGenre => cGenre === pGenre)) ?? false
			resolve(res)
		})

		return testProductAll || await testCustomGenre
	}
}

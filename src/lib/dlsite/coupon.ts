import { CouponData, CouponId, DiscountType } from "../../type/coupon.type"
import { compare as compareDiscountType } from "./coupon/utils"
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

	getDiscountType(): DiscountType {
		return this.info.discount_type
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

	compare(other: DCoupon): number {
		const cmpDiscountType = compareDiscountType(this.getDiscountType(), other.getDiscountType())
		if (cmpDiscountType !== 0) return cmpDiscountType

		const cmpDiscount = other.getDiscountRate() - this.getDiscountRate()
		if (cmpDiscount !== 0) return cmpDiscount

		const maxDate = new Date(8.64e15)
		const cmpLimitDate = (this.getUserLimitDate() ?? maxDate).getTime() - (other.getUserLimitDate() ?? maxDate).getTime()
		return cmpLimitDate
	}
}

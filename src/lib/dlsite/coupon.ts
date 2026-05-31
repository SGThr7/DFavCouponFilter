import { Coupon, DiscountType } from '@/type/dlsite/coupon'
import { compareDiscountType as compareDiscountType } from "./coupon/utils"
import { DProduct } from "./payload"

export class DCoupon {
	private info: Coupon

	constructor(info: Coupon) {
		this.info = info
	}

	getId(): string {
		return this.info.coupon_id
	}

	getName(): string {
		return this.info.coupon_name
	}

	getDiscountRate(): number {
		return parseInt(this.info.discount)
	}

	getDiscountType(): DiscountType {
		return this.info.discount_type
	}

	/**
	 * @return クーポンの使用期限
	 */
	getUseLimitDate(): Date {
		const limitDateSec = this.info.limit_date
		const limitDateMsec = limitDateSec * 1e3
		const limitDate = new Date(limitDateMsec)
		return limitDate
	}

	getInfo(): Coupon {
		return this.info
	}

	toString(): string {
		return `DCoupon(id=${this.getId()}, name=${this.getName()}, discount=${this.getDiscountType()} ${this.getDiscountRate()}%, limitDate=${this.getUseLimitDate()})`
	}

	/**
	 * @returns 有効なクーポンかどうか
	 */
	isAvailable() {
		// 配布されたかどうかを判断する方法がない
		const hasPresented = true

		const limitDate = this.getUseLimitDate()
		const currentDate = new Date()
		const isInLimitDate = limitDate != null ? currentDate <= limitDate : false

		return hasPresented && isInLimitDate
	}

	/**
	 * @param product 対象の作品
	 * @returns クーポン対象の作品かどうか
	 */
	async canDiscount(product: DProduct) {
		switch (this.info.condition_type) {
			case 'id_all': {
				return this.info.conditions.product_all?.some(productId =>
					productId === product.getId()
				) ?? false
			}
			case 'custom_genre': {
				const pGenres = await product.asyncGetCustomGenres()
				return this.info.conditions.custom_genre?.some(cGenre =>
					pGenres.some(pGenre => cGenre === pGenre)
				) ?? false
			}
			case 'site_ids': {
				const pSiteId = await product.getSiteId()
				const pPrice = await product.getPrice()
				const allowedSiteId = this.info.conditions.site_ids?.includes(pSiteId) ?? false
				const maxPrice = parseInt(this.info.conditions.maximum_applicable_price)
				const allowedPrice = pPrice <= maxPrice
				return allowedSiteId && allowedPrice
			}
			case 'worktype': {
				const pWorkType = await product.getWorkType()
				const pPrice = await product.getPrice()
				const allowedWorkType = this.info.conditions.worktype.includes(pWorkType) ?? false
				const maxPrice = parseInt(this.info.conditions.maximum_applicable_price)
				const allowedPrice = pPrice <= maxPrice
				return allowedWorkType && allowedPrice
			}
		}

		// @ts-ignore
		console.trace(`Unexpected condition type "${this.info.condition_type}"`)
		return false
	}

	compare(other: DCoupon): number {
		const cmpDiscountType = compareDiscountType(this.getDiscountType(), other.getDiscountType())
		if (cmpDiscountType !== 0) return cmpDiscountType

		const cmpDiscount = other.getDiscountRate() - this.getDiscountRate()
		if (cmpDiscount !== 0) return cmpDiscount

		const maxDate = new Date(8.64e15)
		const cmpLimitDate = (this.getUseLimitDate() ?? maxDate).getTime() - (other.getUseLimitDate() ?? maxDate).getTime()
		return cmpLimitDate
	}
}

import { SiteId_Lower, SiteId_Snake } from "./site"

export type CouponId = string

export type Coupons = Coupon[]

export interface Coupon {
	group_type: GroupType
	coupon_id: CouponId
	coupon_name: string
	/** 詳細情報のHTML */
	info: string
	start_date: string
	end_date: string
	issue_type: IssueType
	condition_type: ConditionType
	/** クーポン使用に関するの情報 */
	condition_info: string
	image_path: string
	image_url: string | null
	/** 割り引き種別 */
	discount_type: DiscountType
	/** 割引率/量 */
	discount: string
	distribute_targets: SiteId_Snake[]
	issues: Issues
	conditions: Conditions
	is_static_limit: boolean
	limit_date: number
	encrypted_code: any
	is_female_coupon: boolean
	is_doujin_coupon: boolean
	is_books_coupon: boolean
	is_pc_coupon: boolean
	is_app_coupon: boolean
	is_ai_coupon: boolean
	is_adult_coupon: boolean
	distribute_target_string: string
	is_notify_coupon: boolean
	regist_date: number
	is_new: boolean
	is_expiration_alert: boolean
	is_multiple_use: boolean
	is_affect_to_payment: boolean
	weight: number
	recommends: Recommend[]
}

type GroupType = 'dlsite'

type IssueType = 'user_regist' | 'payment'

/** 割引対象の設定方式 */
type ConditionType =
	| 'custom_genre'
	| 'id_all'
	| 'site_ids'

/** 値引きの計算方法 */
export type DiscountType = 'rate' | 'price'

interface Issues {
	regist_present?: RegistPresent
	product_id?: string[]
}

interface RegistPresent {
	regist_present: boolean
	is_same_coupon_ng: boolean
	is_other_coupon_ng: boolean
	is_set_coupon_ng: boolean
}

interface Conditions {
	custom_genre?: string[]
	product_all?: string[]
	prerequisite?: Prerequisite
	site_ids?: SiteId_Lower[]
	platform?: string
	price_sum?: number
	maximum_applicable_price?: string
}

interface Prerequisite {
	count: number
	price: number
}

interface Recommend {
	product_id: string
	image_thumb: string
	url: string
}

import { ProductId } from "./product"
import { SiteId_Lower, SiteId_Snake } from "./site"

export type CouponId = string

export type Coupons = Coupon[]

export type Coupon = Coupon_Base & Coupon_Conditions

interface Coupon_Base {
	// --------------------
	// # クーポン情報
	/** 固有ID */
	coupon_id: CouponId
	/** クーポン名 */
	coupon_name: string

	/** 割引方式 */
	discount_type: DiscountType
	/** 割引率/量 */
	discount: string

	/** 詳細情報のHTML */
	info: string
	/** クーポン使用に関する情報のHTML */
	condition_info: string
	/** クーポンサムネイルのURL ("30%OFF"などが書いてある) */
	image_path: string
	/** クーポンの特設ページ (クーポンの対象作品一覧に表示される作品一覧で用いられる) */
	image_url: string | null

	/** ? 配布開始日時: yyyy-MM-dd HH:mm:ss */
	start_date: string
	/** ? 配布終了日時: yyyy-MM-dd HH:mm:ss */
	end_date: string

	/** 割引対象の指定方式 */
	condition_type: ConditionType
	conditions: Conditions

	// --------------------
	// # 不明
	/** 現状'dlsite'のみ確認 */
	group_type: GroupType
	issue_type: IssueType
	/** ? クーポンが適用されるサイト一覧 */
	distribute_targets: SiteId_Snake[]
	/** ? クーポンの配布状況など */
	issues: Issues
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

type ConditionType =
	| 'custom_genre'
	| 'id_all'
	| 'site_ids'

/** 値引きの計算方法 */
export type DiscountType = 'rate' | 'price'

type Issues = Issues_RegistPresent | Issues_ProductId

interface Issues_RegistPresent {
	regist_present: {
		regist_present: boolean
		is_same_coupon_ng: boolean
		is_other_coupon_ng: boolean
		is_set_coupon_ng: boolean
	}
}

interface Issues_ProductId {
	product_id: ProductId[]
}

type Coupon_Conditions =
	| Coupon_Conditions_CustomGenre
	| Coupon_Conditions_IdAll
	| Coupon_Conditions_SiteIds

interface Coupon_Conditions_Base {
	condition_type: ConditionType
	conditions: unknown
}

interface Coupon_Conditions_CustomGenre extends Coupon_Conditions_Base {
	condition_type: 'custom_genre'
	conditions: Conditions_CustomGenre
}

interface Coupon_Conditions_IdAll extends Coupon_Conditions_Base {
	condition_type: 'id_all'
	conditions: Condition_ProductAll
}

interface Coupon_Conditions_SiteIds extends Coupon_Conditions_Base {
	condition_type: 'site_ids'
	conditions: Condition_SiteIds
}

type Conditions = Conditions_CustomGenre | Condition_ProductAll | Condition_SiteIds

interface Conditions_CustomGenre {
	custom_genre: string[]
}

interface Condition_ProductAll {
	product_all: ProductId[]
	prerequisite: { count: number, price: number }
}

interface Condition_SiteIds {
	site_ids: SiteId_Lower[]
	platform: string
	price_sum: number
	maximum_applicable_price: string
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

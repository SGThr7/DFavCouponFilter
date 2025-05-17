// MARK: クーポン

export type Coupons = CouponData[]

export interface CouponData {
	condition: {
		// 作品単品ごとの割引？
		product_id?: [ProductId]
		// サークルごとの割引？
		// 併用されうるタグ: `best_price_flg`, `regist_date`
		maker_id?: [string]
		// セール用ジャンルごとの割引？
		custom_genre?: string[]
		// 不明。シリーズ作品割引？
		// 併用されうるタグ: `post_condition`
		product_all?: [string]
		// n円以上購入での割引？
		price_sum: PriceSum
		// 支払い方法による割引？
		// `price_sum`と併用される？
		payment_route?: string[]
		// 不明。販売場所による割引？(comipoなど)
		// 併用されうるタグ: `platform`, `price_sum`, `best_price_flg`, `discount_limit`, `prerequisite`, `maximum_applicable_price`
		site_ids?: string[]
		// 不明。
		// values: 'MNG', 'SOU', 'comic', 'audio', 'game', 'ACN', 'QIZ', 'ADV', 'RPG', 'TBL', 'DNV', 'SLN', 'TYP', 'STG', 'PZL', 'ETC', 'SCM', 'WBT', 'illust', 'ICG', 'publication', 'PBC', 'movie', 'MOV'
		// 併用されうるタグ: `platform`, `price_sum`, `site_id`, `options`, `best_price_flg`, `discount_limit`
		worktype?: WorkType[]
	},
	coupon_id: CouponId
	coupon_name: string
	discount: number
	discount_type: DiscountType
	start_date: string
	end_date: string
	end_date_str: string
	limit_days: string
	limit_days_days: number
	user_limit_date: string | null
	issue: Issue
	is_comipo_only_coupon: boolean
}

export type CouponId = string

export type PriceSum = number[] | PriceSumObj
export interface PriceSumObj {
	price: number
	is_same_coupon_ng: boolean
	is_other_coupon_ng: boolean
	is_set_coupon_ng: boolean
}

export const enum DiscountTypeEnum {
	Rate = 'rate',
	Price = 'price',
}
export type DiscountType = typeof DiscountTypeEnum[keyof typeof DiscountTypeEnum]

// "発行"という意味でのIssue
export interface Issue {
	//   product_id: any
	//   price_sum?: PriceSum
	//   baitai?: Baitai
	//   specific_route?: string[]
	regist_present?: RegistPresent
}

// ユーザーへの付与状況などが記載されている模様
export interface RegistPresent {
	regist_present: boolean
	is_same_coupon_ng: boolean
	is_other_coupon_ng: boolean
	is_set_coupon_ng: boolean
}

// MARK: 製品詳細

export interface Products {
	[key: ProductId]: ProductData
}

export interface ProductData {
	maker_id: string
	// 対象の作品割引系で割り当てられるID
	custom_genres: string[]

	// 販売エリア
	site_id: SiteId
	// おそらく "Download URL" の意味
	down_url: string

	// 作品タイトル
	work_name: string
	work_name_masked: string
	// 作品サムネイル (プロトコル抜きのURL)
	work_image: string
	// 不明
	work_type: WorkType

	// シリーズ名ID
	title_id: string
	// シリーズ名
	title_name: string
	title_name_masked: string
	// シリーズ作品数
	title_work_count: number

	age_category: number
	options: string
}

// プロダクトID
export type ProductId = string

// 販売エリア
export type SiteId = string

// 不明。おそらく作品形式 (単行本, 同人誌, ボイス・ASMR など)
// values: 'MNG', 'SOU', 'comic', 'audio', 'game', 'ACN', 'QIZ', 'ADV', 'RPG', 'TBL', 'DNV', 'SLN', 'TYP', 'STG', 'PZL', 'ETC', 'SCM', 'WBT', 'illust', 'ICG', 'publication', 'PBC', 'movie', 'MOV'
export type WorkType = string

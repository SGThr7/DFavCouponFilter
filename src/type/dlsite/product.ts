import { MakerId } from "./maker"
import { SiteId_Lower, SiteIdTouch_Lower } from "./site"

const ProductIdPrefix = [
	// 同人系 (スマホゲーム, 制作ソフト・素材, AI生成)
	'RJ',
	// 成年コミック
	'BJ',
	// 実行ファイル系 (PCソフト, 美少女ゲームなど)
	'VJ',
] as const
type ProductIdPrefix = (typeof ProductIdPrefix)[number]
type ProductIdNumber = number

export type ProductId = `${ProductIdPrefix}${ProductIdNumber}`

export interface ProductInfoMap {
	[key: ProductId]: ProductInfo,
}

export interface ProductInfo {
	// --------------------
	// # 作品情報
	/** 作品名 */
	work_name: string
	work_name_masked: string

	/** 販売区分 */
	site_id: SiteId_Lower
	site_id_touch: SiteIdTouch_Lower

	/** 作者ID */
	maker_id: MakerId

	/** シリーズID */
	title_id: string | null
	/** シリーズ名 */
	title_name: string | null
	title_name_masked: string | null
	/** 同一シリーズ作品数 */
	title_work_count: number
	/** シリーズ中の何巻目か */
	title_volumn: number | null
	/** 不明。"シリーズをすべて所持しているか", "完結しているか"ではなさそう */
	is_title_completed: boolean

	/** サムネURL (相対) */
	work_image: string
	/** 作品の種類 */
	work_type: WorkType
	/** 作品の種類 (成年コミック用) */
	book_type: BookType

	/** クーポンなどで利用される期間限定のタグ */
	custom_genres: string[]

	/** DL数。成年コミックなどではnullになる？ */
	dl_count: number | null
	wishlist_count: number
	/** DL数。成年コミックなどでは0になる？ */
	dl_count_total: number
	/** 言語ごとのDL数 */
	dl_count_items: unknown[]

	/** 販売日 */
	regist_date: string
	/** 独占販売かどうか */
	is_oly: boolean
	/** 期間限定販売に関する情報 */
	sales_end_info: SalesEndInfo

	// --------------------
	// # 評価関連
	/** ? ランキング履歴 (成年コミックのみ?) */
	rank: Rank[]
	/** 評価 (四捨五入) */
	rate_average: number
	/** 評価 (小数あり) */
	rate_average_2dp: number
	/** 評価 (星の数) */
	rate_average_star: number
	/** 評価件数 */
	rate_count: number
	/** 評価内訳 */
	rate_count_detail: RateCountDetail[]

	// --------------------
	// # 価格関連
	/** 割引後の価格 */
	price: number
	price_str: string
	/** 税抜き価格 */
	price_without_tax: number
	/** 割引前の価格 */
	official_price: number
	official_price_str: string

	/** 為替適用後の割引後価格 */
	locale_price: LocalePrice
	locale_price_str: LocalePriceStr
	/** 為替適用後の割引後中間価格 */
	currency_price: CurrencyPrice

	/** 為替適用後の割引前価格 */
	locale_official_price: LocaleOfficialPrice
	locale_official_price_str: LocaleOfficialPriceStr
	/** 為替適用後の割引前中間価格 */
	currency_official_price: CurrencyOfficialPrice

	// --------------------
	// # ポイント関連
	/** ポイント */
	default_point: number
	default_point_str: string
	/** ポイント率 (税抜き価格で計算) */
	default_point_rate: number
	/** 不明 */
	product_point_rate: null

	// --------------------
	// # 割引関連
	/** キャンペーンID */
	campaign_id: string | null
	/** キャンペーンID (数字版)？ */
	discount_campaign_id: number | null
	/** 不明。何かしらの計算方式 */
	discount_calc_type: DiscountCalcType | null
	/** 割引率 */
	discount_rate: number
	/** 割引終了日: 'MM/dd HH:mm' */
	discount_end_date: string | null
	/** キャンペーンページURL */
	discount_to: string | null
	/** 割引中かどうか */
	is_discount: boolean
	/** 不明 */
	discount_caption: null

	/** セット割りキャンペーンID */
	bulkbuy_key: string | null

	/** ? 数量限定セール */
	is_timesale: boolean
	/** ? 数量限定セールの購入された割合 */
	timesale_stock: number

	// --------------------
	// # その他
	/** レビュー数 */
	review_count: number
	/** Download URL */
	down_url: string
	/** 年齢制限区分: 1=全年齢, 2=R15, 3=R18 */
	age_category: number

	// --------------------
	// # 不明
	/** ? アフィ禁止しているかどうか */
	affiliate_deny: number
	/** ? ファイル形式: 0=通常ファイル?, 9=専用ビューア */
	dl_format: number
	/** ? DLsite Play で使用可能かどうか */
	dlsiteplay_work: boolean
	is_ana: boolean
	is_sale: boolean
	on_sale: number
	is_pointup: boolean
	gift: unknown[]
	is_rental: boolean
	work_rentals: unknown[]
	upgrade_min_price: number
	is_tartget: null
	bonuses: unknown[]
	is_limit_work: boolean
	is_sold_out: boolean
	limit_stock: number
	is_reserve_work: boolean
	is_reservable: boolean
	is_free: boolean
	is_led: boolean
	is_noreduction: boolean
	is_wcc: boolean
	translation_info: TranslationInfo
	voice_pack: null
	is_pack_work: boolean
	limited_free_terms: unknown[]
	/** 例: "JPN#DLP#REV" */
	options: string
	// --------------------
}

const enum Category {
	All = 'all',
	Comic = 'comic',
	Magazine = 'magazine',
}

interface Rank {
	term: RankTerm
	category: Category
	// 順位
	rank: number
	// yyyy, yyyy-MM-dd
	rank_date: string
}

const enum RankTerm {
	Day = 'day',
	Week = 'week',
	Month = 'month',
	Year = 'year',
}

interface RateCountDetail {
	review_point: number
	count: number
	ratio: number
}

interface TranslationInfo {
	is_translation_agree: boolean
	is_volunteer: boolean
	is_original: boolean
	is_parent: boolean
	is_child: boolean
	is_translation_bonus_child: boolean
	original_workno: null
	parent_workno: null
	child_worknos: unknown[]
	lang: null
	production_trade_price_rate: number
	translation_bonus_langs: unknown[]
}

const enum Locale {
	ja_JP = 'ja_JP',
	en_US = 'en_US',
	ar_AE = 'ar_AE',
	es_ES = 'es_ES',
	de_DE = 'de_DE',
	fr_FR = 'fr_FR',
	it_IT = 'it_IT',
	pt_BR = 'pt_BR',
	zh_TW = 'zh_TW',
	zh_CN = 'zh_CN',
	ko_KR = 'ko_KR',
	id_ID = 'id_ID',
	vi_VN = 'vi_VN',
	th_TH = 'th_TH',
	sv_SE = 'sv_SE',
}

type LocalePrice = {
	[key in Locale]: number
}

type LocalePriceStr = {
	[key in Locale]: string
}

const enum Currency {
	JPY = 'JPY',
	USD = 'USD',
	EUR = 'EUR',
	GBP = 'GBP',
	TWD = 'TWD',
	CNY = 'CNY',
	KRW = 'KRW',
	IDR = 'IDR',
	VND = 'VND',
	THB = 'THB',
	SEK = 'SEK',
	HKD = 'HKD',
	SGD = 'SGD',
	CAD = 'CAD',
	MYR = 'MYR',
	BRL = 'BRL',
	AUD = 'AUD',
	PHP = 'PHP',
	MXN = 'MXN',
	NZD = 'NZD',
	INR = 'INR',
}

type CurrencyPrice = {
	[key in Currency]: number
}

// 過不足がある可能性あり
const enum WorkType {
	MNG = 'MNG',
	SOU = 'SOU',
	comic = 'comic',
	audio = 'audio',
	game = 'game',
	ACN = 'ACN',
	QIZ = 'QIZ',
	ADV = 'ADV',
	RPG = 'RPG',
	TBL = 'TBL',
	DNV = 'DNV',
	SLN = 'SLN',
	TYP = 'TYP',
	STG = 'STG',
	PZL = 'PZL',
	ETC = 'ETC',
	SCM = 'SCM',
	WBT = 'WBT',
	illust = 'illust',
	ICG = 'ICG',
	publication = 'publication',
	PBC = 'PBC',
	movie = 'movie',
	MOV = 'MOV',
}

interface BookType {
	id: string
	options_id: string
	// 値不明: comic
	value: string
	name: string
	name_jp: string
	name_en: string
	display_sentence: null
	display_sentence_en: null
	category_id: string
	category: string
}

const enum DiscountCalcType {
	Floor = 'floor',
}

type LocaleOfficialPrice = {
	[key in Locale]: number
}

type LocaleOfficialPriceStr = {
	[key in Locale]: string
}

type CurrencyOfficialPrice = {
	[key in Currency]: number
}

type SalesEndInfo = {
	end_date: { [key in Locale]: string }
	// yyyy-MM-dd HH:mm:ss
	end_date_proto: string
	can_download: boolean
	not_download: boolean
}

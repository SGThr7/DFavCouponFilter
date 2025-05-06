import { CouponData, ProductData, ProductId } from "../type/coupon.type";
import { fetchProductInfo, findProductId } from "./d_lib";
import { OrBooleans } from "./MultiFactorBooleans";

//MARK: 作品情報

export class DProduct {
	private id: ProductId
	private dom: HTMLElement
	private info: ProductData | undefined
	private visibilities: OrBooleans

	constructor(productId: ProductId, dom: HTMLElement) {
		this.id = productId
		this.dom = dom
		this.info = undefined
		this.visibilities = new OrBooleans()
	}

	/**
	 * @returns DOMから取得した作品IDを持つDProduct。作品IDが取得できなかった場合はnullを返す。
	 */
	static fromDom(dom: HTMLElement) {
		const productId = findProductId(dom)
		if (productId == null) {
			console.error('Failed to find product ID', dom)
			return null
		}

		return new DProduct(productId, dom)
	}

	/**
	 * 非同期で作品情報を取得
	 */
	protected fetchProductInfo() {
		const infoPromise = fetchProductInfo(this.id)
		infoPromise.then(info => {
			this.info = info
			this.onFinishProductInfo()
		})
	}

	/**
	 * 作品情報の取得が完了したときに呼ばれる
	 */
	protected onFinishProductInfo() {
	}

	/**
	 * @returns 現在の可視性
	 */
	getVisibility() {
		return this.visibilities.getResult()
	}

	protected setVisibilityInternal(isVisible: boolean) {
		this.dom.hidden = !isVisible
	}

	/**
	 * 作品の可視性を変更
	 * @param isVisible 可視性
	 * @param factorCoupon 可視性を設定する要因
	 */
	setVisibility(isVisible: boolean, factorCoupon: string) {
		const newVisibility = this.visibilities.setValue(factorCoupon, isVisible)
		this.setVisibilityInternal(newVisibility)
	}

	/**
	 * クーポンによる作品の可視性をリセット
	 * @param factorCoupon 可視性を設定する要因
	 */
	removeVisibilityFactor(factorCoupon: string) {
		const factorsVisibility = this.visibilities.removeFactor(factorCoupon)
		const newVisibility = !this.visibilities.hasAnyFactor() || factorsVisibility
		this.setVisibilityInternal(newVisibility)
	}

	/**
	 * 可視性をリセット
	 */
	clearVisibilityFactors() {
		this.visibilities.clearFactors()
		this.setVisibilityInternal(true)
	}

	/**
	 * @returns 作品ID
	 */
	getId() {
		return this.id
	}

	/**
	 * @returns 作者ID
	 */
	getMakerId() {
		if (this.info == null) {
			console.warn('Product info has not been fetched yet.')
			return ''
		}

		return this.info.maker_id
	}

	/**
	 * @returns 主にクーポン用で用いられるカスタムジャンル
	 */
	getCustomGenres() {
		if (this.info == null) {
			console.warn('Product info has not been fetched yet.')
			return []
		}

		return this.info.custom_genres
	}
}

//MARK: クーポン情報

export class DCoupon {
	private info: CouponData

	constructor(info: CouponData) {
		this.info = info
	}

	/**
	 * @returns クーポンID
	 */
	getId() {
		return this.info.coupon_id
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
	 * @param targetProduct 対象の作品
	 * @returns クーポン対象の作品かどうか
	 */
	testProduct(targetProduct: DProduct) {
		const testProductAll = this.info.condition.product_all?.some(productId =>
			productId === targetProduct.getId()
		) ?? false

		return testProductAll
	}

	/**
	 * @returns クーポン名
	 */
	getName() {
		return this.info.coupon_name
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
}

//MARK: 作品の可視性管理

export class DProductVisibilityManager {
	static readonly WISHLIST_CONTAINER_ID = 'edit_wishlist'

	private products: Map<ProductId, DProduct>
	private coupons: Set<DCoupon>

	constructor() {
		this.products = new Map()
		this.coupons = new Set()

		this.bindOnWishlistDomAdded()

		DProductVisibilityManager
			.collectProductDoms(document)
			.map<[ProductId, DProduct]>(([productId, dom]) => {
				const product = new DProduct(productId, dom)
				return [productId, product]
			})
			.forEach(([_productId, product]) => this.addProduct(product))
	}

	clear() {
		this.products
			.values()
			.forEach(product => product.clearVisibilityFactors())

		this.products.clear()
		this.coupons.clear()
	}

	/**
	 * 作品を管理対象へ追加
	 * @param product 追加する作品
	 */
	addProduct(product: DProduct) {
		const productId = product.getId()
		this.products.set(productId, product)
		this.onProductAdded(product)
	}

	/**
	 * 作品が追加された際の処理
	 */
	onProductAdded(product: DProduct) {
		this.coupons
			.values()
			.forEach(coupon => {
				product.setVisibility(coupon.testProduct(product), coupon.getId())
			})
	}

	/**
	 * 作品のDOMを取得
	 */
	static collectProductDoms(container: ParentNode) {
		const products = container.querySelectorAll<HTMLElement>('form#edit_wishlist > div#wishlist_work > table.n_worklist > tbody > tr._favorite_item')

		const productDomsIter = products
			.values()
			.map<[ProductId, HTMLElement] | null>(content => {
				const product_id = findProductId(content)
				if (product_id == null) {
					console.error('Failed to find product ID', content)
					return null
				}

				return [product_id, content]
			})
			.filter(val => val != null)

		return productDomsIter
	}

	/**
	 * 自動ページ送りなどで追加された作品を検知する
	 */
	bindOnWishlistDomAdded() {
		const container = document.querySelector('div#wishlist')
		if (container == null) {
			console.error('Failed to find wishlist container')
			return
		}

		const observer = new MutationObserver((records, observer) => this.onWishlistDomAdded(records, observer))
		observer.observe(container, {
			subtree: false,
			childList: true,
		})
	}

	onWishlistDomAdded(records: MutationRecord[], _observer: MutationObserver) {
		records.forEach(record => {
			record
				.addedNodes
				.values()
				.filter(DProductVisibilityManager.isWishlistContainer)
				.flatMap(container => DProductVisibilityManager.collectProductDoms(container))
				.map(([_productId, dom]) => DProduct.fromDom(dom))
				.filter(product => product != null)
				.forEach(product => this.addProduct(product))
		})
	}

	static isWishlistContainer(node: Node): node is HTMLElement {
		return node instanceof HTMLElement && node.id === DProductVisibilityManager.WISHLIST_CONTAINER_ID
	}

	/**
	 * クーポンによるフィルターを追加
	 * @param coupon 絞り込みに使用するクーポン
	 */
	addCouponFilter(coupon: DCoupon) {
		if (this.coupons.has(coupon)) {
			console.warn('Coupon already exists in the filter', coupon, this.coupons)
			return
		}

		this.coupons.add(coupon)
		this.products.forEach(product => {
			// new Promise(() => {
			product.setVisibility(coupon.testProduct(product), coupon.getId())
			// })
		})
	}

	/**
	 * クーポンによるフィルターを削除
	 * @param coupon 対象クーポン
	 */
	removeCouponFilter(coupon: DCoupon) {
		this.coupons.delete(coupon)
		this.products.forEach(product => {
			product.removeVisibilityFactor(coupon.getId())
		})
	}
}

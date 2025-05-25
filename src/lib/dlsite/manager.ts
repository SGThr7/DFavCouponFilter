import { CouponId, Coupons } from '@/type/dlsite/coupon'
import { ProductId } from '@/type/dlsite/product'
import { OrBooleans } from '@/lib/MultiFactorBooleans'
import { DCoupon } from './coupon'
import { DProduct } from './product'
import { fetchCoupons, findProductId } from './utils'

export class DPCManager {
	static readonly WISHLIST_CONTAINER_ID = 'edit_wishlist'

	private products: Map<ProductId, DProduct>
	private couponFilter: Map<ProductId, OrBooleans>
	private coupons: Set<DCoupon>

	private discountableCouponMap: Map<CouponId, Set<ProductId>>
	private filterCoupons: Set<CouponId>

	private observerAddWishlistDom: MutationObserver | undefined
	private promiseFetchCoupons: Promise<Coupons> | undefined

	constructor() {
		this.products = new Map()
		this.couponFilter = new Map()
		this.coupons = new Set()

		this.discountableCouponMap = new Map()
		this.filterCoupons = new Set()
	}

	//MARK: 初期化

	init() {
		console.log('init')
		this.bindOnAddedWishlistDom()

		this.asyncFetchCoupons()
		this.collectAndRegisterProducts(document)
		this.asyncInitLink()
	}

	clear() {
		this.unbindOnAddedWishlistDom()

		Iterator.from(this.products.values())
			.forEach(product => product.setIsVisible(true))

		this.products.clear()
		this.couponFilter.clear()
		this.coupons.clear()
	}

	// MARK: 作品管理

	/**
	 * 作品を管理対象へ追加
	 * @param product 追加する作品
	 */
	registerProduct(product: DProduct) {
		const productId = product.getId()
		const productExists = this.products.has(productId)
		console.assert(!productExists, `Exists product: ID=${productId}`)

		if (!productExists) {
			console.log(`Register product: "${product.getTitle()}"`, product, product.getDom())
			this.products.set(productId, product)
			this.couponFilter.set(productId, new OrBooleans())
		}
	}

	async asyncInitLink() {
		const linkPromises = Iterator.from(this.products.values())
			.map(async product => {
				await this.asyncLinkToCouponsCache(product)
			})

		await Promise.allSettled(linkPromises)
	}

	/**
	 * 作品と所持中のクーポンを対応付ける
	 */
	async asyncLinkToCouponsCache(product: DProduct) {
		await this.asyncWaitFetchCoupons()

		const asyncIter = Iterator.from(this.coupons.values())
			.map(coupon => this.asyncLink(product, coupon))

		await Promise.allSettled(asyncIter)
	}

	/**
	 * 作品とクーポンを対応付ける
	 */
	async asyncLink(product: DProduct, coupon: DCoupon) {
		const filterResult = this.getCouponFilterResult(product.getId())
		const canDiscount = await coupon.canDiscount(product)

		// 可視性用フラグ設定
		filterResult.setValue(coupon.getId(), canDiscount)

		// クーポンで割引可能な作品数を記録
		if (canDiscount) {
			const targets = this.discountableCouponMap.get(coupon.getId())
			targets?.add(product.getId())
		}
	}

	// MARK: DOM追加の監視
	// 自動ページ送り拡張など用

	/**
	 * 自動ページ送りなどで追加された作品を検知する
	 */
	bindOnAddedWishlistDom() {
		const container = document.querySelector('div#wishlist')
		if (container == null) {
			console.error('Failed to find wishlist container')
			return
		}

		this.observerAddWishlistDom = new MutationObserver((records, observer) => this.onAddWishlistDom(records, observer))
		this.observerAddWishlistDom.observe(container, {
			subtree: false,
			childList: true,
		})
	}

	onAddWishlistDom(records: MutationRecord[], _observer: MutationObserver) {
		console.groupCollapsed('On add wishlist dom')
		console.log(records)
		records.forEach(record => {
			record
				.addedNodes
				.values()
				.filter(DPCManager.isWishlistContainer)
				.forEach(async dom => {
					const addedProducts = this.collectAndRegisterProducts(dom)

					const asyncLinkIter = addedProducts.values().map(product => this.asyncLinkToCouponsCache(product))
					const asyncLink = Promise.allSettled(asyncLinkIter)
					await asyncLink

					this.updateProductsVisibility(addedProducts.values())
				})
		})
		console.groupEnd()
	}

	unbindOnAddedWishlistDom() {
		this.observerAddWishlistDom?.disconnect()
	}

	static isWishlistContainer(node: Node): node is HTMLElement {
		return node instanceof HTMLElement && node.id === DPCManager.WISHLIST_CONTAINER_ID
	}

	// MARK: DOM操作

	/**
	 * 作品の一覧を取得して登録する
	 * @returns 追加した作品一覧
	 */
	collectAndRegisterProducts(container: ParentNode) {
		const addedProduct: DProduct[] = []
		console.groupCollapsed('Collect and register products')
		DPCManager
			.collectProductDoms(container)
			.map(([productId, dom]) => new DProduct(productId, dom))
			.forEach(product => {
				this.registerProduct(product)
				addedProduct.push(product)
			})
		console.groupEnd()
		return addedProduct
	}

	/**
	 * 作品のDOMを取得
	 * @param container 取得時のルートDOM
	 * @returns 作品DOMのIterator
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
	 * 現在管理対象の作品の可視性を更新する
	 */
	updateAllProductsVisibility() {
		this.updateProductsVisibility(this.products.values())
	}

	/**
	 * 指定した管理対象作品の可視性を更新する
	 * @param products 対象の管理中作品
	 */
	updateProductsVisibility(products: Iterable<DProduct>) {
		const isNoFilter = this.filterCoupons.size === 0
		const targetProductsIter = Iterator.from(this.filterCoupons.values())
			.map(couponId => this.discountableCouponMap.get(couponId))
			.filter(targetProducts => targetProducts != null)
			.flatMap(targetProducts => targetProducts)
		const targetProducts = new Set(targetProductsIter)

		Iterator.from(products)
			.forEach(product => {
				const isVisible = isNoFilter || targetProducts.has(product.getId())
				product.setIsVisible(isVisible)
			})
	}

	// MARK: クーポン

	/**
	 * クーポンの取得を非同期で開始する
	 */
	async asyncFetchCoupons() {
		if (this.promiseFetchCoupons == null) {
			this.promiseFetchCoupons = fetchCoupons()
			const resCoupons = await this.promiseFetchCoupons

			const couponIter = resCoupons.values()
				.map(coupon => new DCoupon(coupon))
				.filter(coupon => coupon.isAvailable())
			this.coupons = new Set(couponIter)

			const discountableCouponsMapIter = Iterator.from(this.coupons.values())
				.map(coupon => [coupon.getId(), new Set()] as [CouponId, Set<ProductId>])
			this.discountableCouponMap = new Map(discountableCouponsMapIter)

			// console.log('coupons', Iterator.from(this.coupons.values()).toArray().sort((a, b) => b.getDiscountRate() - a.getDiscountRate()).map(coupon => coupon.getName()))
		} else {
			await this.promiseFetchCoupons
		}

		return this.coupons
	}

	/**
	 * 既に開始しているクーポンの取得を`await`する用の関数
	 */
	async asyncWaitFetchCoupons() {
		if (this.promiseFetchCoupons == null) {
			console.warn('No fetching promise')
			return
		}

		await this.promiseFetchCoupons
	}

	//MARK: アクセサー

	getCouponFilterResult(productId: ProductId): OrBooleans {
		console.assert(this.couponFilter.has(productId), `Not registered product: ID=${productId}`)

		return this.couponFilter.get(productId)!
	}

	/**
	 * クーポンの一覧を取得する。
	 * クーポンがまだ取得できていない可能性があるため、必要に応じて`await asyncWaitFetchCoupons()`で取得を待機する必要がある。
	 */
	getCoupons(): Set<DCoupon> {
		return this.coupons
	}

	/**
	 * クーポン対象の作品一覧を取得する。
	 * 情報がまだ未収集の場合はカラのコンテナーが返る。
	 */
	getDiscountableCouponMap(couponId: CouponId) {
		return this.discountableCouponMap.get(couponId) ?? new Set()
	}

	addCouponFilter(couponId: CouponId) {
		this.filterCoupons.add(couponId)
		this.updateAllProductsVisibility()
	}

	removeCouponFilter(couponId: CouponId) {
		this.filterCoupons.delete(couponId)
		this.updateAllProductsVisibility()
	}
}

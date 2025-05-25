import { ProductInfo, ProductId } from '@/type/dlsite/product'
import { fetchProductInfo } from '@/lib/dlsite/utils'
import { parseId, parseTitle } from './product/utils'
import { SiteId_Lower } from '@/type/dlsite/site'

export class DProduct {
	private id: ProductId
	// TODO: 自動ページ送り拡張などを使うとDOMが複数になることがあるため、複数DOMを操作できるようにしたい
	private dom: HTMLElement
	private info: ProductInfo | undefined

	private promiseFetchInfo: Promise<void> | undefined

	// MARK: Constructor

	constructor(productId: ProductId, dom: HTMLElement) {
		this.id = productId
		this.dom = dom
		this.info = undefined
	}

	/**
	 * @returns DOMから取得した作品IDを持つDProduct。作品IDが取得できなかった場合はnullを返す。
	 */
	static tryFromDom(dom: HTMLElement) {
		const productId = parseId(dom)
		if (productId == null) {
			console.error('Failed to find product ID', dom)
			return null
		}

		return new DProduct(productId, dom)
	}

	// MARK: 初期化

	/**
	 * 非同期で作品情報を取得
	 */
	async asyncFetchInfo() {
		if (this.promiseFetchInfo == null) {
			this.info = undefined

			// `this.info`の更新も待つ
			this.promiseFetchInfo = new Promise(async (resolve) => {
				const resInfo = await fetchProductInfo(this.id)
				this.info = resInfo
				resolve()
			})
		}
		await this.promiseFetchInfo

		return this.info!
	}

	// MARK: DOM操作

	isVisible(): boolean {
		return !this.dom.hidden
	}

	setIsVisible(isVisible: boolean) {
		this.dom.hidden = !isVisible
	}

	// MARK: Accessor

	getId(): ProductId {
		return this.id
	}

	getTitle(): string {
		return this.info?.title_name ?? parseTitle(this.dom) ?? '[No Title]'
	}

	async asyncGetMakerId() {
		await this.asyncFetchInfo()
		return this.getMakerIdCache()
	}

	getMakerIdCache(): string {
		console.assert(this.info != null, 'Product info has not been fetched yet')
		return this.info?.maker_id ?? ''
	}

	async asyncGetCustomGenres() {
		await this.asyncFetchInfo()
		return this.getCustomGenresCache()
	}

	getCustomGenresCache(): Readonly<string[]> {
		console.assert(this.info != null, 'Product info has not been fetched yet')
		return this.info?.custom_genres ?? []
	}

	async getSiteId(): Promise<SiteId_Lower> {
		await this.asyncFetchInfo()
		return this.getSiteIdCache()!
	}

	getSiteIdCache(): SiteId_Lower | undefined {
		console.assert(this.info != null, 'Product info has not been fetched yet')
		return this.info?.site_id
	}

	getDom(): HTMLElement {
		return this.dom
	}
}

import { ProductId } from '@/type/dlsite/product'

/**
 * 作品固有のIDを取得します
 */
export function parseId(productDom: HTMLElement): ProductId | null {
	const productLink = productDom.querySelector('.work_name > a')
	const urlRaw = productLink?.getAttribute('href')
	if (urlRaw == null) {
		console.warn('Failed to find product link', productDom)
		return null
	}

	const productUrl = new URL(urlRaw)
	const productId = productUrl.pathname.split('/').at(-1)?.split('.').at(0)
	if (productId == null) {
		console.warn(`Failed to parse product ID: ${urlRaw}`)
		return null
	}

	return productId as ProductId
}

/**
 * 作品タイトルを取得します
 */
export function parseTitle(productDom: HTMLElement): string | null {
	const productLink = productDom.querySelector<HTMLAnchorElement>('.work_name > a')
	const title = productLink?.getAttribute('title') ?? productLink?.textContent
	if (title == null) {
		console.warn('Failed to find product link', productDom)
		return null
	}

	return title
}
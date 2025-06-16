import { Coupons } from '@/type/dlsite/coupon'
import { ProductInfoMap, ProductId } from '@/type/dlsite/product'

export async function fetchCoupons() {
	const couponsUrl = 'https://www.dlsite.com/books/mypage/coupon/list/ajax'
	const couponsRaw = await fetch(couponsUrl)

	if (!couponsRaw.ok) {
		throw new Error(`HTTP error: status=${couponsRaw.status}`)
	}

	const coupons: Coupons = await couponsRaw.json()

	return coupons
}

export async function fetchProductInfo(productId: ProductId) {
	const info = await fetchProductInfos([productId])
	return info[productId]
}

export async function fetchProductInfos(productIds: ProductId[]): Promise<ProductInfoMap> {
	const baseUrl = 'https://www.dlsite.com/maniax/product/info/ajax'
	const productSearchParam = 'product_id'

	const separator = ','
	const requestIds = productIds.join(separator)

	const searchParams = new URLSearchParams({
		[productSearchParam]: requestIds
	})
	const url = new URL(`${baseUrl}?${searchParams}`)
	const infosRes = await fetch(url)

	if (!infosRes.ok) {
		throw new Error(`Failed to fetch product info: ${url}`)
	}

	const products: ProductInfoMap = await infosRes.json()
	return products
}

export function parseProductId(content: HTMLElement) {
	const contentInfoDom = content.querySelector('dl.work_1col')
	const contentUrlRaw = contentInfoDom?.querySelector('a')?.getAttribute('href')
	if (contentUrlRaw == null) {
		console.error('Content URL not found', content)
		return null
	}
	const contentUrl = new URL(contentUrlRaw)

	const productId = contentUrl.pathname.split('/').at(-1)?.split('.').at(0)
	if (productId == null) {
		console.error(`Failed to parse product ID: ${contentUrlRaw}`)
		return null
	}

	return productId as ProductId
}

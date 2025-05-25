import { Coupons, Coupon, CouponId } from '@/type/dlsite/coupon'
import { ProductInfoMap, ProductId } from '@/type/dlsite/product'

export async function fetchCoupons() {
	// TODO: 取得が漏れているクーポンがいくつかある
	const couponsUrl = 'https://www.dlsite.com/books/mypage/coupon/list/ajax'
	const couponsRaw = await fetch(couponsUrl)

	if (!couponsRaw.ok) {
		throw new Error(`HTTP error: status=${couponsRaw.status}`)
	}

	const coupons: Coupons = await couponsRaw.json()

	return coupons
}

export function filterAvailableCoupons(coupons: Readonly<Coupons>) {
	const availableCoupons = coupons
		.values()
		.filter(coupon => coupon.issues.regist_present)

	return availableCoupons.toArray() as Coupons
}

export async function fetchProductInfo(productId: ProductId) {
	const productInfoUrl = `https://www.dlsite.com/maniax/product/info/ajax?product_id=${productId}`
	const productInfoRaw = await fetch(productInfoUrl)

	if (!productInfoRaw.ok) {
		throw new Error(`Failed to fetch product info: ${productInfoUrl}`)
	}

	const products: ProductInfoMap = await productInfoRaw.json()
	const productInfo = products[productId]

	return productInfo
}

export async function findCoupons(coupons: Readonly<Coupons>, product_id: ProductId) {
	// 対象クーポン
	let targetCoupons = new Set<CouponId>()

	const appendCoupons = (coupons: IteratorObject<Coupon>) => {
		coupons
			.map(coupon => coupon.coupon_id)
			.forEach(coupon_id => targetCoupons.add(coupon_id))
	}

	// 作品ごとクーポン
	{
		let targetCouponsProductId = coupons
			.values()
			.filter(coupon => coupon.conditions.product_all?.includes(product_id))

		// クーポンを記録
		appendCoupons(targetCouponsProductId)
	}

	const productInfo = await fetchProductInfo(product_id).catch(err => {
		console.error(`Failed to fetch product info for ${product_id}:`, err)
		return null
	})

	// カスタムジャンルクーポン
	if (productInfo != null) {
		let targetCouponsCustomGenre = coupons.values()
			.filter(coupon => productInfo.custom_genres.some(genre => coupon.conditions.custom_genre?.includes(genre)))

		// クーポンを記録
		appendCoupons(targetCouponsCustomGenre)
	}

	return targetCoupons
}

export async function findAnyCoupon(coupons: Readonly<Coupons>, product_id: ProductId) {
	// 作品ごとクーポン
	const targetCouponsProductId = coupons
		.values()
		.find(coupon => coupon.conditions.product_all?.includes(product_id))
	if (targetCouponsProductId != null) return targetCouponsProductId

	const productInfo = await fetchProductInfo(product_id).catch(err => {
		console.error(`Failed to fetch product info for ${product_id}:`, err)
		return null
	})
	if (productInfo == null) return null

	// カスタムジャンルクーポン
	const targetCouponsCustomGenre = coupons
		.values()
		.find(coupon => productInfo.custom_genres.some(genre => coupon.conditions.custom_genre?.includes(genre))) ?? null
	return targetCouponsCustomGenre
}

export function findProductId(content: HTMLElement) {
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

export async function collectCouponMap(coupons: Readonly<Coupons>, contents: NodeListOf<HTMLElement>) {
	const couponMapIter = contents
		.values()
		.map(async content => {
			const productId = findProductId(content)
			if (productId == null) {
				console.error('Failed to find product ID', content)
				return null
			}

			const coupon = await findAnyCoupon(coupons, productId)
			return [productId, coupon != null] as [ProductId, boolean]
		})

	let retCouponMap = new Map<ProductId, boolean>()
	for await (const iter of couponMapIter) {
		if (iter == null) continue

		const [product_id, has_coupon] = iter
		retCouponMap.set(product_id, has_coupon)
	}

	return retCouponMap
}

import { createApp } from 'vue';
import CouponFilter from '@/components/CouponFilter.vue';
import './style.css';

main()

function main() {
	const bookmarkUrlPattern = new RegExp('^https?://(www.)?dlsite.com/(\\w+)/mypage/wishlist/.*', 'i')
	const currentUrl = window.location.href

	if (bookmarkUrlPattern.test(currentUrl)) {
		createFilterBox()
	}
}

function createFilterBox() {
	const filterBoxRoot = document.createElement('div')
	const filterBox = createApp(CouponFilter)
	filterBox.mount(filterBoxRoot)

	const insertAnchor = document.querySelector('div#wishlist > form#showList')
	if (insertAnchor == null) return

	insertAnchor.parentNode?.insertBefore(filterBoxRoot, insertAnchor.nextElementSibling)
}

<template>
	<div class="wrapper">
		<CouponCheckbox v-for="coupon of coupons" :key="coupon.getId()" :coupon="coupon" @on-checked="onCouponChecked">
		</CouponCheckbox>
	</div>
</template>

<script setup lang="ts">
import { fetchCoupons } from '../lib/d_lib'
import CouponCheckbox from './CouponCheckbox.vue'
import { DCoupon, DProductVisibilityManager } from '../lib/DProduct'
import { onBeforeUnmount } from 'vue'

const dProductManager = new DProductVisibilityManager()

const allCoupons = await fetchCoupons()
const coupons = allCoupons.values()
	.map(couponData => new DCoupon(couponData))
	.filter(coupon => coupon.isAvailable())
	.toArray()

function onCouponChecked(isChecked: boolean, coupon: DCoupon) {
	if (isChecked) {
		dProductManager.addCouponFilter(coupon)
	} else {
		dProductManager.removeCouponFilter(coupon)
	}
}

onBeforeUnmount(() => {
	dProductManager.clear()
})
</script>

<style scoped>
.wrapper {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
</style>
<template>
	<div class="wrapper">
		<!-- TODO: 対象が0のクーポンも別途表示する。(自動ページ送りを併用する際にあったほうがいい) -->
		<template v-for="coupon of coupons">
			<CouponCheckbox v-if="getDiscountableCount(coupon) > 0" :key="coupon.getId()" :coupon="coupon"
				:discountTargetCount="getDiscountableCount(coupon)" @on-checked="onCouponChecked">
			</CouponCheckbox>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, Reactive, reactive } from 'vue'
import { DCoupon, DPCManager } from '@/lib/dlsite/payload'
import CouponCheckbox from '@/components/CouponCheckbox.vue'

const dpcManager: Reactive<DPCManager> = reactive(new DPCManager())
dpcManager.init()

onBeforeUnmount(() => {
	dpcManager.clear()
})


const _ = await dpcManager.asyncWaitFetchCoupons()

const coupons = computed(() => dpcManager.getCoupons())

function getDiscountableCount(coupon: DCoupon): number {
	return dpcManager.getDiscountableCouponMap(coupon.getId()).size
}

function onCouponChecked(isChecked: boolean, coupon: DCoupon) {
	if (isChecked) {
		dpcManager.addCouponFilter(coupon.getId())
	} else {
		dpcManager.removeCouponFilter(coupon.getId())
	}
}
</script>

<style scoped>
.wrapper {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
</style>
<template>
	<div class="wrapper">
		<!-- TODO: 処理中の作品数を表示したほうがわかりやすそう -->
		<div v-if="allCoupons.size <= 0">所持クーポン無し</div>

		<div class="coupons">
			<CouponCheckbox v-for="coupon of discountCoupons" :key="coupon.getId()" :coupon="coupon"
				:discountTargetCount="getDiscountableCount(coupon)" @on-checked="onCouponChecked">
			</CouponCheckbox>
		</div>

		<CollapseMenu class="no-target-coupons" v-if="noDiscountCoupons.length > 0">
			<template #title>割引対象無しクーポン一覧</template>

			<div class="coupons">
				<CouponCheckbox v-for="coupon of noDiscountCoupons" :key="coupon.getId()" :coupon="coupon"
					:discountTargetCount="getDiscountableCount(coupon)" @on-checked="onCouponChecked">
				</CouponCheckbox>
			</div>
		</CollapseMenu>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, Reactive, reactive } from 'vue'
import { DCoupon, DPCManager } from '@/lib/dlsite/payload'
import CouponCheckbox from '@/components/CouponCheckbox.vue'
import CollapseMenu from '@/components/CollapseMenu.vue'

const dpcManager: Reactive<DPCManager> = reactive(new DPCManager())
dpcManager.init()

onBeforeUnmount(() => {
	dpcManager.clear()
})


const _ = await dpcManager.asyncWaitFetchCoupons()

const allCoupons = computed(() => dpcManager.getCoupons())
const discountCoupons = computed(() => (
	Iterator.from(allCoupons.value.values())
		.filter(coupon => getDiscountableCount(coupon) > 0)
		.toArray()
		.sort((a, b) => a.compare(b))
))
const noDiscountCoupons = computed(() => (
	Iterator.from(allCoupons.value.values())
		.filter(coupon => getDiscountableCount(coupon) === 0)
		.toArray()
		.sort((a, b) => a.compare(b))
))

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
.coupons {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.no-target-coupons {
	margin-top: 20px;
}
</style>
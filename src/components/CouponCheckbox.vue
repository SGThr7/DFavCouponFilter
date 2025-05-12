<template>
	<div>
		<label>
			<input type="checkbox" @change="onChecked">
			<span>
				{{ name }} ({{ discountTargetCount }})
			</span>
		</label>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DCoupon } from '@/lib/dlsite/payload'

interface Props {
	coupon: DCoupon
	discountTargetCount: number
}

const { coupon } = defineProps<Props>()

const name = computed(() => coupon.getName())

const emit = defineEmits<{
	onChecked: [isChecked: boolean, coupon: DCoupon]
}>()

function onChecked(e: Event) {
	const isChecked = (e.target as HTMLInputElement).checked
	emit('onChecked', isChecked, coupon)
}
</script>

<template>
	<div>
		<label>
			<input type="checkbox" @change="onChecked">
			<span>
				{{ name }}
			</span>
		</label>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DCoupon } from '../lib/DProduct';

interface Props {
	coupon: DCoupon
}

const { coupon } = defineProps<Props>()

const id = computed(() => coupon.getId())
const name = computed(() => coupon.getName())

const emit = defineEmits<{
	onChecked: [isChecked: boolean, coupon: DCoupon]
}>()

function onChecked(e: Event) {
	const isChecked = (e.target as HTMLInputElement).checked
	emit('onChecked', isChecked, coupon)
}
</script>

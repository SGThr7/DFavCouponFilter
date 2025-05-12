<template>
	<div class="border_b">
		<Suspense>
			<template #default>
				<AsyncCouponList />
			</template>
			<template #fallback>
				<div class="loading">Loading...</div>
			</template>
		</Suspense>
	</div>
</template>

<script setup lang="ts">
import AsyncCouponList from '@/components/AsyncCouponList.vue'
</script>

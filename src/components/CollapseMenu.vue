<template>
	<div>
		<button type="button" class="expand_button" :aria-expanded="isExpanded" :aria-controls="contentId"
			@click="onClickButton">
			<slot name="title">
				表示切り替え
			</slot>
			<img :src="CollapseIconFile" class="expand_icon">
		</button>
		<div :id="contentId" class="content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import CollapseIconFile from '@/assets/collapse_icon.svg'

const contentId = useId()

const isExpanded = ref(false)

function onClickButton(_e: MouseEvent) {
	isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.expand_button {
	width: 183px;
	font-size: 12px;
	display: flex;
	justify-content: space-between;
	padding: 3px 8px;
	padding-bottom: 6px;
}

.expand_icon {
	display: inline-block;
	width: 12px;
	margin-top: 1px;
	transition: transform 0.05s;
}

.expand_button {
	&[aria-expanded="true"] .expand_icon {
		transform: rotate(180deg);
	}

	&[aria-expanded="true"]~.content {
		display: block;
	}

	&[aria-expanded="false"]~.content {
		display: none;
	}
}

.content {
	border: 1px solid gray;
	border-radius: 10px;
	border-top-left-radius: 0;
	padding: 5px 10px;
}
</style>

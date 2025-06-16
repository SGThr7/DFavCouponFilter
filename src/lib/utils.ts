/**
 * `Object`を`[key, value]`の`Iterator`へ変換する
 */
export function objEntryIter<K extends string | number | symbol, V>(obj: Record<K, V>): IteratorObject<[K, V]> {
	return Iterator.from(Object.entries(obj) as [K, V][])
}

/**
 * `Object.entry()`で作成された`Iterator`の`key`をnullチェックする
 */
export function isValidEntryKey<K, V>(entry: [K | undefined, V]): entry is [K, V] {
	return entry[0] != null
}

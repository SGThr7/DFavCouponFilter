type Replace<
	S extends string, From extends string, To extends string
> = From extends "" ? S
	: S extends `${infer Left}${From}${infer Right}` ? `${Left}${To}${Right}` : S

type ValueOf<T> = T[keyof T]

type ObjEntry<T> = T extends Record<infer K, infer V> ? [K, V] : unknown

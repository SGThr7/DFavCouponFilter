interface IteratorConstructor {
	concat<T>(...items: (Iterable<T> | Iterator<T>)[]): IteratorObject<T, undefined, unknown>;
}

declare var Iterator: IteratorConstructor;

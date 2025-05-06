/**
 * 複数の要因でBooleanを管理し、`operator()`関数で定義した方法によりBooleanの結果をまとめる
 */
abstract class MultiFactorBooleans {
	/**
	 * ある要因に基づいたBooleanの値
	 */
	protected factors: Map<string, boolean>
	/**
	 * Booleanをまとめた結果のキャッシュ
	 */
	protected result: boolean

	constructor() {
		this.factors = new Map()
		this.result = this.getInitialValue()
	}

	/**
	 * Booleanをまとめる際の演算子
	 * @param lhs 左辺
	 * @param rhs 右辺
	 * @returns まとめた演算結果
	 */
	operate(lhs: boolean, rhs: boolean) {
		console.error("Not implemented `operate` method")
		return false
	}

	getInitialValue() {
		console.error("Not implemented `initialValue` method")
		return false
	}

	/**
	 * 演算結果のキャッシュを再演算し、その結果を返す
	 * 
	 * @returns まとめた演算結果
	 */
	protected recalculateResult() {
		this.result = this.factors.values().reduce((acc, val) => this.operate(acc, val), this.getInitialValue())
		return this.result
	}

	/**
	 * 指定した要因の値をセットする
	 * @param factor 要因名
	 * @param value 値
	 * @returns まとめた演算結果
	 */
	setValue(factor: string, value: boolean) {
		this.setValueImpl(factor, value)
		return this.recalculateResult()
	}

	protected setValueImpl(factor: string, value: boolean) {
		this.factors.set(factor, value)
	}

	/**
	 * 指定した要因の値を取得する
	 * @param factor 要因名
	 * @returns 指定した要因の値。要因が設定されていない場合は`false`を返す
	 */
	getValue(factor: string) {
		return this.factors.get(factor) ?? false
	}

	/**
	 * @returns まとめた演算結果
	 */
	getResult() {
		return this.result
	}

	/**
	 * @param factor 要因名
	 * @returns 要因が設定されているかどうか
	 */
	hasFactor(factor: string) {
		return this.factors.has(factor)
	}

	/**
	 * 指定したFactorを削除する
	 * @param factor 要因名
	 * @returns 削除したあとのまとめた演算結果
	 */
	removeFactor(factor: string) {
		this.removeFactorImpl(factor)
		return this.recalculateResult()
	}

	protected removeFactorImpl(factor: string) {
		this.factors.delete(factor)
	}

	/**
	 * @returns 任意の要因が設定されているかどうか
	 */
	hasAnyFactor() {
		return this.factors.size > 0
	}

	/**
	 * すべての要因を削除する
	 */
	clearFactors() {
		this.factors.clear()
		this.result = this.getInitialValue()
	}
}

/**
 * ORでまとめられるBooleanの管理クラス
 */
export class OrBooleans extends MultiFactorBooleans {
	operate(lhs: boolean, rhs: boolean) {
		return lhs || rhs
	}

	getInitialValue() {
		return false
	}

	protected recalculateResult() {
		this.result = this.factors.values().some(val => val)
		return this.result
	}

	setValue(factor: string, value: boolean) {
		if (this.hasFactor(factor) && !value) {
			return super.setValue(factor, value)
		} else {
			// 新規追加 or `true`へ変更する場合はすべてを再計算する必要がない

			this.setValueImpl(factor, value)
			this.result = this.operate(this.result, value)
			return this.result
		}
	}

	removeFactor(factor: string) {
		if (!this.getValue(factor)) {
			// `false`の値を消す場合は再計算する必要がない

			this.removeFactorImpl(factor)
			return this.result
		} else {
			return super.removeFactor(factor)
		}
	}
}

/**
 * ANDでまとめられるBooleanの管理クラス
 */
export class AndBooleans extends MultiFactorBooleans {
	operate(lhs: boolean, rhs: boolean) {
		return lhs && rhs
	}

	getInitialValue() {
		return true
	}

	protected recalculateResult(): boolean {
		this.result = this.factors.values().every(val => val)
		return this.result
	}

	setValue(factor: string, value: boolean) {
		if (value || !this.hasFactor(factor)) {
			// 新規追加 or `true`へ変更する場合はすべてを再計算する必要がない

			this.setValueImpl(factor, value)
			this.result = this.operate(this.result, value)
			return this.result
		} else {
			return super.setValue(factor, value)
		}
	}

	removeFactor(factor: string): boolean {
		if (this.getValue(factor)) {
			// `true`の値を消す場合は再計算する必要がない

			this.removeFactorImpl(factor)
			return this.result
		} else {
			return super.removeFactor(factor)
		}
	}
}

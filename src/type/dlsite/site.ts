export type SiteId_Snake =
	// # 全年齢
	// 同人
	| 'home'
	// PCソフト
	| 'soft'
	// スマホゲーム
	| 'app'
	// AI生成作品
	| 'ai'
	// 商業作品 (ボイスなど含む)
	| 'comic'

	// # R18
	// 同人
	| 'maniax'
	// 商業コミック
	| 'books'
	// 美少女ゲーム
	| 'pro'
	// スマホゲーム
	| 'appx'
	// AI生成作品
	| 'aix'

	// # 女性向け
	// 女性向け同人
	| 'girls'
	// 女性向け商業コミック
	| 'girls-pro'
	// 女性向け (ドラマCD)
	| 'girls-drama'
	// 女性向け同人 (BL)
	| 'bl'
	// 女性向け商業コミック (BL)
	| 'bl-pro'
	// 女性向け (BL, ドラマCD)
	| 'bl-drama'


export type SiteId_Lower = Replace<SiteId_Snake, "-", "">

export type SiteIdTouch_Lower = `${SiteId_Lower}touch`
export type SiteIdTouch_Snake = `${SiteId_Snake}touch`

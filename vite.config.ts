import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'DFavCouponFilter',
        author: 'SGThr7',
        description: {
          '': 'DLsite内のお気に入り作品一覧で、クーポン対象の作品のみをフィルターする機能を追加します',
        },
        version: '0.0.2',
        license: 'MIT',
        namespace: 'sgthr7/monkey-script',
        match: ['https://www.dlsite.com/*'],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});

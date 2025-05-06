import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'DFavCouponMatcher',
        author: 'SGThr7',
        description: {
          '': 'DLsite内のお気に入り作品一覧で、クーポン対象の作品のみを絞り込みます',
        },
        version: '0.0.1',
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

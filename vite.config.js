import {defineConfig} from "vite"

// export default defineConfig({
// 	plugins: [
		
// 	]
// })
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
}

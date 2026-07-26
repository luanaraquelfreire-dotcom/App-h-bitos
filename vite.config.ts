import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isGhPages = process.env.GH_PAGES === 'true'

// O Artifact (demo) exige um único arquivo HTML autocontido, então usamos
// vite-plugin-singlefile por padrão. O GitHub Pages não tem essa restrição:
// lá é melhor deixar o Vite separar JS/CSS em arquivos com hash próprio, para
// o navegador conseguir cachear entre deploys e não rebaixar tudo de novo a
// cada visita.
export default defineConfig({
  base: isGhPages ? '/App-h-bitos/' : '/',
  plugins: [react(), tailwindcss(), ...(isGhPages ? [] : [viteSingleFile()])],
})

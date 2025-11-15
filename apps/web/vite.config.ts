// vite.config.ts
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// TODO: revisit this as its not optimal
function copySprites() {
  return {
    name: 'copy-pokemon-sprites',
    buildStart() {
      const sourceDir = join(process.cwd(), 'node_modules/pokemon-sprites/sprites');
      const destDir = join(process.cwd(), 'static/pokemon-sprites');
      
      if (!existsSync(sourceDir)) return;
      
      function copyRecursive(src: string, dest: string) {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        
        const entries = readdirSync(src);
        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);
          
          if (statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyRecursive(sourceDir, destDir);
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    // copySprites()
  ]
});
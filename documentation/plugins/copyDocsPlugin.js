import fs from 'fs';
import path from 'path';

export default function copyDocsPlugin() {
  return {
    name: 'copy-docs-plugin',

    async loadContent() {
      const docsDir = path.join(process.cwd(), 'docs');
      const outDir = path.join(process.cwd(), 'static', 'md');

      // Ensure output directory exists
      fs.mkdirSync(outDir, { recursive: true });

      // Recursively copy docs → static/raw-docs
      function copyRecursive(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      copyRecursive(docsDir, outDir);
    },
  };
}

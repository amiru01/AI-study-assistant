import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: false,  // Disable public dir to avoid conflicts

    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main:      resolve(__dirname, 'index.html'),
                auth:      resolve(__dirname, 'pages/auth.html'),
                dashboard: resolve(__dirname, 'pages/dashboard.html'),
                library:   resolve(__dirname, 'pages/library.html'),
                study:     resolve(__dirname, 'pages/study.html'),
                upload:    resolve(__dirname, 'pages/upload.html'),
                // Public pages
                'public-auth':      resolve(__dirname, 'public/auth-refactored.html'),
                'public-dashboard': resolve(__dirname, 'public/dashboard.html'),
                'public-library':   resolve(__dirname, 'public/library.html'),
                'public-study':     resolve(__dirname, 'public/study.html'),
                'public-upload':    resolve(__dirname, 'public/upload.html'),
            },
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
    },

    server: {
        port: 5173,
        open: '/',   // open at landing page
    },

    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },

    optimizeDeps: {
        include: ['pdfjs-dist', 'mammoth', '@supabase/supabase-js', 'motion'],
    },
});

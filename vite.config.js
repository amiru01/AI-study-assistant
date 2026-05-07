import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: false,

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
            },
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
        include: ['pdfjs-dist', 'mammoth', '@supabase/supabase-js'],
    },
});

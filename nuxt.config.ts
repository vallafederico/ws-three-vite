import gsls from "vite-plugin-glsl";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  ssr: false,

  vite: {
    // server: {
    //   hmr: false,
    // },
    plugins: [
      gsls({
        include: [
          "**/*.glsl",
          "**/*.vert",
          "**/*.frag",
          // "**/*.wgsl",
          // "**/*.vs",
          // "**/*.fs",
        ],
        exclude: undefined, // Glob pattern, or array of glob patterns to ignore
        warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
        defaultExtension: "glsl", // Shader suffix when no extension is specified
        compress: false, // Compress output shader code
        watch: true, // Recompile shader on change
        root: "/", // Directory for root imports
      }),
    ],
  },
});

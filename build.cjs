
const { execSync } = require("child_process");

if (process.env.VERCEL) {
  console.log("====================================================");
  console.log("Running on Vercel CI");
  console.log("Skipping local build to preserve the pre-rendered");
  console.log("static HTML files inside the /dist folder from GitHub.");
  console.log("====================================================");
  process.exit(0);
} else {
  console.log("Running local build (Vite + Puppeteer SSG)...");
  execSync("vite build && node prerender.js", { stdio: "inherit" });
}


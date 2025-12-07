22:20:49.406 Running build in Washington, D.C., USA (East) – iad1
22:20:49.407 Build machine configuration: 2 cores, 8 GB
22:20:49.539 Cloning github.com/HerrMattie/museathuis (Branch: main, Commit: 33f35cf)
22:20:49.836 Cloning completed: 297.000ms
22:20:50.233 Restored build cache from previous deployment (rfrGkHP6J1oWgsEyHpVfoUcLCF25)
22:20:50.687 Running "vercel build"
22:20:51.100 Vercel CLI 49.0.0
22:20:51.413 Installing dependencies...
22:20:52.720 
22:20:52.721 up to date in 983ms
22:20:52.721 
22:20:52.722 150 packages are looking for funding
22:20:52.722   run `npm fund` for details
22:20:52.754 Detected Next.js version: 14.1.0
22:20:52.759 Running "npm run build"
22:20:52.882 
22:20:52.883 > museathuis-premium@0.1.0 build
22:20:52.883 > next build
22:20:52.883 
22:20:53.537    ▲ Next.js 14.1.0
22:20:53.539 
22:20:53.595    Creating an optimized production build ...
22:20:54.154  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
22:20:57.203  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
22:20:58.094  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
22:21:00.341  ✓ Compiled successfully
22:21:00.345    Linting and checking validity of types ...
22:21:00.640 
22:21:00.642    We detected TypeScript in your project and reconfigured your tsconfig.json file for you. Strict-mode is set to false by default.
22:21:00.642    The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:
22:21:00.642 
22:21:00.643    	- include was updated to add '.next/types/**/*.ts'
22:21:00.643    	- plugins was updated to add { name: 'next' }
22:21:00.643 
22:21:03.417 Failed to compile.
22:21:03.418 
22:21:03.419 ./app/dashboard/dayprogram/page.tsx:85:14
22:21:03.419 Type error: Property 'from' does not exist on type '() => PublicSupabaseClient'.
22:21:03.419 
22:21:03.419 [0m [90m 83 |[39m         ] [33m=[39m [36mawait[39m [33mPromise[39m[33m.[39mall([[0m
22:21:03.419 [0m [90m 84 |[39m           supabase[0m
22:21:03.420 [0m[31m[1m>[22m[39m[90m 85 |[39m             [33m.[39m[36mfrom[39m([32m"tours"[39m)[0m
22:21:03.420 [0m [90m    |[39m              [31m[1m^[22m[39m[0m
22:21:03.420 [0m [90m 86 |[39m             [33m.[39mselect([32m"id, title"[39m)[0m
22:21:03.420 [0m [90m 87 |[39m             [33m.[39morder([32m"created_at"[39m[33m,[39m { ascending[33m:[39m [36mfalse[39m })[0m
22:21:03.421 [0m [90m 88 |[39m             [33m.[39mlimit([35m100[39m)[33m,[39m[0m
22:21:03.458 Error: Command "npm run build" exited with 1

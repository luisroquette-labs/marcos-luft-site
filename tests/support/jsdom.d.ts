// `jsdom` ships no type declarations and `@types/jsdom` isn't a project dependency;
// this ambient module keeps `tsc --noEmit` clean without adding a new package for a
// single dev-only import (tests/component/stat-counter.test.tsx).
declare module "jsdom";

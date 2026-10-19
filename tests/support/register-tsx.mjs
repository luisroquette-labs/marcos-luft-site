// Bootstrap: registers tsx-loader.mjs so `node --import ./tests/support/register-tsx.mjs
// --test ...` can load .tsx component tests. See tsx-loader.mjs for why this is needed.
import { register } from "node:module";

register("./tsx-loader.mjs", import.meta.url);

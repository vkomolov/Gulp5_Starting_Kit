'use strict';
//here is some imports
import { test } from "./helpers/funcs.js";

//here is some test message to dev tools...
document.addEventListener("DOMContentLoaded", async () => {
  console.log("hello from someFile.js...");
  console.log(test());
});
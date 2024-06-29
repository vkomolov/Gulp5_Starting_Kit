'use strict';

import { test } from "./helpers/funcs.min.js";

const newFunc = async (str) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(str);
    }, 1000)
  })
}
document.addEventListener("DOMContentLoaded", async () => {
  console.log(test());
  const res = await newFunc("hello from async func");
  console.log(res);
});
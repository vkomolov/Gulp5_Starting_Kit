'use strict';
//here is some test imports

//here is some async functions
const newFunc = async (str) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(str);
    }, 1000)
  })
}

//here is some test message to dev tools...
document.addEventListener("DOMContentLoaded", async () => {
  const res = await newFunc("hello from async func at index.js...");
  console.log(res);
});
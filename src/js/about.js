'use strict';

import { test } from "./helpers/funcs.js";

//TODO: сделать динамическую загрузку плагина
import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';

//new AirDatepicker('#my-element'[, options])
new AirDatepicker("#calendar", {
  startDate: new Date(),
  weekends: [0, 6],
  position: "top right",
  showOtherMonths: true,
  moveToOtherMonthsOnSelect: true,
  buttons: ["today"]
});

const newFunc = async (str) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(str);
    }, 1000)
  })
}
document.addEventListener("DOMContentLoaded", async () => {
  console.log(test());
  const res = await newFunc("hello from async func...");
  console.log(res);
});
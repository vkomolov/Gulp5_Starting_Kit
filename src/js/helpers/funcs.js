'use strict';

export function randomNum(max, min) {
  return Math.floor(Math.random() * max) + min;
}

/**
 *  It randomly chooses the requested amount of elems from the given array
 * @param {Array} fromArray - target array
 * @param {number} [maxRandCount=1] max number of the random elems from the given array
 * @return {*[] | []} the array of the random elements from the given array
 */
export function getRandomElemsfromArray(fromArray, maxRandCount = 1) {
  if (!Array.isArray(fromArray) || fromArray.length < maxRandCount) {
    console.error(`the length of the given array ${fromArray.length} should not be less than max random count ${maxRandCount}...`);
    return [];
  }

  // Shuffle the array randomly (Fisher-Yates method)
  for (let i = fromArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fromArray[i], fromArray[j]] = [fromArray[j], fromArray[i]]; // Swapping elements
  }

  // Return the first maxRandCount numbers
  return fromArray.slice(0, maxRandCount);
}


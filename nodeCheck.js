"use strict";

import fs from "fs";
const path = '.nvmrc';

// Checking for the existence of the .nvmrc file using fs.existsSync
if (!fs.existsSync(path)) {
  console.error("Error: .nvmrc file not found. Create .nvmrc in the root directory and write a Node version without brackets...");
  process.exit(1);
}

// Reading Node.js version from .nvmrc file
let requiredVersion = fs.readFileSync(path, 'utf8');

// Remove all unwanted invisible characters (such as control characters, zero-width spaces, etc.)
requiredVersion = requiredVersion.replace(/[\x00-\x1F\x7F\u200B\uFEFF]/g, "").trim();

// If the version in .nvmrc is empty, display an error
if (!requiredVersion) {
  console.error('Error: .nvmrc is empty or does not contain a Node version.');
  process.exit(1);
}

// Current version of Node.js
const currentVersion = process.version.slice(1).trim();  // v22.2.0 will be sliced to 22.2.0

console.log(`Required Node.js version: ${requiredVersion}`);
console.log(`Current Node.js version: ${currentVersion}`);

// Compare versions
if (currentVersion !== requiredVersion) {
  console.error(`Error: Node version mismatch. Required: ${requiredVersion}, but current: ${currentVersion}. Please use the version required in .nvmrc.`);
  process.exit(1);
} else {
  console.log('Success: Node version is correct. Proceeding script...');
}
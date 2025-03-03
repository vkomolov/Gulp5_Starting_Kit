"use strict";

/**
 * Creates a new HTML element with specified tag and adds the provided CSS classes to it.
 *
 * @param {string} tag - The tag name of the element to create (e.g., 'div', 'span', 'p').
 * @param {...string} classNames - One or more class names to be added to the newly created element.
 * @returns {HTMLElement} The newly created HTML element with the specified tag and classes.
 *
 * @example
 * const div = createElementWithClass('div', 'container', 'main');
 * console.log(div); // <div class="container main"></div>
 */
export function createElementWithClass(tag, ...classNames) {
	const element = document.createElement(tag);
	element.classList.add(...classNames);
	return element;
}

/**
 * Replaces the file path of the given URL with a new base path.
 *
 * @param {string} url - The original URL (either `src` or `srcset`) with the file.
 * @param {string} targetFolder - the part of the path (folder) to remove from the path...
 * @returns {string} The updated URL with the new base path to the given file.
 */
export function replaceFilePath(url, targetFolder) {
	//to clean from symbols as "./thumbs/", "./thumbs", "/thumbs/", "/thumbs" to "thumbs"
	const nestedFolder = targetFolder.replace(/^\.?\/?|\/?\.?$/, "");

	return url.replace(new RegExp(`/${nestedFolder}/`), "/"); // If no match is found, return the original URL
}
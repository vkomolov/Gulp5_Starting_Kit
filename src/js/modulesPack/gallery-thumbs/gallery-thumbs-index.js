"use strict";

import TouchSweep from "touchsweep";

import { createElementWithClass, replaceFilePath } from "./gallery-thumbs-funcs.js";

//const TouchSweep = TouchSweepModule.default;

//////// END OF IMPORTS //////////////////

/**
 * Initializes a thumbnail gallery with modal functionality.
 * @param {string} gallerySelector - Selector for the gallery container.
 * @param {string} [thumbsFolder="thumbs"] - the nested folder of the path, where the gallery with the minimized
 * images are located... The gallery container with gallerySelector comprises those images...
 * It is used for replacing the path of the image to the high dimension image for the modal view...
 * @throws {Error} If the gallery container or media elements are not found.
 */
export function initThumbs(gallerySelector, thumbsFolder = "thumbs") {
	const galleryBlock = document.querySelector(gallerySelector);
	if (!galleryBlock) {
		throw new Error("at initGalleryThumbs: The given 'galleryContainer' is not in the DOM...");
	}

	//for checking media tags (!!! <img> in dist *.html must be located only <picture>)
/*	const queryTags = ["picture"];
	const mediaArr = Array.from(galleryBlock.querySelectorAll(queryTags.join(", ")));*/

	////// ALTERNATIVE: to include images, if they are not in <picture> tag...
	const queryTags = ["picture", "img"];
	const mediaArr = Array.from(galleryBlock.querySelectorAll(queryTags.join(", ")))
		.filter(elem => {
			// Condition to exclude <img> inside <picture>
			if (elem.tagName === "IMG") {
				// Check if <img> is inside <picture>
				const parent = elem.parentElement;
				return !(parent.tagName === "PICTURE");
			}
			// For all other elements (not <img>) to keep them in the selection
			return true;
		});

	if (!mediaArr.length) {
		console.warn(`at initThumbs: the found mediaArr is empty: ${mediaArr.length}... `);
		return;
	}

	const runThumbs = initModal(mediaArr, {
		thumbsFolder,
		queryTags
	});

	galleryBlock.addEventListener("click", ({ target }) => {
		const foundIndex = mediaArr.findIndex(item => item === target.parentElement || item === target);
		if (foundIndex === -1) {
			console.error("at initThumbs: the clicked element is not found in the gallery... omitting click...");
		}
		else {
			document.body.style.overflow = "hidden";
			runThumbs(foundIndex);
		}
	});
}

/**
 * Initializes the modal for the gallery.
 * @param {HTMLElement[]} mediaArr - Array of media elements.
 * @param {Object} params - params for creating the cloned image
 * @param {string} params.thumbsFolder - the nested folder of the path, where the gallery with the minimized
 * images are located... The gallery container with gallerySelector comprises those images...
 * It is used for replacing the path of the image to the high dimension image for the modal view...
 * @param {Array<string>} params.queryTags - the array of the image tags to operate with...
 *
 * @returns {Function} Function to run the modal with the clicked index.
 */
function initModal(mediaArr, params) {
	let currentIndex = null;
	let swipeListenersAdded = false; // Flag to check if the swipe listeners have already been added
	const modalData = createModal();
	const {
		modal ,
		mediaContainer,
		imgScore,
	} = modalData;

	const actions = {
		close: handleEscape,
		prev: getPrev,
		next: getNext,
		Escape: handleEscape,
		ArrowLeft: getPrev,
		ArrowRight: getNext,
	};


//! swipe handler TouchSweep
	const touchThreshold = 20;
	// adding TouchSweep to modal
	const touchSweepHandler = new TouchSweep.default(modal, {}, touchThreshold);

	const handleClick = ({ target }) => {
	const { type } = target.dataset;
	if (type && actions[type]) {
		actions[type]();
	}
};


	return (clickedIndex) => {
		if (!document.body.contains(modal)) {
			document.body.appendChild(modal);
		}
		cycleThumbs(clickedIndex);


		if (!swipeListenersAdded) {
			// Adding swipe events when a modal is first opened
			modal.addEventListener("swipeleft", getPrev);
			modal.addEventListener("swiperight", getNext);

			swipeListenersAdded = true; // Set the flag that listeners have been added
		} else {
			// If the swipe listeners have already been added, simply enable swipe processing
			touchSweepHandler.bind();
		}

		modal.addEventListener("click", handleClick);
		document.addEventListener("keydown", handleKey);
	};

	function getPrev() {
		const index = currentIndex === 0 ? mediaArr.length - 1 : currentIndex - 1;
		cycleThumbs(index);
	}

	function getNext() {
		const index = currentIndex === mediaArr.length - 1 ? 0 : currentIndex + 1;
		cycleThumbs(index);
	}

	function handleKey(event) {
		if (event.key in actions) {
			actions[event.key]();
		}
	}

	function handleEscape() {
		touchSweepHandler.unbind(); //remove all previously attached event listeners in TouchSweep

		modal.removeEventListener("click", handleClick);
		document.removeEventListener("keydown", handleKey);

		modal.remove();
		document.body.style.overflow = "auto";
	}

	function cycleThumbs(clickedIndex) {
		if (clickedIndex === currentIndex) return;

		currentIndex = clickedIndex;
		const clickedElem = mediaArr[clickedIndex];

		const imgAlt = getAltText(clickedElem);
		imgScore.textContent = `${clickedIndex + 1} / ${mediaArr.length}${imgAlt ? `: ${imgAlt}` : ""}`;

		//removing the previous cloned element...
		if (modalData.clonedMediaItem) {
			mediaContainer.removeChild(modalData.clonedMediaItem);
		}

		modalData.clonedMediaItem = getClonedElement(clickedElem, params);
		modalData.clonedMediaItem.classList.add("picture-item");

		mediaContainer.appendChild(modalData.clonedMediaItem);

		setTimeout(() => {
			modalData.clonedMediaItem.style.opacity = "1";
		}, 0);
	}
}

function getAltText(element) {
	if (element.tagName === "IMG" && element.hasAttribute("alt")) {
		return element.getAttribute("alt");
	}
	//if the element comprises <img> (as a rule)...
	const img = element.querySelector("img");
	if (img && img.hasAttribute("alt")) {
		return img.getAttribute("alt");
	}

	//If the alt attribute is not found, return the string "picture"
	return "picture";
}

/**
 * It creates the clone of the clicked image element and alters the sources to the images
 * @param {HTMLElement} sourceElem - image element (<img> or <picture>)
 * @param {Object} params - params for creating the cloned image
 * @param {string} params.thumbsFolder - the nested folder of the path, where the gallery with the minimized
 * images are located... The gallery container with gallerySelector comprises those images...
 * It is used for replacing the path of the image to the high dimension image for the modal view...
 * @param {Array<string>} params.queryTags - the array of the image tags to operate with...
 *
 * @returns {HTMLElement}
 */
function getClonedElement(sourceElem, params) {
	const {thumbsFolder, queryTags} = params;

	if (!(queryTags.includes(sourceElem.tagName.toLowerCase()))) {
		console.warn(`at getClonedImage: the given element with tagName: ${ sourceElem.tagName } is not
		in the tag operation list: [${ Object.keys(queryTags).join(", ") }]... returning the origin element...`);

		return sourceElem;
	}

	const updateSource = (item) => {
		let attr = null;

		if (item.hasAttribute("src")) {
			attr = "src";
		}
		else if (item.hasAttribute("srcset")) {
			attr = "srcset";
		}

		const originSrc = item.getAttribute(attr);
		const updatedSrc = replaceFilePath(originSrc, thumbsFolder);

		item.setAttribute(attr, updatedSrc);
	}

//cloning the image HTMLElement with altering the image sources...
	const clonedElem = sourceElem.cloneNode(true);

	if (clonedElem?.children.length) {
		for (const item of clonedElem.children) {
			updateSource(item);
		}
	}
	else {
		updateSource(clonedElem);
	}

	return clonedElem;
}

/**
 * Creates a modal element with all necessary child elements.
 * @returns {Object} An object containing the modal element and its children.
 */
function createModal() {
	const modal = createElementWithClass("div", "modal");
	const scoreBar = createElementWithClass("div", "modal__bar");
	const arrowBar = createElementWithClass("div", "modal__bar", "modal__bar--arrow");
	const imgScore = createElementWithClass("span", "modal-score");
	const closeButton = createButton("X", "close");
	const arrowPrev = createButton("<", "prev");
	const arrowNext = createButton(">", "next");
	const mediaContainer = createElementWithClass("div", "media-container");

	scoreBar.append(imgScore, closeButton);
	arrowBar.append(arrowPrev, arrowNext);
	modal.append(scoreBar, arrowBar, mediaContainer);

	return {
		modal,
		mediaContainer,
		imgScore,
		clonedMediaItem: null,
	};
}

/**
 * Creates a button element with the specified text and type.
 * @param {string} text - The text content of the button.
 * @param {string} type - The type of the button (e.g., 'close', 'prev', 'next').
 * @returns {HTMLElement} The created button element.
 */
function createButton(text, type) {
	const button = createElementWithClass("span", 'thumb-arrow', type);
	button.textContent = text;
	button.dataset.type = type;
	button.tabIndex = 0;
	return button;
}

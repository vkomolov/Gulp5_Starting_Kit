'use strict';

//import { gsap } from "gsap";
//import imagesLoaded from 'imagesloaded';

/**
 * It checks whether the given style rule is supported for the given HTML Element
 * @param {HTMLElement} element - target HTML Element
 * @param {string} param - css rule
 * @param {string} value - the value of the css rule
 * @return {boolean}
 */
export function isStyleSupported (element, param, value) {
    return param in element.style && CSS.supports(param, value);
}

/**
 * it migrates the given HTML Element to another HTML parent
 * @param {HTMLElement} target - the target HTML Element
 * @param {HTMLElement} parentFrom - the current HTML parent
 * @param {HTMLElement} parentTo - the target HTML parent to migrate to
 */
export function migrateElement({ target, parentFrom, parentTo }) {
    if (target.parentNode) {
        (target.parentNode === parentFrom ? parentTo : parentFrom).appendChild(target);
    }
    else {
        console.warn(`transitBox: target in not in DOM: ${target}`);
    }
}

/**
 * Fountains a certain number of balls with GSAP (!!! must be installed with npm i gsap)
 * @param {HTMLElement} targetElem - the target Element for animation
 * @param {Object} [params={}] - additional params
 * @param {number} [params.ballsCount = 1] - The quantity of the balls to be fountained. Defaults to 1 if not provided.
 * @param {Object} [params.cssStyles={}] additional css styles of the balls
 * @param {boolean} [params.animateSeparate=false] the flag for separate animation of the balls
 * @param {string[]} [params.ballColors=[]] If not provided, a default inner array (ballColorsArr) is used:
 *
 * @return {gsap.core.Timeline | null}
 */
export function fountainBalls(targetElem, params = {}) {
    if (typeof gsap === "undefined") {
        console.error("GSAP is not installed... use npm i gsap...");
        return null;
    }

    if (!document.body.contains(targetElem)) {
        console.error(`the given targetElem ${targetElem} is not in DOM...`);
        return null;
    }

    ///////////// INITIAL SETTINGS /////////////////

    const ballStylesObj = {
        position: "absolute",
        width: "30px",
        height: "30px",
        top: "50%",
        left: "50%",
        borderRadius: "50%",
        zIndex: "-1",
        visibility: "hidden",
        scale: "0"
    };
    const ballColorsArr = [
        "#0adb38",
        "#db0ac6",
        "#db0a11",
        "#150adb",
        "#0adbca",
        "#cddb0a"
    ];

    const {
        ballsCount = 1,
        cssStyles = {},
        animateSeparate = false,
        ballColors = [],
    } = params;

    const ballStyles = {
        ...ballStylesObj,
        ...cssStyles
    }
    const colors = ballColors.length ? ballColors : ballColorsArr;

    /**
     * Function for "fountain" movement of balls with the common animations
     * @param {gsap.core.Timeline} tl - the timeline for the animation
     * @param {HTMLElement[]} ballsArray - the real array (not collection) of DOM elements
     * @return {void}
     */
    const fountainAll = (tl, ballsArray=[]) => {
        // Clear and reset the timeline
        tl.clear().progress(0);

        // Setting initial values directly in the timeline
        tl.set(ballsArray, {
            //if to remove the initial positions of the balls, they will appear in different places of the area
            //x: 0,
            y: 0,
            immediateRender: false // prevents immediate render of the settings
        });

        // Animation of appearing balls with the random size and random color
        tl.to(ballsArray, {
            autoAlpha: 1,
            scale: function() {
                return gsap.utils.random(0.3, 1);
            },
            backgroundColor: function() {
                return gsap.utils.random(colors);
            },
            duration: 0.1,
            //stagger: 0.1, // delay between animations for each ball
        })

        // Animation of balls moving up the Y axis
        tl.to(ballsArray, {
            y: function() {
                return gsap.utils.random(-70, -100);
            },
            stagger: {
                //each: 0.1, // delay between animations for each ball
                repeat: 1, // repeat once (for the "back" effect)
                yoyo: true, // animation "forward-backward"
                //from: "random",  // "start", "random", "center", "end" to determine the order
            },
            ease: "circ", // smooth deceleration at the end
        }, 0)

        // Animation of balls on the X axis
        tl.to(ballsArray, {
              x: () => gsap.utils.random(-200, 200),
              ease: "none", // linear animation
              duration: 1, // animation duration on X axis
              //stagger: 0.1, // delay between balls
          }, 0) // starting the animation on the X axis at the same time as on the Y axis

        // Hiding the balls after animation
        tl.to(ballsArray, {
            autoAlpha: 0,
            duration: 0.1
        }, "-=0.1");

        // Starting the timeline
        tl.play();
    };

    /**
     * Function for "fountain" movement of balls with the separate animations
     * @param {gsap.core.Timeline} tl - the timeline for the animation
     * @param {HTMLElement[]} ballsArray - the real array (not collection) of DOM elements
     * @return {void}
     */
    const fountainSeparate = (tl, ballsArray = []) => {
        // Clear and reset the timeline
        tl.clear().progress(0);

        // Checking for the nested timelines in the main timeline if the animation has already been run
        const childTimeLines = tl.getChildren(false, false, true);

        /**
         * Creating the inner timelines of each ball or using the already created inner timelines of the previous run
         * Adding the animations to the separate inner timeline of each ball
         */
        ballsArray.forEach((ball, index) => {
            let ballTl = childTimeLines[index];
            if (!ballTl) {
                ballTl = gsap.timeline();
                tl.add(ballTl, index * 0.2);
            }

            //to avoid the IDE alerts on checking the method "to" in childTimeLines[index]
            if ("to" in ballTl && typeof ballTl.to === "function") {
                // Animation of appearing of each ball with the random size and random color
                ballTl.to(ball, {
                    autoAlpha: 1,
                    scale: gsap.utils.random(0.3, 1),
                    backgroundColor: gsap.utils.random(colors),
                    duration: 0.1
                });

                // Animation of each ball moving up the Y axis
                ballTl.to(ball, {
                    y: gsap.utils.random(-70, -100),
                    //duration: 1,
                    ease: "circ",   // smooth deceleration at the end
                    yoyo: true, // animation "forward-backward"
                    repeat: 1,   // repeat once (for the "back" effect)
                }, 0);

                // Animation of balls on the X axis
                ballTl.to(ball, {
                    x: gsap.utils.random(-200, 200),
                    duration: 1,    // animation duration on X axis
                    ease: "none",   // linear animation
                }, 0);  // starting the animation on the X axis at the same time as on the Y axis

                // Hiding the balls after animation
                ballTl.to(ball, {
                    autoAlpha: 0,
                    duration: 0.1
                }, "-=0.1");
            }
        });

        // Starting the timeline
        tl.play();
    }

    ///////////// END OF INITIAL SETTINGS /////////////////

    // Adding styles to the target element: position: relative; and display: inline-block;
    targetElem.style.position = "relative";
    targetElem.style.display = "inline-block";

    //creating balls with account to the given balls count in params
    const ballsArr = [];

    for (let i = 1; i <= ballsCount; i++) {
        let ball = document.createElement("div");
        Object.assign(ball.style, ballStyles);
        targetElem.appendChild(ball);
        ballsArr.push(ball);
    }

    const tl = gsap.timeline({ paused: true });

    targetElem.addEventListener("mouseenter", () => {
        animateSeparate ? fountainSeparate(tl, ballsArr) : fountainAll(tl, ballsArr);
    });

    return tl;
}

/**
 * It creates a debounced event listener that ensures the provided callback is called
 * only after a specified delay, regardless of how frequently the event is triggered.
 *
 * @param {string} event - The name of the event to listen for (e.g., "click", "scroll").
 * @param {HTMLElement|Window|Document} listenerOwner - The target element, window, or document
 *   that will receive the event listener.
 * @param {number} [delay=300] - The delay in milliseconds before the callback is executed
 *   after the event is triggered. Defaults to 300ms.
 * @returns {Function} A function that accepts a callback (`cb`) and optional parameters (`params`).
 *   This function attaches the event listener with debouncing behavior. The returned function
 *   also returns another function for removing the event listener.
 *
 * @example
 * const removeClickListener = lockedEventListener("click", document.body, 500)(
 *   () => console.log("Click event triggered!"),
 *   []
 * );
 *
 * // To remove the listener:
 * removeClickListener();
 */
export function lockedEventListener(event, listenerOwner, delay = 300) {
    if (window !== listenerOwner && document !== listenerOwner && !(document.contains(listenerOwner))) {
        throw new Error("Provided listenerOwner at lockedEventListener() is not a valid DOM element...");
    }

    let isLocked = false;

    return (cb, params = []) => {
        const handler = () => {
            if (!isLocked) {
                isLocked = true;
                setTimeout(() => {
                    cb(...params);
                    isLocked = false;
                }, delay);
            }
        };

        listenerOwner.addEventListener(event, handler);

        return () => {
            listenerOwner.removeEventListener(event, handler);
        };
    };
}

/**
 * Adds or removes a class on a target element based on the scroll position of a trigger element.
 * The class is added when the trigger element is scrolled past the top of the viewport,
 * and removed when the trigger element is scrolled back above the viewport.
 *
 * The function ensures that the class is only toggled once per specified time interval during scrolling,
 * preventing excessive animations or layout changes.
 *
 * @param {HTMLElement} target - The DOM element that will have the class added or removed based on scroll position.
 * @param {HTMLElement} trigger - The DOM element that triggers the style change when it reaches the top of the viewport.
 * @param {string} classActivation - The CSS class that will be added or removed on the target element.
 * @param {HTMLElement|Window|Document} [scrollOwner=window] - The element or object that will be used to track the scroll event. Default is the `window`.
 * @param {number} [scrollTimeLimit=300] - The time delay in milliseconds to limit the frequency of scroll event handling. Default is 300ms.
 *
 * @example
 * customTargetStyleOnScroll(
 *   document.querySelector(".target"),
 *   document.querySelector(".trigger"),
 *   "scrolled",
 *   window,
 *   200
 * );
 */
export function customTargetStyleOnScroll(target, trigger, classActivation, scrollOwner = window, scrollTimeLimit = 300) {
    if (!document.contains(target) || !document.contains(trigger)) {
        throw new Error("at initTopAppearanceOnScroll(): the given target or trigger are not found in DOM...");
    }

    /**
     * is scrolledNav is already active to avoid extra animations
     * @type {boolean}
     */
    let isScrolledActive = false;

    const initScrollLimiter = lockedEventListener("scroll", scrollOwner, scrollTimeLimit);
    initScrollLimiter(() => {
        const triggerTop = trigger.getBoundingClientRect().top;

        if (triggerTop <= 0) {
            if (!isScrolledActive) {
                requestAnimationFrame(() => {
                    target.classList.add(classActivation);
                    isScrolledActive = true;
                });
            }
        }
        else {
            if (isScrolledActive && target.classList.contains(classActivation)) {
                requestAnimationFrame(() => {
                    target.classList.remove(classActivation);
                    isScrolledActive = false;
                });
            }
        }
    });
}

/**
 *  It sets attributes to HTMLElement instances
 * @param {[HTMLElement]} [elements=[]] the list of HTMLElements to be set with the attributes
 * @param {Object} [targetAttr={}] consists of the keys as the attributes and the values
 * @returns {void}
 */
export function setAttributes(elements = [], targetAttr = {}) {

    elements.forEach((element, i) => {
        if (!(element instanceof HTMLElement)) {
            throw new Error(`one of the elements at index ${i} is not the instance of HTMLElement...`);
        }

        Object.entries(targetAttr).forEach(([attr, value]) => {
            element.setAttribute(attr, (value !== null && value !== undefined) ? value.toString() : "");
        });
    });
}

/**
 * @function getImagesLoaded    (!!! must be installed with npm install imagesloaded)
 * @description Processes all images within a given container, ensuring they are fully loaded and retrieves their dimensions.
 * Removes broken images along with their parent elements from the DOM.
 *
 * @param {HTMLElement} container - The container element holding image elements or their parent blocks.
 * @param {Object} [options={}] - Additional options for controlling how background images are detected on load.
 * @param {boolean|string} [options.background] -
 *   - If set to `true`, the function will also watch for the load of background images (as defined by CSS `background-image`).
 *   - If set to a string, it specifies a CSS selector to watch for background images within elements that match this selector.
 *
 *   Examples:
 *   - `{ background: true }` - Will detect background images for all elements.
 *   - `{ background: '.item' }` - Will detect background images for elements matching the `.item` selector.
 */
export function getImagesLoaded(container, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            // Check if imagesLoaded library is available
            if (typeof imagesLoaded === "undefined") {
                reject(new Error("imagesLoaded library is not loaded. Please ensure it is included before using getImagesLoaded."));
                return;
            }
            if (!container || !document.contains(container)) {
                reject(new Error("The given container is not found in the DOM."));
                return;
            }

            imagesLoaded(container, options, instance => {
                const brokenImages = [];
                const loadedImagesPromises = [];

                //making the static array with references to DOM elements
                const imgArr = Array.from(container.children);

                const getSize = img => ({
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    offsetWidth: img.offsetWidth,
                    offsetHeight: img.offsetHeight,
                });

                const ensureSize = img => new Promise(res => {
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                        res(getSize(img));
                    } else {
                        img.onload = () => res(getSize(img));
                    }
                });

                instance.images.forEach((item, index) => {
                    if (!item.isLoaded) {
                        brokenImages.push({
                            src: item.img.src,
                            elem: imgArr[index],  //adding the block with the broken image
                        });
                    }
                    else {
                        const sizePromise = ensureSize(item.img).then(size => ({
                            elem: imgArr[index],
                            size,
                        }));
                        loadedImagesPromises.push(sizePromise);
                    }
                });

                // Displaying a warning and removing the elements with the broken images...
                if (brokenImages.length > 0) {
                    brokenImages.forEach(({ src, elem }) => {
                        console.warn("The following URL of the image is not found at getImagesLoaded: ", src);
                        if (elem) elem.remove();
                    });
                }

                resolve(Promise.all(loadedImagesPromises));
            });
        } catch (e) {
            reject(new Error("Error in getImagesLoaded: " + e.message));
        }
    });
}

/**
 * Initializes a masonry grid layout for the specified container, positioning its child image elements.
 * The function calculates the number of columns based on the container's width and the image item's width,
 * and positions the images in a masonry style with specified gaps between them.
 * If a free space in a row exists then it places the columns in the center position...
 *
 * @async
 * @function createMasonry
 * @param {string} containerSelector - The CSS selector of the container element where the masonry grid will be applied.
 * @param {Object} [params={}] - Optional configuration parameters for masonry initialization.
 * @param {number} [params.gap=0] - The gap (in pixels) between the items in the masonry grid. Defaults to 0.
 *
 * @returns {Promise<Element[]>} - A promise that resolves to an array of image elements in the container, after they have been positioned.
 *
 * @throws {Error} - If the specified container is not found in the DOM or if there is an issue with loading the images.
 *
 * @example
 * // Initialize masonry grid with a 20px gap
 * createMasonry('#gallery', { gap: 20 }).then((imageItems) => {
 *   console.log('Masonry initialized and images positioned:', imageItems);
 * });
 */
export async function createMasonry(containerSelector, params = {}) {
    const options = {
        gap: 0,
    };
    const auxOptions = {
        ...options,
        ...params,
    };

    try {
        const container = document.querySelector(containerSelector);
        if (!container) {
            throw new Error(`at initMasonry: no such selector ${containerSelector} found in DOM`);
        }

        const imagesArr = await getImagesLoaded(container);
        const imageItems = [];

        const imgItem = imagesArr[0].elem;
        const itemWidth = imgItem.offsetWidth;
        const containerWidth = container.clientWidth;

        const { gap } = auxOptions;
        const { columns, freeWidth } = getColumnsNumber(containerWidth, itemWidth, gap);
        const leftOffset = freeWidth / 2;

        container.style.position = "relative";
        container.style.overflowX = "hidden";

        // Initializing arrays for calculating positions
        const posLeftArr = Array.from({ length: columns }, (_, i) => leftOffset + i * (itemWidth + gap));
        const posTopArr = new Array(columns).fill(0);

        // Arranging the elements
        for (let i = 0; i < imagesArr.length; i++) {
            const item = imagesArr[i].elem;
            imageItems.push(item);
            const itemHeight = imagesArr[i].size.offsetHeight;

            // Finding the index of the column with the minimum height
            const minColumnIndex = posTopArr.indexOf(Math.min(...posTopArr));
            // Making sure that minColumnIndex is always a number
            if (minColumnIndex === -1) {
                throw new Error("Invalid column index: no minimum found in posTopArr");
            }

            // Setting the position of the element
            item.style.position = "absolute";
            item.style.top = `${Math.round(posTopArr[minColumnIndex])}px`;
            item.style.left = `${Math.round(posLeftArr[minColumnIndex])}px`;

            // Updating the column height
            posTopArr[minColumnIndex] += itemHeight + gap;
        }

        function getColumnsNumber(containerWidth, itemWidth, gap) {
            const itemGapWidth = itemWidth + gap;
            const maxColumns = Math.floor(containerWidth / itemGapWidth);
            const usedWidth = maxColumns * itemGapWidth;
            const remainingSpace = containerWidth - usedWidth;

            const columns = remainingSpace >= itemWidth ? maxColumns + 1 : maxColumns;
            const freeWidth = containerWidth - (columns * itemWidth + (columns - 1) * gap);

            return { columns, freeWidth };
        }

        return imageItems;
    } catch (error) {
        console.error("at initMasonry: ", error.message);
    }
}

/**
 * Replaces the file path of the given URL with a new base path.
 *
 * @param {string} url - The original URL (either `src` or `srcset`) with the file.
 * @param {string} newBase - The new base URL to prepend.
 * @returns {string} The updated URL with the new base path to the given file.
 */
export function replaceFilePath(url, newBase) {
    const match = url.match(/([^/]+\.\w+(\s\d+x)?)$/); // Find the file name with extension and parameters (if any)

    if (match) {
        const fileNameWithExt = match[0]; // File name with extension (and possible parameters)
        const cleanBase = newBase.replace(/^\/+|\/+$/g, ''); // Removing leading and trailing slashes

        return `${cleanBase}/${fileNameWithExt}`;
    }

    return url; // If no match is found, return the original URL
}
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
 * A function that adds a scroll event listener to a DOM element, window, or document,
 * with a delay to limit the number of times the callback function is triggered during scroll events.
 * It prevents the callback from being called too frequently by using a "lock" mechanism.
 *
 * @param {HTMLElement|Window|Document} listenerOwner - The DOM element, window, or document to listen for scroll events.
 * @param {number} [delay=300] - The delay (in milliseconds) between consecutive callback executions. Defaults to 300ms.
 * @returns {Function} A function that accepts a callback and parameters, and returns another function to remove the scroll event listener.
 *
 * @throws {Error} If the listenerOwner is not a valid DOM element, window, or document.
 *
 * @example
 * // Example of using scrollLimitedListener with the window object
 * const initScrollLimiter = scrollLimitedListener(window, 700);
 *     const removeScrollListener = initScrollLimiter(() => {
 *         const scrollY = window.scrollY || document.documentElement.scrollTop;
 *         console.log(scrollY); // Logs scroll position
 *     });
 *
 *     // Remove the scroll listener on click
 *     document.addEventListener("click", () => removeScrollListener());
 */
export function scrollLimitedListener(listenerOwner, delay=300) {
    if (!(listenerOwner instanceof HTMLElement) && window !== listenerOwner && document !== listenerOwner) {
        throw new Error("Provided listenerOwner at scrollLimitedListener() is not a valid DOM element.");
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

        listenerOwner.addEventListener("scroll", handler);

        return () => {
            listenerOwner.removeEventListener("scroll", handler);
        }
    };
}

/**
 * A function that adds a scroll event listener to an element and toggles a CSS class on a target element
 * based on the scroll position of a trigger element.
 * The target element's style is modified when the trigger element reaches a certain scroll position.
 * This function uses a "scroll limiter" to ensure the callback is not triggered too frequently during scroll events.
 *
 * @param {HTMLElement} target - The DOM element whose style (class) will be toggled based on scroll.
 * @param {HTMLElement} trigger - The DOM element that acts as the trigger for the scroll event.
 * @param {string} classActivation - The class to be added or removed from the target element when the trigger is scrolled past.
 * @param {HTMLElement|Window|Document} [scrollOwner=window] - The element (or window) whose scroll events are being monitored. Defaults to the `window`.
 * @param {number} [scrollTimeLimit=300] - The delay (in milliseconds) between consecutive scroll event callback executions. Defaults to 300ms.
 *
 * @throws {Error} If the provided `target` or `trigger` elements are not found in the DOM.
 *
 * @example
 * // Example usage of customTargetStyleOnScroll
 * const targetElement = document.querySelector(".target");
 * const triggerElement = document.querySelector(".trigger");
 * customTargetStyleOnScroll(targetElement, triggerElement, "active");
 *
 * // The "active" class will be added to targetElement when triggerElement is scrolled past.
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

    const initScrollLimiter = scrollLimitedListener(scrollOwner, scrollTimeLimit);
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
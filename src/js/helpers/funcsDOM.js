"use strict";

//import { gsap } from "gsap";
import imagesLoaded from "imagesloaded";

/**
 * It checks whether the given style rule is supported for the given HTML Element
 * @param {HTMLElement} element - target HTML Element
 * @param {string} param - css rule
 * @param {string} value - the value of the css rule
 * @return {boolean}
 */
export function isStyleSupported(element, param, value) {
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
  if (window !== listenerOwner && document !== listenerOwner && !(document.body.contains(listenerOwner))) {
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
  if (!document.body.contains(target) || !document.body.contains(trigger)) {
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
 * @param {[Element]} [elements=[]] the list of HTMLElements to be set with the attributes
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

export function lockScroll(isScrolled = true) {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (isScrolled) {
    requestAnimationFrame(() => {
      document.body.style.paddingRight = `0`;
      document.body.style.overflow = "auto";
    });
  }
  else {
    requestAnimationFrame(() => {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    });
  }
}

/**
 * @function getImagesLoaded
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
      if (!container || !document.body.contains(container)) {
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
          }
          else {
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
    }
    catch (e) {
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
 * Activates the navigation link based on the specified conditions.
 * Adds an `activeClass` to the matching navigation items and sets the `href` attribute to the provided `anchorLink`.
 *
 * @param {string} navLinkSelector - The CSS selector to find the navigation link items.
 * @param {string} pageType - The type of the page to match with the pagesVersions attribute of the navigation items.
 * @param {string} activeClass - The class name to add to the matched navigation link items.
 * @param {string} anchorLink - The URL to set as the `href` attribute for the matched navigation items.
 *
 * @returns {void} This function does not return any value.
 *
 * @example
 * // Example usage:
 * activateNavLink('.nav-link', 'home', 'active', '#homeAnchor');
 */
export function activateNavLink(navLinkSelector, pageType, activeClass, anchorLink) {
  // Check if all necessary arguments are provided, otherwise, log a warning.
  if (!navLinkSelector || !pageType || !activeClass || !anchorLink) {
    console.warn("at activateNavLink: no given all arguments");
    return;
  }

  // Get all navigation link items using the provided selector.
  const navLinkItems = Array.from(document.querySelectorAll(navLinkSelector));

  // If no matching navigation items are found, log a warning and exit.
  if (!navLinkItems.length) {
    console.warn(`at activateNavLink: the nav link items with selector: ${navLinkSelector} are not found in the page...`);
    return;
  }

  // Iterate over each navigation item to check if its pagesVersions-type matches the provided pageType.
  for (const navItem of navLinkItems) {

    // If the page type matches, add the active class and update the href attribute.
    if (navItem?.dataset?.type === pageType) {
      navItem.classList.add(activeClass);
      navItem.setAttribute("href", anchorLink);
    }
  }
}

/**
 * Initializes a language switcher component.
 * @param {Object} params - Configuration object.
 * @param {string} [params.langSwitcherSelector="#lang-switcher"] - Selector for the root container.
 * @param {string} [params.iconLangSelector=".lang-switcher__lang-icon"] - Selector for language icons.
 * @param {string} [params.langActiveSelector=".active"] - Selector for active language element.
 * @param {string} [params.langListSelector="#listbox"] - Selector for options container.
 * @param {string[]} [params.langOptionArr=["ua","ru"]] - Supported language codes.
 * @param {string} [params.dataSetParam="lang"] - Dataset parameter name.
 * @returns {void} Returns early if any critical elements are missing.
 */
export function initLangSwitcher(params = {}) {
  const {
    langSwitcherSelector = "#lang-switcher",
    iconLangSelector = ".lang-switcher__lang-icon",
    langActiveSelector = ".active",
    langListSelector = "#listbox",
    langOptionArr = ["ua", "ru"],
    dataSetParam = "lang"
  } = params;

  const notFoundError = (selector, addition="") => {
    console.error(
      `at initLangSwitcher: the given selector: ${selector} is not found in DOM`,
      addition
    );
  }

  const url = window.location.href;
  const langSwitcher = document.querySelector(langSwitcherSelector);

  if (!langSwitcher) {
    notFoundError(langSwitcherSelector);
    return;
  }

  const langActiveElement = langSwitcher.querySelector(`${iconLangSelector}${langActiveSelector}`);
  const langActive = langActiveElement?.dataset[dataSetParam];

  if (!langActive) {
    notFoundError(`${iconLangSelector}${langActiveSelector}`, `or data-${dataSetParam} has no value...`);
    return;
  }

  if (!Array.isArray(langOptionArr) || !langOptionArr.length) {
    console.error(`at initLangSwitcher: the given array of language versions is not Array or empty: ${langOptionArr}`);
    return;
  }

  const langVerArr = langOptionArr.filter(lang => lang !== langActive);

  const langList = langSwitcher.querySelector(langListSelector);

  if (!langList) {
    notFoundError(langListSelector);
    return;
  }

  const optionListElems = langVerArr.map((langVer) => {
    const listElem = document.createElement("li");
    listElem.classList.add(getSelectorName(iconLangSelector));
    listElem.setAttribute("role", "option");
    listElem.setAttribute(`data-${dataSetParam}`, langVer);

    const spanElem = document.createElement("span");
    spanElem.textContent = langVer;
    listElem.appendChild(spanElem);

    return listElem;
  });

  langList.append(...optionListElems);

  const handleClick = ({ target }) => {
    const clickedLang = target.closest(iconLangSelector).dataset[dataSetParam];
    window.location.replace(url.replace(`/${langActive}/`, `/${clickedLang}/`));
  };

  langList.addEventListener("click", handleClick);

}

/**
 * Removes the "." and "#" characters from the beginning of the selector and returns its name.
 * @param {string} selector - Selector (example: ".class", "#id", "tag").
 * @returns {string} Selector name without symbols "." и "#".
 */
export function getSelectorName(selector) {
  // Regular expression for ".selector", "#selector", "selector"
  const regex = /^[.#]?([\w-]+)$/;
  const match = selector.match(regex);
  return match ? match[1] : selector; // If not matched, return original selector
}
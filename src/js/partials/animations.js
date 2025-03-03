"use strict";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { setAttributes } from "../helpers/funcsDOM.js";

///////////////// REGISTER GSAP PLUGINS /////////////
gsap.registerPlugin(ScrollTrigger);

//////////////// ANIMATION DATA /////////////////////
/// ANIMATION SELECTORS
/// index.html
/// SELECTORS
const i = {
  scrolledNav: "#scrolledNav",
  burgerBase: ".burger_nav",
  burgerFixed: ".burger_nav:not(.hidden)",
  burgerHidden: ".burger_nav.hidden",
  navMenuHidden: ".header__nav.abs",
  gatesSection: "#gatesSection",
  scrollTriggerPoint: "#scrollTriggerPoint",
  headingAccentHero: ".section__heading-block--hero .accent",
  headingHeroRest: ".section__heading-block--hero .rest-of-heading",
  textBlockHero: ".section__text-block--hero",
  biddingBlockHero: ".section__bidding-block--hero",
  iconWrapperHero: ".section__img-wrapper--hero",
  galleryWork: "#gallery-work",
  fadeInLeft: "[data-anime=fade-in-left]",
  fadeInRight: "[data-anime=fade-in-right]",
  fadeInUp: "[data-anime=fade-in-up]",
  scaleIn: "[data-anime=scale-in]",
};

/// ANIMATION PARAMS
const pageAnimations = {
  index: () => {
    const tlData = {};

    return tlData;
  },
  common: () => {
    const tlData = {};

    ///////////// SECTION HERO ANIMATION /////////////////
    const tlHero = gsap.timeline();

    tlHero.to(i.headingAccentHero, {
      opacity: 1,
      duration: 2,
      delay: 0.3,
    });
    tlHero.from(i.headingAccentHero, {
      x: 80,
      duration: 0.8,
      ease: "circ.out"
    }, "<");
    tlHero.to(i.headingHeroRest, {
      opacity: 1,
      duration: 2,
    }, "<");
    tlHero.from(i.headingHeroRest, {
      x: -80,
      duration: 0.8,
      ease: "circ.out"
    }, "<");
    tlHero.to(i.textBlockHero, {
      opacity: 1,
      duration: 2,
    }, "-=1.5");
    tlHero.from(i.textBlockHero, {
      y: 80,
      duration: 0.8,
      ease: "circ.out"
    }, "<");
    tlHero.to(i.biddingBlockHero, {
      opacity: 1,
      duration: 2,
    }, "<+0.3");
    tlHero.from(i.biddingBlockHero, {
      y: 40,
      duration: 0.8,
      ease: "circ.out"
    }, "<");
    tlHero.to(i.iconWrapperHero, {
      scale: 1,
      duration: 1.5,
      ease: "elastic.out"
    }, "<+0.2");

    if (hasRealAnimations(tlHero)) {
      tlData["tlHero"] = tlHero;
    }

    ///////////// FADE-IN-LEFT ANIMATIONS ////////////////

    const fadeInLeftAnimations = getAllScrollTwoTweens(
      gsap.utils.toArray(document.querySelectorAll(i.fadeInLeft)),
      null,
      "fadeInLeft",
      {
        opacity: 1,
        duration: 0.7,
        delay: 0.2,
      },
      {
        x: -80,
        y: 80,
        duration: 1,
        ease: "circ.out",
      });
    //assigning timeline references
    Object.assign(tlData, fadeInLeftAnimations);

    ///////////// FADE-IN-RIGHT ANIMATIONS /////////////////

    const fadeInRightAnimations = getAllScrollTwoTweens(
      gsap.utils.toArray(document.querySelectorAll(i.fadeInRight)),
      null,
      "fadeInRight",
      {
        opacity: 1,
        duration: 0.7,
        delay: 0.2,
      },
      {
        x: 80,
        y: 80,
        duration: 1,
        ease: "circ.out",
      });
    //assigning timeline references
    Object.assign(tlData, fadeInRightAnimations);

    ///////////// SCALE-IN ANIMATIONS ///////////

    const scaleInAnimations = getAllScrollTwoTweens(
      gsap.utils.toArray(document.querySelectorAll(i.scaleIn)),
      null,
      "scaleIn",
      {
        opacity: 1,
        duration: 0.8,
        //delay: 0.2,
      },
      {
        scale: 0.7,
        duration: 1.2,
        ease: "back.out(1)",
      });
    //assigning timeline references
    Object.assign(tlData, scaleInAnimations);


    //////////// FADE-IN-UP ANIMATIONS /////////////////

    const fadeInUpAnimations = getAllScrollTwoTweens(
      gsap.utils.toArray(document.querySelectorAll(i.fadeInUp)),
      null,
      "fadeInUp",
      {
      opacity: 1,
      duration: 1,
      delay: 0.2,
    },
      {
      y: 80,
      duration: 1,
      ease: "circ.out",
    }
    );
    //assigning timeline references
    Object.assign(tlData, fadeInUpAnimations);

    ///////////////// SEPARATE TWEENS ////////////////////

    ///////////// SCROLLED NAVIGATION ANIMATION //////////
    gsap.to(i.scrolledNav, {
      top: 0,
      duration: 1.2,
      ease: "back.out(0.8)",
      delay: 0.5,
      scrollTrigger: {
        trigger: i.scrollTriggerPoint,
        start: "top 10%",
        //end: "bottom 85%",
        toggleActions: "play none none reverse",
        //markers: true,
        /**
         * preventOverlaps vs fastScrollEnd - should be chosen on of them
         */
        preventOverlaps: true, //prevent overlapping animations at several trigger animations
        //fastScrollEnd: true, // stop previous animation if the scrollTrigger starts animation again...
      }
    });

    //////////// BURGER MENU OPEN ANIMATION /////////////
    const navMenuFixed = document.querySelector(i.navMenuHidden);
    const burgerHidden = document.querySelector(i.burgerHidden);
    const burgerFixed = document.querySelector(i.burgerFixed);
    const burgerAll = document.querySelectorAll(i.burgerBase);
    //// animation of the fixed navigation menu
    const navMenuAnime = gsap.to(navMenuFixed, {
      top: 0,
      duration: .8,
      ease: "back.out(0.8)",
      paused: true,
    });


    document.addEventListener("click", (e) => {

      //if clicked out of the burger-menu range then to check if the burger is opened and reverse the animation...
      if (!(e.target.closest(i.burgerBase))) {
        const isNavActive = navMenuFixed.getAttribute("aria-expanded") === "true";
        if (isNavActive) {
          // Changing aria-expanded for both burger menu buttons and the fixed navigation menu
          setAttributes([burgerHidden, burgerFixed, navMenuFixed], {
            "aria-expanded": !isNavActive,
          });

          burgerHidden.classList.remove("opened");
          burgerFixed.classList.remove("opened");

          /// animation of hiding the fixed navigation menu with top: -100%;
          navMenuAnime.reverse();

          //returning scroll to the page...
          //lockScroll(true);
          document.body.style.overflow = "auto";
        }
      }
    });

    //adding listener to the burger buttons...
    burgerAll.forEach(burger => {
      burger.addEventListener("click", (e) => {
        const burgerMenu = e.target.closest(i.burgerBase);

        if (burgerMenu) {
          e.preventDefault();
          const isExpanded = burger.getAttribute("aria-expanded") === "true";

          // Changing aria-expanded for both burger menu buttons and the fixed navigation menu
          setAttributes([burgerHidden, burgerFixed, navMenuFixed], {
            "aria-expanded": !isExpanded,
          });

          if (isExpanded) {
            burgerHidden.classList.remove("opened");
            burgerFixed.classList.remove("opened");
            //lockScroll(true);
            document.documentElement.style.scrollbarGutter = "initial";
            document.body.style.scrollbarGutter = "initial";

            document.body.style.overflow = "auto";
          }
          else {
            burgerHidden.classList.add("opened");
            burgerFixed.classList.add("opened");
            //lockScroll(false);
            document.documentElement.style.scrollbarGutter = "stable";
            document.body.style.scrollbarGutter = "stable";

            document.body.style.overflow = "hidden";
          }

          if (isExpanded) {
            navMenuAnime.reverse();
          }
          else {
            navMenuAnime.play();
          }
        }
      });
    });


    return tlData;
  }
};


////////////////  ANIMATION FUNCTIONS ////////////////

export function fadeInGallery(elemsArr = []) {
  return getAllScrollTwoTweens(
    elemsArr,
    document.querySelector(i.galleryWork),
    "fadInGallery",
    {
      opacity: 1,
      duration: 0.8,
      delay: 0.2,
    },
    {
      scale: 0.7,
      duration: 1,
      ease: "back.out",
    }
  );
}

//for the dynamic and SPA site without reloading, using the flag to avoid multiple listeners
let listenerAdded = false;

export const animatePage = () => {
  //if no Listener on DOMContentLoaded then to add Listener onPageLoaded()
  if (document.readyState === "loading" && !listenerAdded) {
    document.addEventListener("DOMContentLoaded", () => onPageLoaded(pageAnimations));
    listenerAdded = true;  // Set a flag so that the listener is added only once
  }
  else {
    return onPageLoaded(pageAnimations);
  }
};

/**
 * It gets the animation instructions Object and returns the Object with the references to the initiated timelines
 * @param {Object} animationData - the Object with the animation instructions for the pages
 * @return {Object} - Returns the Object with the references to all the initiated timelines
 */
function onPageLoaded(animationData) {
  const pageName = document.body.dataset.type;
  const totalTl = {};


  if (animationData.common) {
    const commonTl = animationData.common();
    Object.assign(totalTl, commonTl);
  }
  else {
    console.warn(`at onPageLoaded(): no "common" property found in the given Object...`);
  }

  if (pageName in animationData) {
    const tlPage = animationData[pageName]();
    return Object.assign(totalTl, tlPage);
  }
  else {
    //console.warn(`at onPageLoaded(): no such page name property: ${pageName} found in the given Object...`);
    return totalTl;
  }
}

/**
 * Checking the gsap timeline for not empty animations
 * @param {gsap.core.Timeline | gsap.core.Tween} timeline - the gsap timeline to be checked
 * @return {boolean} - Returns true if the timeline has at least one tween with a duration greater than zero.
 */
function hasRealAnimations(timeline) {
  // Getting all child tweens of the timeline
  // Checking if there is at least one tween with a duration greater than zero
  return timeline.getChildren().some(child => child.duration() > 0);
}

/**
 * It creates the Timeline scroll animations with fading in from opacity: 0, and optional gsap.from params which
 * are animated with the opacity animation...
 * @param {HTMLElement} elem  - the HTMLElement
 * @param {HTMLElement} triggerElem - the trigger HTMLElement for the animations at scrollTrigger
 * @param {Object} [gsapToParams={}] - params for the first tween with gsap.to
 * @param {Object} [gsapFromParams={}] - params for the last tween with gsap.from
 * @param {string} [nextAnimePos="<"] - The position for the second tween, indicating when the animation should start relative to the first.
 * @return {gsap.core.Timeline|boolean} - Returns a Timeline with animations, or false if the passed element is not an HTMLElement.
 *
 * @example using first tween gsap.to params for the first animation, and gsap.from params for the last tween
 * getScrollTimelineTwoTweens(elem, triggerElem, { opacity: 1, duration: 0.7, delay: 0.2 }, { x: 80, y: 80, duration: 1, ease: "circ.out", });
 *
 * @example
 * getScrollTimelineTwoTweens(elem, triggerElem, { opacity: 1, duration: 1, delay: 0.2 }, { scale: 0.7, duration: 1, ease: "circ.out", }, "-=1.5");
 */
function getScrollTimelineTwoTweens(elem, triggerElem, gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  if (!(elem instanceof HTMLElement) || !(triggerElem instanceof HTMLElement)) {
    console.warn(`at getScrollTimeLinePairLeftRight: the given selector: ${elem} or trigger: ${triggerElem} is not HTMLElement... animation is omitted...`);
    return false;
  }

  //The timeline initiation with the ScrollTrigger and its default params...
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElem,
      start: "top 80%",
      //end: "bottom 85%",
      toggleActions: "play none none reverse",
      //markers: true,
      /**
       * preventOverlaps vs fastScrollEnd - should be chosen on of them
       */
      preventOverlaps: true, //prevent overlapping animations at several trigger animations
      //fastScrollEnd: true, // stop previous animation if the scrollTrigger starts animation again...
    }
  });

  tl.to(elem, {
    ...gsapToParams,
  });
  tl.from(elem, {
    ...gsapFromParams,
  }, nextAnimePos);

  return tl;
}

/**
 * Creates multiple scroll-triggered timelines for elements matching the selector.
 * It makes animation timeline for the each element and returns the Object with the timeline references...
 * @param {Array<HTMLElement>} elemsArr - the Array of the target elements in DOM
 * @param {HTMLElement|null} triggerElem - the trigger element for the scrollTrigger (or null).
 * @param {string} [propKey="tlKey"] - the key part for making unique key of the timeline in the Object to return...
 * @param {Object} [gsapToParams={}] - params for the first tween with gsap.to
 * @param {Object} [gsapFromParams={}] - params for the last tween with gsap.from
 * @param {string} [nextAnimePos="<"] - The position for the second tween, indicating when the animation should start relative to the first.
 * @return {Object} - An object containing timelines with unique keys.
 */
function getAllScrollTwoTweens(elemsArr, triggerElem, propKey = "tlKey", gsapToParams = {}, gsapFromParams = {}, nextAnimePos = "<") {
  const tlObj = {};
  let trigger = null;

  if (!(Array.isArray(elemsArr))) {
    console.error(`at getAllScrollTwoTweens(): the given "elemsArr" is not Array...`);
    return tlObj;
  }

  if (triggerElem !== null) {
    if (!(triggerElem instanceof HTMLElement) || !(document.body.contains(triggerElem))) {
      console.error(`at getAllScrollTwoTweens: the given trigger is not HTMLElement or not in DOM...`);
      return tlObj;
    }
    else {
      trigger = triggerElem;
    }
  }

  elemsArr.forEach((elem, index) => {
    if (!(elem instanceof HTMLElement) || !(document.body.contains(elem))) {
      console.warn(`at getAllScrollTwoTweens: the target element at index ${index} is not HTMLElement or not in DOM...`);
      return;
    }

    const tlKey = `${propKey}_${index}`;
    const tl = getScrollTimelineTwoTweens(elem, trigger || elem, gsapToParams, gsapFromParams, nextAnimePos);

    if (tl && hasRealAnimations(tl)) {
      tlObj[tlKey] = tl;
    }
  });

  return tlObj;
}


/////// DEV
function log(it, text = "value: ") {
  console.log(text, it);
}
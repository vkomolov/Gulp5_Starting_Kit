'use strict';

import { gsap } from "gsap";

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
 * Fountains a certain number of balls.
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

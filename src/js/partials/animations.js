'use strict';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

///////////////// REGISTER GSAP PLUGINS /////////////
gsap.registerPlugin(ScrollTrigger);

//////////////// ANIMATION DATA /////////////////////
/// ANIMATION SELECTORS
/// index.html
const i = {
    heroHeaderAccent: ".section__heading-block--hero .accent",
    heroHeaderRest: ".section__heading-block--hero .rest-of-heading",
    heroTextBlock: ".section__text-block--hero",
    heroBiddingBlock: ".section__bidding-block--hero",
    heroIconWrapper: ".section__img-wrapper--hero"
}

/// ANIMATION PARAMS
export const pageAnimations = {
    index: [
        {
            params: {},
            /*      condition: {
                    trigger: ".trigger-element",  //trigger element if necessary
                    event: "mouseenter",  //trigger event if necessary
                    action: "play", //action for the timeline
                  },*/
            children: [
                {
                    selector: i.heroHeaderAccent,
                    method: "to",
                    params: {
                        opacity: 1,
                        duration: 2,
                    },
                },
                {
                    selector: i.heroHeaderAccent,
                    method: "from",
                    params: {
                        x: 50,
                        duration: 0.8,
                        ease: "circ.out"
                    },
                    position: "<"
                },
                {
                    selector: i.heroHeaderRest,
                    method: "to",
                    params: {
                        opacity: 1,
                        duration: 2,
                    },
                    position: "<"
                },
                {
                    selector: i.heroHeaderRest,
                    method: "from",
                    params: {
                        x: -50,
                        duration: 0.8,
                        ease: "circ.out"
                    },
                    position: "<"
                },
                {
                    selector: i.heroTextBlock,
                    method: "to",
                    params: {
                        opacity: 1,
                        duration: 2,
                    },
                    position: "-=1.5"
                },
                {
                    selector: i.heroTextBlock,
                    method: "from",
                    params: {
                        y: 80,
                        duration: 0.5,
                        ease: "back.out"
                    },
                    position: "<"
                },
                {
                    selector: i.heroBiddingBlock,
                    method: "to",
                    params: {
                        opacity: 1,
                        duration: 2,
                    },
                    position: "<+0.2"
                },
                {
                    selector: i.heroBiddingBlock,
                    method: "from",
                    params: {
                        y: 80,
                        duration: 0.5,
                        ease: "back.out"
                    },
                    position: "<"
                },
                {
                    selector: i.heroIconWrapper,
                    method: "to",
                    params: {
                        scale: 1,
                        duration: 1.5,
                        ease: "elastic.out"
                    },
                    position: "-=1"
                },
            ]
        }
    ]
}


////////////////  ANIMATION FUNCTION ////////////////

//if the site is dynamic or uses SPA, then to add the flag
let listenerAdded = false;
export function animatePage () {
    if (document.readyState === "loading" && !listenerAdded) {
        document.addEventListener("DOMContentLoaded", onPageLoaded);
    }
    else {
        onPageLoaded();
    }
    function onPageLoaded() {
        const pageName = document.body.dataset.page;
        if (pageName in pageAnimations) {
            const animations = pageAnimations[pageName];

            animations.forEach((tLine, i) => {
                const id = `${pageName}_${i}`;

                //setting params to the timeline
                const tl = gsap.timeline({
                    id,
                    ...tLine.params,
                });

                //if timeline runs on the event:
                if (tLine.trigger && tLine.event) {
                    const triggerElement = document.querySelector(tLine.trigger);
                    if (triggerElement) {
                        triggerElement.addEventListener(tLine.event, () => {
                            tl.play();  // running timeline on the given event
                        });
                    }
                    else {
                        console.error(`at animations.js: no such trigger element ${triggerElement} in DOM...`);
                    }
                }

                /// adding tweens to the timeline
                tLine.children.forEach(tween => {
                    const { selector, method, params, position } = tween;
                    if (position === undefined) {
                        tl[method](selector, params);
                    }
                    else {
                        tl[method](selector, params, position);
                    }
                });
            });
        }
        else {
            console.warn(`no such page name ${pageName} found in "pageAnimations"...`);
        }
    }
}

/////// DEV
function log(it, text="value: ") {
    console.log(text, it );
}
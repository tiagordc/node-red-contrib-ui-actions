'use strict';

module.exports = {

    literals: {

        observeDOM: function (name) { // Based on: https://stackoverflow.com/a/14570614

            return String.raw`
            ${name} = (function () {

                const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

                return function (observe, callback) {

                    if (!observe || !observe.nodeType === 1) {
                        return;
                    }

                    if (MutationObserver) {

                        const observer = new MutationObserver(function (mutations, observer) {
                            observer.disconnect();
                            callback(mutations);
                        })

                        observer.observe(observe, {
                            childList: true,
                            subtree: true
                        });
                        
                    } 
                    else if (window.addEventListener) {

                        const options = {
                            capture: false,
                            once: true
                        };
                        
                        observe.addEventListener('DOMNodeInserted', callback, options);
                        observe.addEventListener('DOMNodeRemoved', callback, options);
                    
                    }
                    
                };
                
            })();
            `;

        }
        
    }

};
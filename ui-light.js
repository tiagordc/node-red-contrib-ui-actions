'use strict';

module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(node, config) {
        return function (msg, value) {

            var action = config.action;
            var val = config.write;

            if (config.actionType === 'msg' || config.actionType === 'flow' || config.actionType === 'global') {
                action = RED.util.evaluateNodeProperty(config.action, config.actionType, node, msg);
            }

            if (config.writeType === 'msg' || config.writeType === 'flow' || config.writeType === 'global') {
                val = RED.util.evaluateNodeProperty(config.write, config.writeType, node, msg);
            }

            return {
                msg: {
                    payload: {
                        action: action,
                        value: val
                    }
                }
            };

        };
    }

    function view(node, config) { 

        var id = "light_" + node.id.replace(/[^\w]/g, "");
        var height = 1;
        if (config.height > 0) height = config.height;
        var size = height * 24;

        return String.raw`
        <style>

        #${id} span { 
            display: block; 
            margin: 0 auto; 
            width: ${size}px; 
            height: ${size}px; 
            content:; 
            background-color: #666; 
            border-top: 1px solid rgba(255,255,255,0.8); 
            -moz-border-radius: 100px; 
            -webkit-border-radius: 100px; 
            border-radius: 100px; 
            -moz-box-shadow: 0 0 4px rgba(0,0,0,0.8); 
            -webkit-box-shadow: 0 0 4px rgba(0,0,0,0.8); 
            box-shadow: 0 0 4px rgba(0,0,0,0.8); 
            background-image: -webkit-gradient(radial, 50% 0, 100, 50% 0, 0, from(rgba(255,255,255,0)), to(rgba(255,255,255,0.38))); 
            background-image: -moz-radial-gradient(top, ellipse cover, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 100%); 
            background-image: -webkit-radial-gradient(top, ellipse cover, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 100%); 
            background-image: radial-gradient(top, ellipse cover, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 100%);
        }

        </style>

        <div id="${id}"><span></span></div>
        `;

    }

    function controller(node, config) {

        var id = node.id.replace(/[^\w]/g, "");

        var fn = String.raw`

        ${utils.literals.observeDOM("const observeDOM")}

        const updateWithScope = (msg) => {
            if (document) {

                const attemptUpdate = () => {

                    const elem = document.getElementById('light_${id}');

                    if (elem) {

                        var card = elem.closest("md-card");
                        card.classList.remove("nr-dashboard-template");
                        card.classList.add("nr-dashboard-textinput");

                        var actions = {
                            element: elem,
                            set: function(msg) { 
                                if (msg == null) return;
                                var color = msg.payload.value;
                                elem.firstElementChild.style.backgroundColor = color;
                            },
                            disable: function() { elem.disabled = true; card.classList.add("nr-dashboard-disabled"); },
                            enable: function() { elem.disabled = false; card.classList.remove("nr-dashboard-disabled"); }
                        };

                        var action = 'set';
                        if (msg && typeof msg.payload === 'object' && msg.payload.hasOwnProperty("action") && typeof msg.payload.action === 'string') {
                            action = msg.payload.action.toLowerCase();
                        }

                        if (typeof actions[action] === 'function') {
                            if (actions[action].length === 0) actions[action]();
                            else actions[action](msg);
                        }

                        if (typeof window._nrui === 'undefined') window._nrui = {};
                        window._nrui['_${id}'] = actions;

                    } else {
                        
                        // HACK: is there a proper way to wait for this node's element to be rendered?
                        observeDOM(document, (change) => attemptUpdate());

                    }

                };
                attemptUpdate();

            }
            
        };

        $scope.$watch('msg', updateWithScope);
        `;

        return Function("$scope", "events", fn);

    };

    function UiLight(config) {

        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

        RED.nodes.createNode(this, config);

        var node = this;

        var height = 1;
        if (config.height > 0) height = config.height;

        // https://github.com/node-red/node-red-dashboard/blob/master/ui.js

        var done = ui.addWidget({
            node: node,                 // controlling node
            order: config.order,        // placeholder for position in page
            group: config.group,        // belonging Dashboard group
            width: config.width,        // width of widget
            height: height,             // height of widget
            format: view(node, config), // HTML/Angular code
            templateScope: "local",	    // scope of HTML/Angular(local/global)*
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            beforeEmit: model(node, config),
            initController: controller(node, config),
            beforeSend: function (msg, orig) { // callback to prepare the message that is sent to the output
                if (orig) {
                    return orig.msg;
                }
            }
        });

        node.on("close",function() {
            node.status({});
            done();
        });

    };

    RED.nodes.registerType("ui_ui-light", UiLight);

};
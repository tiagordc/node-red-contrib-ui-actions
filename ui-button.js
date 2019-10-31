'use strict';

module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(node, config) {
        return function (msg, value) {

            var action = config.action;

            if (config.actionType === 'msg' || config.actionType === 'flow' || config.actionType === 'global') {
                action = RED.util.evaluateNodeProperty(config.action, config.actionType, node, msg);
            }

            return {
                msg: {
                    payload: {
                        action: action,
                        value: null
                    }
                }
            };

        };
    }
    
    function view(node, config) { 

        var id = "btn_" + node.id.replace(/[^\w]/g, "");

        var style = "";
        if (config.color) style += `color:'${config.color}';`; 

        var icon = '';
        if (config.icon) icon = String.raw`<ui-icon icon="${config.icon}" style="${style}"></ui-icon>`;

        if (config.bgcolor) style += `background-color:'${config.bgcolor}';`; 
        style += "z-index:1, padding:'0px';";

        return String.raw`
        <md-button class="md-raised" ng-click="buttonClick()" aria-label="{{'button' + config.label}}" id="${id}" style="${style}">
            ${icon}
            <span ng-bind-html="config.label"></span>
            <md-tooltip ng-if="config.tooltip" md-delay="700" md-direction="bottom" ng-bind-html="config.tooltip"></md-tooltip>
        </md-button>
        `;

    }

    function controller(node, config) {

        var id = node.id.replace(/[^\w]/g, "");

        var fn = String.raw`

        ${utils.literals.observeDOM("const observeDOM")}

        const updateWithScope = (msg) => {

            $scope.buttonClick = function () { 
                $scope.send(msg);
            };

            var config = $scope.$eval("config");

            if (!config) {
                config = ${JSON.stringify(config)};
                $scope.config = config;
            }

            if (document) {

                const attemptUpdate = () => {

                    const elem = document.getElementById('btn_${id}');

                    if (elem) {

                        var card = elem.closest("md-card");
                        card.classList.remove("nr-dashboard-template");
                        card.classList.add("nr-dashboard-button");

                        var actions = {
                            element: elem,
                            click: function(msg) { $scope.send(msg); },
                            hide: function() { card.style.display = 'none'; },
                            show: function() { card.style.display = ''; },
                            disable: function() { elem.disabled = true; card.classList.add("nr-dashboard-disabled"); },
                            enable: function() { elem.disabled = false; card.classList.remove("nr-dashboard-disabled"); }
                        };

                        if (msg) {

                            var action = 'click';
                            if (typeof msg.payload === 'object' && msg.payload.hasOwnProperty("action") && typeof msg.payload.action === 'string') {
                                action = msg.payload.action.toLowerCase();
                            }
    
                            if (typeof actions[action] === 'function') {
                                if (actions[action].length === 0) actions[action]();
                                else actions[action](msg);
                            }
    
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

    function UiButton(config) {

        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

        RED.nodes.createNode(this, config);

		
        var node = this;

        var height = 1;
        if (config.height > 0) height = config.height;

        // https://github.com/node-red/node-red-dashboard/blob/master/ui.js

        var done = ui.addWidget({
            node: node,
            order: config.order,
            group: config.group,
            width: config.width,
            height: height,
            format: view(node, config),
            templateScope: "local",	
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

    RED.nodes.registerType("ui_ui-button", UiButton);

};
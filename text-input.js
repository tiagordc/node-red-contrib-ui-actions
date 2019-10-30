'use strict';

// References:
//https://github.com/node-red/node-red-dashboard/wiki/Creating-New-Dashboard-Widgets
//https://github.com/Adorkable/node-red-contrib-ui-led/blob/master/ledUtility.js

module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(config, node) {
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

    function view(config) {

        var id = "txt_" + config.id.replace(/[^\w]/g, "");
        var delay = config.delay || 0;

        return String.raw`
        <md-input-container class="md-block" flex md-is-error="false" ng-class="{'has-label': config.label}">
            <label ng-bind-html="config.label"></label>
            <md-tooltip ng-if="config.tooltip" md-delay="700" md-direction="bottom" ng-bind-html="config.tooltip"></md-tooltip>
            <input type="${config.mode}" id="${id}" ng-model="value" ng-change="valueChanged(value)" ng-model-options="{ 'timezone': 'UTC',  debounce: ${delay} }" aria-label="{{config.label}}" style="z-index:1" />
        </md-input-container>
        `;

    }

    function controller(config) {

        var passthru = config.passthru ? '$scope.send({payload: $scope.value});' : '';
        var changed = config.change ? '$scope.send({payload: value});' : '';

        var fn = String.raw`

        ${utils.literals.observeDOM("const observeDOM")}

        $scope.value = "";
        $scope.valueChanged = function (value) {
            ${changed}
        };

        const updateWithScope = (msg) => {
            
            var config = $scope.$eval("config");

            if (!config) {
                config = ${JSON.stringify(config)};
                $scope.config = config;
            }

            var action = undefined;

            if (msg) {

                if (typeof msg.payload === 'string' || typeof msg.payload === 'number') {
                    action = 'set';
                    $scope.value = msg.payload.toString();
                    ${passthru}
                }
                else if (typeof msg.payload === 'object') {
                    
                    if (msg.payload.hasOwnProperty("action") && typeof msg.payload.action === 'string') {
                        action = msg.payload.action.toLowerCase();
                    }
                    else {
                        action = 'set';
                    }

                    if (action === 'set') {
                        $scope.value = msg.payload.value;
                        ${passthru}
                    }

                }

            }

            if (document) {

                const attemptUpdate = () => {

                    var id = "txt_" + config.id.replace(/[^\w]/g, "");
                    const elem = document.getElementById(id);

                    if (elem) {

                        var card = elem.closest("md-card");
                        card.classList.remove("nr-dashboard-template");
                        card.classList.add("nr-dashboard-textinput");

                        switch (action) {
                            case 'disable':
                                elem.disabled = true;
                                card.classList.add("nr-dashboard-disabled");
                                break;
                            case 'enable':
                                elem.disabled = false;
                                card.classList.remove("nr-dashboard-disabled");
                                break;
                            case 'hide':
                                card.style.display = 'none';
                                break;
                            case 'show':
                                card.style.display = '';
                                break;
                            case 'get':
                                $scope.send({payload: elem.value});
                                break;
                        }

                    } else {
                        
                        // HACK: is there a proper way to wait for this node's element to be rendered?
                        observeDOM(document, (change) => {
                            attemptUpdate();
                        });

                    }

                };
                attemptUpdate();

            }
            
        };

        $scope.$watch('msg', updateWithScope);

        `;

        return Function("$scope", "events", fn);

    };

    function TextInput(config) {

        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

        RED.nodes.createNode(this, config);

        var node = this;

        var height = 1;
        if (config.height > 0) height = config.height;

        // https://github.com/node-red/node-red-dashboard/blob/master/ui.js

        var done = ui.addWidget({
            node: node,             // controlling node
            order: config.order,    // placeholder for position in page
            group: config.group,    // belonging Dashboard group
            width: config.width,    // width of widget
            height: height,  // height of widget
            format: view(config),   // HTML/Angular code
            templateScope: "local",	// scope of HTML/Angular(local/global)*
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            beforeEmit: model(config, node),
            initController: controller(config),
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

    RED.nodes.registerType("ui_text-input", TextInput);

};
'use strict';

//https://github.com/node-red/node-red-dashboard/blob/master/nodes/ui_button.js
//https://github.com/node-red/node-red-dashboard/blob/master/src/components/ui-component/templates/button.html

/**
<md-button class="md-raised"
            ng-click="me.buttonClick()"
            aria-label="{{'button' + me.item.label}}"
            ng-style="{'background-color':me.item.getText(), 'color':me.item.getColor(), 'z-index':1, 'padding':'0px'}"
            >
    <ui-icon ng-show="me.item.icon.length" icon="{{me.item.icon}}" ng-style="{color:me.item.getColor()}"></ui-icon>
    <span ng-bind-html="me.item.getLabel()"></span>
    <md-tooltip ng-if="me.item.getTooltip().length" md-delay="700" md-direction="bottom" ng-bind-html="me.item.getTooltip()"></md-tooltip>
</md-button>
 */
module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(node, config) {
        return function (msg, value) {

            return {
                msg: {
                    payload: ""
                }
            };

        };
    }
    
    function view(node, config) { 

        var id = "btn_" + config.id.replace(/[^\w]/g, "");

        return String.raw`
        <md-button class="md-raised" aria-label="{{'button' + config.label}}" id="${id}">
            <span ng-bind-html="config.label"></span>
            <md-tooltip ng-if="config.tooltip" md-delay="700" md-direction="bottom" ng-bind-html="config.tooltip"></md-tooltip>
        </md-button>
        `;

    }

    function controller(node, config) {

        var fn = String.raw`

        ${utils.literals.observeDOM("const observeDOM")}

        const updateWithScope = (msg) => {
            
            var config = $scope.$eval("config");

            if (!config) {
                config = ${JSON.stringify(config)};
                $scope.config = config;
            }

            if (document) {

                const attemptUpdate = () => {

                    var id = "btn_" + config.id.replace(/[^\w]/g, "");
                    const elem = document.getElementById(id);

                    if (elem) {

                        var card = elem.closest("md-card");
                        card.classList.remove("nr-dashboard-template");
                        card.classList.add("nr-dashboard-button");

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
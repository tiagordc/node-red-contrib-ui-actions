'use strict';

// References:
//https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/common/60-link.js#L39

module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(config) {
        return function (msg, value) {

            return {
                msg: {
                    payload: "123"
                }
            };

        };
    }

    function controller(config) {

        var fn = String.raw`

        $scope.value = "";

        const updateWithScope = (msg) => {
            
            var config = ${JSON.stringify(config)};

            
            console.log(config.target);
            
        };

        $scope.$watch('msg', updateWithScope);

        `;

        return Function("$scope", "events", fn);

    };

    function UiAction(config) {

        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

        RED.nodes.createNode(this, config);

        var node = this;
        
        var done = ui.addWidget({
            node: node,
            templateScope: "local",
            group: config.group,
            order: 0,
            width: -1, height: -1, //https://discourse.nodered.org/t/custom-dashboard-node-without-md-card-possible/14919/20
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            format: "<div></div>",
            beforeEmit: model(config),
            initController: controller(config)
        });

        node.on("close",function() {
            node.status({});
            done();
        });

    };

    RED.nodes.registerType("ui_ui-action", UiAction);

};
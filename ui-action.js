'use strict';

// References:
//https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/common/60-link.js#L39


/**
 * on text input each action is a functio:
 * window._nr_uia['control id'].disable = function (value)
 * on action call these functions
 */

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

    function controller(node, config) {

        var fn = String.raw`

        $scope.value = "";

        const updateWithScope = (msg) => {
            
            var config = ${JSON.stringify(config)};

            console.log(config.target + ' ' + JSON.stringify(msg));
            
        };

        $scope.$watch('msg', updateWithScope);

        `;

        return Function("$scope", "events", fn);

    };

    function UiAction(config) {

        RED.nodes.createNode(this, config);

		var node = this;
		
        node.on('input', function (msg, nodeSend, nodeDone) {

            var action = config.action;
            var val = config.write;

            if (config.actionType === 'msg' || config.actionType === 'flow' || config.actionType === 'global') {
                action = RED.util.evaluateNodeProperty(config.action, config.actionType, node, msg);
            }

            if (config.writeType === 'msg' || config.writeType === 'flow' || config.writeType === 'global') {
                val = RED.util.evaluateNodeProperty(config.write, config.writeType, node, msg);
            }

            //node.warn(config.target + ' ' + action + ' ' + val);
            var event = "node:" + config.target;

            msg.payload = {
                action: action,
                value: val
            };

            msg._event = event;

            node.warn('ui action emit ' + JSON.stringify(msg));
            RED.events.emit(event, msg);

			nodeSend(msg);
            nodeDone();
            
        });

        node.on("close",function() {
            node.status({});
        });

        /**
        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

        RED.nodes.createNode(this, config);

        var node = this;
        
        var done = ui.addWidget({
            node: node,
            templateScope: "local",
            group: config.group,
            order: config.order,
            width: -1, height: -1, //https://discourse.nodered.org/t/custom-dashboard-node-without-md-card-possible/14919/20
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            format: "<div></div>",
            beforeEmit: model(node, config),
            initController: controller(node, config)
        });

        node.on("close",function() {
            node.status({});
            done();
        });
**/
    };

    RED.nodes.registerType("ui_ui-action", UiAction);

};
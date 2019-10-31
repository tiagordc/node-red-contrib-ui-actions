'use strict';

module.exports = function (RED) {

    var ui = undefined;

    function UiAction(config) {

        RED.nodes.createNode(this, config);

		var node = this;
		
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
            beforeEmit: function(msg) {

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
                            value: val,
                            target: config.target,
                            targetKey: '_' + config.target.replace(/[^\w]/g, ""),
                            passthru: config.passthru
                        }
                    }
                };

            },
            initController: function($scope) {

                const updateWithScope = (msg) => {
        
                    if (!msg) return;
                    if (!msg.payload) return;
                    if (!msg.payload.action) return;
                    if (!msg.payload.target) return;
                    
                    if (typeof window._nrui === 'undefined') return;
                    if (typeof window._nrui[msg.payload.targetKey] === 'undefined') return;
        
                    var actionName = msg.payload.action.toString().toLowerCase();
                    if (typeof window._nrui[msg.payload.targetKey][actionName] !== 'function') return;
                    
                    var actionFn = window._nrui[msg.payload.targetKey][actionName];
                    if (actionFn.length === 0) actionFn();
                    else {
                        actionFn(msg);
                    }
                    
                };
        
                $scope.$watch('msg', updateWithScope);

            }
        });

        node.on("close",function() {
            node.status({});
            done();
        });

    };

    RED.nodes.registerType("ui_ui-action", UiAction);

};
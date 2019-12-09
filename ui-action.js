'use strict';

module.exports = function (RED) {

    var ui = undefined;

    function UiAction(config) {

        RED.nodes.createNode(this, config);

		var node = this;
		
        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }

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

                var result = {
                    msg: {
                        action: action,
                        value: val,
                        target: config.target,
                        targetKey: '_' + config.target.replace(/[^\w]/g, ""),
                        passthru: config.passthru
                    }
                };

                Object.assign(result.msg, msg);
                return result;

            },
            initController: function($scope) {

                const updateWithScope = (msg) => {
    
                    if (!msg) return;
                    if (!msg.action) return;
                    if (!msg.target) return;
                    
                    if (typeof window._nrui === 'undefined') return;
                    if (typeof window._nrui[msg.targetKey] === 'undefined') return;
        
                    var actionName = msg.action.toString().toLowerCase();
                    if (typeof window._nrui[msg.targetKey][actionName] !== 'function') return;
                 
                    // if (msg.target === "4d30a55e.e0830c") {
                    //     console.log(actionName + " " + msg._msgid);
                    // }

                    if (msg._msgid) {
                        if (!window._nrui.history) window._nrui.history = {};
                        if (!window._nrui.history[msg.targetKey]) window._nrui.history[msg.targetKey] = [];
                        var historyLen = window._nrui.history[msg.targetKey].length;
                        var index = window._nrui.history[msg.targetKey].indexOf(msg._msgid);
                        if (index >= 0 && index != historyLen - 1) return;
                        if (index === -1) window._nrui.history[msg.targetKey].push(msg._msgid);
                        //TODO: if len > 100
                    }

                    var actionFn = window._nrui[msg.targetKey][actionName];
                    if (actionFn.length === 0) {
                        var result = actionFn();
                        if (result) {
                            $scope.send({payload: result});
                        }
                    }
                    else {
                        actionFn(msg);
                    }
                    
                };
        
                $scope.$watch('msg', updateWithScope);

            },
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

    RED.nodes.registerType("hidden-ui-action", UiAction);

};
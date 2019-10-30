'use strict';

//https://github.com/node-red/node-red/blob/master/packages/node_modules/%40node-red/nodes/core/common/60-link.js#L39

module.exports = function (RED) {

    function UiAction(config) {

        RED.nodes.createNode(this, config);

		var node = this;
		
        node.on('input', function (msg, nodeSend, nodeDone) {
			nodeSend(msg);
			nodeDone();
        });

        node.on("close",function() {
            node.status({});
        });

    };

    RED.nodes.registerType("ui_ui-action", UiAction);

};
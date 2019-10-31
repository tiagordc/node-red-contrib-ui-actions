'use strict';

//https://github.com/node-red/node-red-dashboard/blob/master/nodes/ui_button.js

module.exports = function (RED) {

    function UiButton(config) {

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

    RED.nodes.registerType("ui_ui-button", UiButton);

};
'use strict';

module.exports = function (RED) {

    var ui = undefined;
    var utils = require('./ui');

    function model(_node, _config) {
        return function (_msg, _value) {
            return {
                msg: {
                    payload: { }
                }
            };

        };
    }

    function view(node, config) { 
        var id = "load" + node.id.replace(/[^\w]/g, "");
        return `<div id="${id}"></div>`;
    }

    function controller(node, _config) {

        var id = node.id.replace(/[^\w]/g, "");

        var fn = String.raw`

        ${utils.literals.observeDOM("const observeDOM")}

        const attemptUpdate = () => {
            const elem = document.getElementById('load${id}');
            if (elem) {
                $scope.send();
            } else {
                observeDOM(document, (change) => attemptUpdate());
            }
        };

        attemptUpdate();
        `;

        return Function("$scope", "events", fn);

    };

    function UiLoad(config) {

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
            format: view(node, config),
            beforeEmit: model(node, config),
            initController: controller(node, config),
            beforeSend: function (_msg, orig) { // callback to prepare the message that is sent to the output
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

    RED.nodes.registerType("hidden-ui-load", UiLoad);

};
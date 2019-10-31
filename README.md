# node-red-contrib-ui-actions

![GitHub package.json version](https://img.shields.io/github/package-json/v/tiagordc/node-red-contrib-ui-actions?label=package)
![npm](https://img.shields.io/npm/v/node-red-contrib-ui-actions)
![npm](https://img.shields.io/npm/dm/node-red-contrib-ui-actions)

Have you tried to disable a button in the node-red dashboard? Or set the value of a text input in a different flow?

This project is a set of custom dashboard nodes that support advanced control of the UI.

To report an issue use the project [GitHub](https://github.com/tiagordc/node-red-contrib-ui-actions/issues) page

## Text Input

Available actions:

* Set input value (set)
* Get value to the output connection (get)
* Disable input field (disable)
* Enable input field (enable)
* Hide field (hide)
* Show field (show)

**Configuration:**\
![configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-ui-actions/master/text-input.png)

**How it works:**\
![text input](https://raw.githubusercontent.com/tiagordc/node-red-contrib-ui-actions/master/text-input.gif)

## Button

Available actions:

* Disable button (disable)
* Enable button (enable)

## UI Action

Allows to call any of the above actions in a target node

**Configuration:**\
![configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-ui-actions/master/ui-action.png)

## To install: 

Install [node-red](https://nodered.org/).

Install this package with "npm install node-red-contrib-ui-actions --save" in ~./node-red or via the Palette Manager in node-red.

If everything was successfull you should see the new nodes under the dashboard category.

https://flows.nodered.org/node/node-red-contrib-ui-actions

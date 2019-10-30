# node-red-contrib-ui-actions

![GitHub package.json version](https://img.shields.io/github/package-json/v/tiagordc/node-red-contrib-ui-actions?label=package)
![npm](https://img.shields.io/npm/v/node-red-contrib-ui-actions)
![npm](https://img.shields.io/npm/dm/node-red-contrib-ui-actions)

Custom node-red dashboard controls that support different actions

To report an issue use the project [GitHub](https://github.com/tiagordc/node-red-contrib-ui-actions/issues) page

### Text Input

Available actions:

* Set input value (set)
* Disable input field (disable)
* Enable input field (enable)
* Hide field (hide)
* Show field (show)
* Get value to the output connection (get)

**Configuration:**\
![configuration](https://raw.githubusercontent.com/tiagordc/node-red-contrib-ui-actions/master/text-input.png)

**How it works:**\
![text input](https://raw.githubusercontent.com/tiagordc/node-red-contrib-ui-actions/master/text-input.gif)

### UI Action

Allows to call any of the above actions in a selected noded

## To install: 

Install [node-red](https://nodered.org/).

Install this package with "npm install node-red-contrib-ui-actions --save" in ~./node-red or via the Palette Manager in node-red.

If everything was successfull you should see the new nodes under the dashboard category.

https://flows.nodered.org/node/node-red-contrib-ui-actions

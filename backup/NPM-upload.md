

### NPM package

```sh
dashboard-node
	-- dashboard.html
	-- dashboard.js
	-- icons
		-- dashboard.png
	-- package.json
	-- README.md
	-- LICENSE
```

**File package.json mẫu**

```sh
{
  "name": "node-red-contrib-dashboard",
  "version": "1.0.0",
  "description": "Dashboard for user interfaces",
  "dependencies": {
        "express": "4.15.3"
  },
  "main": "none",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Ha Manh Dong",
  "license": "Apache-2.0",
  "repository": {
		"type": "git",
		"url": "https://github.com/hamanhdong/node-red-contrib-dashboard.git"
	},
  "node-red" : {
      "nodes": {
          "dashboard": "dashboard.js"
      }
  }
}

```

**File README.md mẫu**

```sh
# node-red-contrib-dashboard

This module provide a set of widgets to show information about devices and sensors to user, and also provide charts: line, bar, pie, doughnut to virtualization data.


## Pre-requisites

Node node-red-contrib-dashboard requires Node-RED version 0.14 or more recent and express module version 4.15.3

## Install

To install the stable version run the following command in your Node-RED user directory (typically `~/.node-red`):

    npm i node-red-contrib-dashboard

Open your Node-RED instance and you should have one new node in input category and one new node in output category.
```

**File LICENSE mẫu**

(https://thaiduynguyen.wordpress.com/2009/10/30/tim-hieu-ve-osl/)

```sh
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```


### NPM command

```sh
$ cd /path/to/directory
$ npm login
Username: donghm
Password: *****
Email: 

$ sudo chown donghm:donghm -R dashboard/

$ npm publish
```

Để xóa npm package đã public lên, sử dụng câu lệnh:

```sh
$ npm unpublish [<@scope>/]<pkg>[@<version>]
```

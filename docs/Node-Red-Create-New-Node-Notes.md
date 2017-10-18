# Node Red Create New Node Notes

Về cơ bản, một Node trong Node Red bao gồm 3 thành phần chính tương ứng với 3 file mà chúng ta cần tạo ra: file ```package.json``` khai báo cho Node Red biết node đang xét là một ```node module```, một file js định nghĩa các  công việc mà node đang tạo ra sẽ làm, và một file html định nghĩa giao diện của node trên node red dashboard, cũng như giao diện cho phép cấu hình các thuộc tính của node. Tất cả các file này cần được đặt trong cùng một thư mục.

Ví dụ về cấu trúc của một Node module trong Node Red: 

```node
- package.json
- sample.html
- sample.js
- icons
      \-sample.png
- README.md
- LICENSE
```

## File package.json

File ```package.json``` là file được sử dụng để xác định một folder là một NodeJS module và lưu trữ các thông tin của NodeJS module đó.
Chúng ta có thể sử dụng câu lệnh ```npm init``` để tạo ra một  NodeJS module cũng như tạo ra file ```package.json``` cho NodeJS module đó.

Cấu trúc cơ bản của một file ```package.json``` được sử dụng trong Node-Red:

```json
{
    "version": "1.0.0",
    "description": "A node used for query real time data from web server",
    "dependencies": {
        "follow-redirects":"1.2.4",
        "request":"2.82.0",
        "request-promise":"4.2.1"
    },
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Ha Minh Cong",
    "license": "ISC",
    "keywords": [
        "node-red",
        "real time",
        "webserver",
        "input"
    ],
    "main": "none",
    "name": "node-red-contrib-input-real-time-data",
    "node-red": {
        "nodes": {
            "node-red-real-time-data": "input-real-time-data.js"
        }
    }
}
```

- description: Mô tả về chức năng của node
- dependencies: các NodeJS module khác mà node này phụ thuộc
- name: Tên của Module (không phải là tên của node trong Node-Red.)
- "node-red": khai báo các thông tin về một node:
    - node-red.nodes: Khai báo các node có trong module này (một Module có thể chứa nhiều node). Thông tin về các node có cấu trúc ```node-name:main-file.js```, trong đó:
        - node-name: tên của các node của module này trong Node-Red.
        - main-file.js: file javascript chứa mã nguồn xử lý và khai báo của các node.
- Lưu ý: 
    - Tên của ```main-file.js``` phải trùng với tên của file html, do vậy tên của file html phải là ```main-file.html```
    - Trong một file ```main-file.js``` có thể chứa nhiều module export nhiều node, chứ không chỉ là một node. Tuy nhiên, để đơn giản hóa, tài liệu này trình bày về module chứa 1 node. Do đó trong file ```main-file.js```  cũng như file ```main-file.html``` sẽ chỉ chứa khai báo về một node.

## Thành phần định nghĩa giao diện hiển thị - file main-file.html

File HTMl của một node trong Node Red cần có 3 phần cơ bản, được đặt trong các javascript element như sau:

- Thành phần ```data-template``` Chứa mã nguồn html quy định panel chỉnh sửa các thông tin input đầu vào của node.

```javascript
<script type="text/x-red" data-template-name="real-time-data">
// data-template html code
</script>
```

- Thành phần ```data-help-name``` Chứa thông tin giới thiệu về node, được hiển thị khi di chuột trỏ tới node và ở panel info giới thiệu về node.

```javascript
<script type="text/x-red" data-help-name="real-time-data">
// data-help-name html text info element
</script>
```

- Thành phần đăng ký giao diện hiển thị, đăng ký các input của node với Node Red và xử lý các event trên giao diện của node (ví dụ như ẩn/hiện một số input, xóa thông tin của một input,...). Thành phần này được chứa trong một javascript block:

```javascript
<script type="text/javascript">
    RED.nodes.registerType('node-name',{
        // node definition
    });
</script>
```

```node-name``` là tên định danh của node với node red, và nó phải trùng với giá trị node-name được đăng ký ở file js

=> Ref: **The node type is used throughout the editor to identify the node. It must match the value used by the call to RED.nodes.registerType in the corresponding .js file.**

Trong phần **node definition** chúng ta khai báo vơi Node Red các thành phần giao diện của node cũng như các input của node, bao gồm:

- category: (string) the palette category the node appears in
- defaults: (object) the editable properties for the node.
- credentials: (object) the credential properties for the node.
- inputs: (number) how many inputs the node has, either 0 or 1.
- outputs: (number) how many outputs the node has. Can be 0 or more.
- color: (string) the background colour to use.
- label: (string|function) the label to use in the workspace.
- labelStyle: (string|function) the style to apply to the label.
- inputLabels: (string|function) optional label to add on hover to the input port of a node.
- outputLabels: (string|function) optional labels to add on hover to the output ports of a node.
- icon: (string) the icon to use.
- align: (string) the alignment of the icon and label.
- oneditprepare: (function) called when the edit dialog is being built. See custom edit behaviour.
- oneditsave: (function) called when the edit dialog is okayed. See custom edit behaviour.
- oneditcancel: (function) called when the edit dialog is cancelled. See custom edit behaviour.
- oneditdelete: (function) called when the delete button in a configuration node’s edit dialog is pressed. See custom edit behaviour.
- oneditresize: (function) called when the edit dialog is resized. See custom edit behaviour.
- onpaletteadd: (function) called when the node type is added to the palette.
- onpaletteremove: (function) called when the node type is removed from the palette.

Các thuộc tính quan trọng:

- defaults: Trường này cho chúng ta định nghĩa node hiện tại sẽ có các thuộc tính nào và gán gía trị mặc định - giá trị khởi tạo cho các thuộc tính đó. 


```javascript

<script type="text/javascript">
    RED.nodes.registerType('node-name',{        
        defaults: {
            name: { value: "" },
            triggerMode: { value: "none" },
            triggerDelay: { value: 1 },
            triggerInterval: { value: 1 },
            enableButton: { value: true },

        },
    });
</script>

```

Khi chúng ta định nghĩa một thuộc tính, thì ở thành phần html chúng ta cũng cần có thẻ input/select/checkbox... tương ứng để nạp dữ liệu cho thuộc tính đó:

```html

    <div class="form-row">
        <label for="node-input-name"><i class="icon-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
    <div class="form-row">
        <label for="node-input-triggerMode"> Trigger Mode</label>
        <select id="node-input-triggerMode">
            <option value="none">One time after start</option>
            <option value="interval">Repeat after a time interval</option>
        </select>
    </div>
    <div class="form-row">
        <label for="node-input-triggerDelay"><i class="fa fa-play"></i> <span>Delay</span></label>
        <input id="node-input-triggerDelay" style="width:90px !important;" type="number" value="1" step="1" min="1"></input>
        <span>seconds</span>
    </div>

```

- icon: Định nghĩa nơi lưu icon đại diện cho node:

**Lưu ý: icon của node cần để bên trong thư mục icons, đồng thời giá trị của icon phải là tên của file icon, chứ không phải là đường dẫn icons\/file\_name.png**

```javascript

<script type="text/javascript">
    RED.nodes.registerType('input-example', {
        category: 'input',
        color: '#f79267',
        defaults: {
            name: { value: "" },
            triggerMode: { value: "none" },
            triggerDelay: { value: 1 },
            triggerInterval: { value: 1 },
            enableButton: { value: true },

        },
        inputs: 0,
        outputs: 1,
        icon: "example.png"
    });
</script>

```
- oneditprepare: định nghĩa phương thức chứa các xử lý mà node sẽ thực hiện sau khi chúng ta double vào node trên dashboard và trước khi giao diện chỉnh sửa node hiện lên.

Phương thức này thường được sử dụng để ẩn/hiện các html element, thiết lập giá trị cho các input không có tiền tố id ```node-input```, cũng như đăng ký các handle xử lý các event của các input trên giao diện node khi giá trị của các input thay đổi.

Lý do mà chúng ta cần sử dụng ```oneditprepare``` để thiết lập giá trị cho các tiền tố id ```node-input```, đó là vì khi giao diện node bị đóng, giá trị của các input này sẽ bị reset chứ không giữ nguyên.

Vậy tại sao chúng ta lại cần dùng các input không có tiền tố id là ```node-input```? Chúng ta sử dụng các input này khi một thuộc tính - property của node cần dược một trong số nhiều input element cấp dữ liệu (điều này có nghĩa là trong cac input element cấp dữ liệu cho một property sẽ chỉ có 1 element được điều khiển để hiển thị trên màn hình, các input element khác sẽ cần phải ẩn-hide đi.) Sự ẩn-hiện các thuộc tính sẽ được điều khiển thông qua các handler xử lý các sự kiện giá trị một input thay đổi.

```javascript

<script type="text/javascript">
    RED.nodes.registerType('input-example', {
        category: 'input',
        color: '#f79267',
        oneditprepare: function () {
            // setup input change event handler
            $("#real-time-data-triggerMode-select").change(function () {
                var modeSelected = $("#real-time-data-triggerMode-select").val();
                $(".trigger-mode-row").hide();
                $("#trigger-mode-row-" + modeSelected).show();
            });
            // set non prefix-id "node-input" input element by correspond node property value
            var modeSelected = this.triggerMode;
            $("#real-time-data-triggerMode-select").val(this.triggerMode);
            if (modeSelected == "none") {
                $("#trigger-delay-count").val(this.delaySecond);
            }
            else if (modeSelected == "interval") {
                $("#trigger-interval-count").val(this.intervalSecond);
            }
            // control html element show/hide
            $(".trigger-mode-row").hide();
            $("#trigger-mode-row-" + modeSelected).show();
            var enableAuth = this.enableAuth;
            if (this.enableAuth == "false") {
                $("#real-time-data-auth-info-row").hide();
                $("#real-time-data-enableAuth").prop('checked', false);
            } else {
                $("#real-time-data-auth-info-row").show();
                $("#real-time-data-enableAuth").prop('checked', true);
            }
        },
    });
</script>

```

- oneditsave: Phương thức này định nghĩa các công việc mà chúng ta sẽ thực hiện sau khi giao diện input của node được đóng lại khi chúng ta nhấn button **Done**, và trước khi chúng ta nhấn vào button **Deploy** để kích hoạt flow. Phương thức này thường được sử dụng để nạp dữ liệu từ các non prefix-id "node-input" input element vào các thuộc tính-property cuả node.

```javascript

<script type="text/javascript">
    RED.nodes.registerType('input-example', {
        category: 'input',
        color: '#f79267',
        oneditsave: function () {
            var modeSelected = $("#real-time-data-triggerMode-select").val();
            $("#node-input-triggerMode").val(modeSelected);
            var inputDelaySecond = $("#trigger-delay-count").val();
            $("#node-input-delaySecond").val(inputDelaySecond);
            var inputIntervalSecond = $("#trigger-interval-count").val();
            $("#node-input-intervalSecond").val(inputIntervalSecond);
            if (modeSelected == 'none') {
                this.enableButton = true;
            } else if (modeSelected == 'interval') {
                this.enableButton = false;
            }
        }
    });
</script>

```
- button: Nếu thành phần này được khai báo, node sẽ có một button đằng trước trên giao diện dashboard. Button thường được sử dụng để trigger một số event. Khi event được trigger, chúng ta có thể hiện một số thông báo lên giao diện của node red thông qua phương thức ```RED.notify(msg, msg_type);```


```javascript

<script type="text/javascript">
    RED.nodes.registerType('input-example', {
        category: 'input',
        color: '#f79267',
        button: {
            enabled: function () {
                return this.enableButton;
            },
            onclick: function () {
                if (!this.enableButton) {
                    return RED.notify(RED._("notification.warning", { message: "manual trigger by button is only enable in one time mode" }), "warning");
                }
                console.log(this.id);
                var node = this;
                $.ajax({
                    url: "real-time-data/" + node.id,
                    type: "POST",
                    success: function (resp) {
                        // console.log(JSON.stringify(node));
                        // console.log(node.name);
                        RED.notify(node.name.toString() + " " + node.id.toString() + " trigger success.", "success");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        RED.notify("Fail to create trigger from node " + node.name.toString() + " " + node.id.toString(), "error");
                    }
                });

            }
        }
    });
</script>

```

### Node input validation

### Configuration node




## Thành phần main-file.js: file javascript chứa mã nguồn xử lý và khai báo node

File ```main-file.js``` là nơi chúng ta định nghĩa các hoạt động của node khi node được deploy.

Tất cả các thông tin về node sẽ được chứa bên trong một function là export của module, với argument đầu vào là ```RED```. Object đầu vào ```RED``` chính là object đại diện cho Node Red.

Trong block này, chúng ta cần xây dựng một constructor function đóng vai trò là một Node Class,sau đó mỗi khi chúng ta kéo node node này vào giao diện dashboard, một node mới sẽ được tạo ra từ constructor function này. Sau khi xây dựng constructor function cho node, chúng ta sẽ đăng ký function này với ```RED``` object thông qua câu lệnh ```RED.nodes.registerType("node_name",node_constructor_function);``` để Runtime process của Node Red sẽ gọi tới constructor tương ứng khi một node mới được deploy lên dashboard flow.

```javascript

module.exports = function(RED) {
    function ConstructorFunctionName(config) {
        // node code goes here    
    }
    RED.nodes.registerType("node_name",ConstructorFunctionName);
}

```

Trong constructor function của node, chúng ta cần quan tâm tới một số vấn đề sau:

- Handle xử lý sự kiện một message tới node:

```javascript

node.on('input', function (msg) {
        // process msg here;
        });

```

- Để gửi message tới node tiếp theo, chúng ta sử dụng phương thức ```node.send(msg);```
- Gửi message khi một node có nhiều output:

```javascript

node.send([ msg1 , msg2 ]);;

```

- Xử lý trước khi khởi tạo-reset lại một node (xảy ra khi chúng ta xóa 1 node khỏi flow hoặc khi deploy lại flow).

```javascript

this.on('close', function() {
    // tidy up any state
});

```

- Gửi logging tới debug tab và node-red process console (không phải là console của giao diện dashboard)

```javascript

this.log("Something happened");
this.warn("Something happened you should know about");
this.error("Oh no, something bad happened");

// Since Node-RED 0.17
this.trace("Log some internal detail not needed for normal operation");
this.debug("Log something more details for debugging the node's behaviour");

```

## References

- <https://nodered.org/docs/creating-nodes/node-html>
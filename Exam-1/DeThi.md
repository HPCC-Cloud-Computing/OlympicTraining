

## **Đề thi**

Các thuật ngữ: 

**devices**: các thiết bị có thể kết nối tới internet như ESP, Ardunio Uno, Pi...

**sensors**: các cảm biến để đo dữ liệu, như cảm biến nhiệt độ, độ ẩm,...

Dụng cụ phần cứng cần chuẩn bị: 1 esp8266, 1 cảm biến chuyển động HC-SR501, 1 cảm biến nhiệt độ độ ẩm DHT11, 1 cảm biến ánh sáng BH1750, 3 bóng đèn led màu xanh, đỏ, vàng và 1 màn hình OLED.

Nền tảng mã nguồn mở M.E.O project được phát triển bởi nhóm Maker HaNoi dựa trên NodeRed và Ardunio đã cung cấp việc  lấy dữ liệu và điều khiển thiết bị. Cụ thể là:

Cung cấp **code firmware** thực hiện việc:

- Nhận dữ liệu xung PWM và truyền tới các chân tương ứng: D0, D1, D2, D3, D4 
- Thực hiện các function khi được gọi, bao gồm 5 funtion là Function_F1() cho tới Function_F5(), nhưng hiện tại các function này chưa được định nghĩa các hoạt động. (https://github.com/makerhanoi/meo-esp-firmware/blob/master/meo-esp-firmware.ino#L252)
- Thực hiện lấy dữ liệu, bao gồm: dữ liệu **digital** (LOW hoặc HIGHT) trên các chân D5, D6, D7, D8, dữ liệu **analog** trên chân A0, và dữ liệu đo được từ các cảm biến (gọi tới 5 function là Virtual_U1() cho tới Virtual_U5()), sau đó thực hiện gửi tất cả dữ liệu này lên MQTT broker **5s** 1 lần. (https://github.com/makerhanoi/meo-esp-firmware/blob/master/meo-esp-firmware.ino#L155)

Cung cấp **2 node** mới trong NodeRed là:

- **meo esp in**: thực hiện lấy dữ liệu từ esp gửi lên trên MQTT topic **esp/deviceID/out** với **deviceID** là ID của thiết bị mà người dùng nhập vào.
- **meo esp out**: thực hiện gửi các hành động của người dùng lên MQTT topic **esp/deviceID/in** với **deviceID** là ID của thiết bị mà người dùng nhập vào. Các hành động bao gồm: truyền xung PWM tới các chân D0, D1, D2, D3, D4 hoặc gọi tới các funtion F1, F2, F3, F4, F5 đã được định nghĩa trên esp.

Định dạng dữ liệu: 

- Dữ liệu gửi từ NodeRed tới ESP có định dạng là:
		
		{1.a;1.b;1.c;1.d;1.e;1;1;1;1;1}
		hoặc 
		{0.a;0.b;0.c;0.d;0.e;0;0;0;0}
		Trong đó, 5 phần tử đầu tiên thể hiện giá trị xung PWM mà người dùng muốn truyền tới các chân tương ứng theo thứ tự D0, D1, D2, D3, D4, với a,b,c,d,e là gía trị xung mà người dùng nhập vào, với 1 là có truyền và 0 là không truyền. 
		5 phần tử cuối là 0 hoặc 1 với: 0 - không gọi tới function, 1 - có gọi tới function, theo thứ tự: funtion F1, F2, F3, F4, F5

- Dữ liệu gửi từ ESP lên NodeRed có định dạng:
	
		D5;D6;D7;D8;A0;U1;U2;U3;U4;U5
		trong đó: D5,D6,D7,D8 là gía trị digital trên các chân tương ứng, A0 là gía trị analog trên chân A0, và U1->U5 là gía trị dữ liệu lấy được từ các sensors.

Như đã mô tả ở trên, hiện tại M.E.O chưa hỗ trợ việc đăng kí và quản lý các thiết bị, sensors cũng như việc lưu trữ và data virtualization.

Phần firmware M.E.O project chưa định nghĩa hết các function để lấy dữ liệu Virtual_U1() -> Virtual_U5(), các function hành động Function_F1() -> Function_F5()

Tham khảo file mã nguồn firmware của M.E.O trên github https://github.com/makerhanoi/meo-esp-firmware/blob/master/meo-esp-firmware.ino để thực hiện các yêu cầu dưới đây cho code firmware.

Lập trình thực hiện các công việc sau:

**Câu 1**: 

- Lập trình firmware để nạp vào ESP8266, cho phép người dùng thực hiện smart config: cho phép người dùng connect vào wifi mà esp phát, sau khi connect thành công có giao diện web hiển thị danh sách các wifi để người dùng chọn 1 wifi để esp8266 connect vào, và cho phép người dùng config 2 thông tin là MQTT broker (mặc định để là localhost) và MQTT port (mặc định để 1883). Trong code firmaware cần lưu ý reset lại các wifi mà esp8266 đã connect để luôn yêu cầu người dùng phải chọn wifi để esp connect tới. 
- Lập trình các function trong code firmware thực hiện việc lấy dữ liệu về chuyển động, ánh sáng, nhiệt độ, độ ẩm và lập trình việc điểu khiển bật/tắt đèn các đèn led xanh, led đỏ, led vàng. (Mã nguồn chỉ cần chứng minh việc đã lập trình được việc lấy dữ liệu từ các sensors và điều khiển được các đèn led). Hiển thị dữ liệu nhiệt độ và độ ẩm đo được lên màn hình OLED.
- Tạo 1 node mới trong node-red nằm trong panel **M.E.O** có 4 trường cho người dùng nhập vào là: tên node (tring), ngưỡng nhiệt độ (number), ngưỡng độ ẩm (number), ngưỡng ánh sáng (number). (Mã nguồn chỉ cần chứng minh là đã lập trình được việc tạo ra node, và hiển thị được node này trên giao diện của NodeRed).
- Thiết kế giao diện web có 2 bảng, 1 bảng hiển thị thông tin về devices: mac address, type, ngày đăng kí, trạng thái và 1 bảng hiển thị thông tin về các sensors: device mac address, sensor ID, ngày đăng kí, trạng thái. Có đồ thị line-chart hiển thị dữ liệu đo được về nhiệt độ, độ ẩm và ánh sáng.

**Câu 2**: 

- Mô tả cách thức truyền nhận dữ liệu giữa device và nodered. Cụ thể là các MQTT topic sẽ có và định dạng message trên từng topic.
- Lập trình firmware đóng gói tất cả dữ liệu lấy được từ tất cả sensors gộp lại chung trong 1 message và gửi lên topic mà nhóm quy định trên MQTT broker 5s 1 lần.
- Thiết kế database để lưu trữ dữ liệu nhận được từ các sensors và thông tin về các devices, sensors. Connect vào database đó để lấy dữ liệu về nhiệt độ, độ ẩm, ánh sáng đo được để hiển thị lên biểu đồ line-chart.
- Lập trình **logic** để xử lý theo kịch bản: Khi nhận được dữ liệu về nhiệt độ, độ ẩm, ánh sáng thì xử lý để lưu vào database. Đồng thời kiểm tra nếu cảm biến chuyển động gửi thông tin lên là không có chuyển động thì sẽ gửi lại hành động tắt tất cả các đèn led tới ESP. Khi có chuyển động thì sẽ kiểm tra các ngưỡng mà người dùng đã nhập: nếu gía trị nhiệt độ/độ ẩm/ánh sáng nhận được > ngưỡng nhiệt độ/độ ẩm/ánh sáng thì sẽ bật đèn led theo thứ tự led xanh (ứng với nhiệt độ), led đỏ (ứng với độ ẩm), led vàng (ứng với ánh sáng). Nếu gía trị nhận được bé hơn ngưỡng thì tắt đèn.

**Câu 3:**
- Đề xuất cơ chế giúp đăng kí các devices và sensors mới, monitor trạng thái của các devices và sensors.
- Lập trình logic cho cơ chế đã đề xuất trên.

**Việc định dạng và gửi nhận dữ liệu nhóm sinh viên có thể tham khảo định dạng của M.E.O hoặc sử dụng định dạng mới.**

**Yêu cầu:**  Tất cả các dịch vụ sử dụng yêu cầu đóng gói và chạy trên Docker container

**Lưu ý**: trình bày hướng tiếp cận, cách giải quyết vấn đề, sơ đồ khối hệ thống, sơ đồ luồng dữ liệu và cách thức triển khai hệ thống vào tài liệu riêng, nộp cùng mã nguồn bài thi.

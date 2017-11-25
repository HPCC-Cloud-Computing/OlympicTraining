

## **Exam 2**

**Mục tiêu:** xây dựng hệ thống quản lý và điều khiển các devices, sensors trong nhà thông minh. Cụ thể là thu thập dữ liệu về nhiệt độ độ ẩm, ánh sáng, thực hiện các xử lý để đưa ra hành động kéo rèm  hoặc mở thông gió trong nhà.

Dụng cụ phần cứng cần chuẩn bị: 1 esp8266, 1 cảm biến chuyển động HC-SR501, 1 cảm biến nhiệt độ độ ẩm DHT11, 1 cảm biến ánh sáng BH1750, 1 động cơ RC Servo 9G SG90, 1 bóng đèn led và 1 màn hình OLED.

Trong bài thi sẽ mô phỏng việc kéo rèm bằng hành động quay động cơ Servo, và mô phỏng việc bật/tắt thông gió bằng hành động bật/tắt đèn led.

Lập trình thực hiện các công việc sau:

**Câu 1**: 

- Lập trình firmware để nạp vào ESP8266, cho phép người dùng thực hiện smart config: cho phép người dùng connect vào wifi mà esp phát, sau khi connect thành công có giao diện web hiển thị danh sách các wifi để người dùng chọn 1 wifi để esp8266 connect vào, và cho phép người dùng config 2 thông tin là MQTT broker (mặc định để là localhost) và MQTT port (mặc định để 1883). Trong code firmaware cần lưu ý reset lại các wifi mà esp8266 đã connect để luôn yêu cầu người dùng phải chọn wifi để esp connect tới. 
- Lập trình các function trong code firmware thực hiện việc lấy dữ liệu về chuyển động, ánh sáng, nhiệt độ, độ ẩm và lập trình việc điểu khiển bật/tắt đèn led và động cơ RC Servo 9G SG90. Hiển thị thông tin về nhiệt độ, độ ẩm đo được lên màn hình OLED.
- Thiết kế giao diện web hiển thị thông tin về nhiệt độ, độ ẩm, ánh sáng và giao diện để hiển thị trạng thái bật/tắt và button để điều khiển đèn led.

**Câu 2**: 

- Mô tả cách thức truyền nhận dữ liệu giữa device và nodered. Cụ thể là các MQTT topic sẽ có và định dạng message trên từng topic.

- Lập trình firmware thực hiện: 
	- Đóng gói tất cả dữ liệu về nhiệt độ, độ ẩm, ánh sáng gộp lại chung trong 1 message và gửi lên topic mà nhóm quy định trên MQTT broker 5s 1 lần. Còn về cảm biến chuyển động khi nào thu được tín hiệu **có chuyển động** thì mới gửi dữ liệu thông báo có chuyển động lên MQTT.
	- Điều chỉnh đèn led và động cơ Servo theo hành động nhận được.

- Thiết kế database để lưu trữ dữ liệu nhận được từ các sensors và thông tin về các devices, sensors. Connect vào database đó để lấy dữ liệu về nhiệt độ, độ ẩm, ánh sáng đo được để hiển thị lên biểu đồ line-chart.

- Tạo các flows trên node-red để xử lý theo kịch bản: 

	- Khi nhận được dữ liệu về **nhiệt độ, độ ẩm, ánh sáng** thì cần xử lý để lưu vào database. Cụ thể xử là cần kiểm tra định dạng dữ liệu của từng độ đo, đối với nhiệt độ cần nằm trong khoảng 0->100 độ, dữ liệu về độ ẩm cần nằm trong khoảng từ 10 -> 100 %, dữ liệu ánh sáng cần nằm trong khoảng từ 1-> 65535 lux. 
	- Khi nhận được dữ liệu thông báo **có chuyển động** thì kiểm tra dữ liệu về nhiệt độ và ánh sáng mới nhất trong cơ sở dữ liệu. Nếu nhiệt độ > 30 độ và cường độ ánh sáng > 100 lux thì gửi hành động quay động cơ RC Servo 9G SG90 (mô phỏng cho việc kéo rèm).
	- Sau 1 tiếng lại lấy dữ liệu trung bình về độ ẩm trong 1 tiếng trước. Nếu độ ẩm trung bình > 70 % thì gửi hành động bật đèn (mô phỏng cho việc mở thông gió trong nhà) trong vòng 5 phút. Hết 5 phút thì gửi hành động tắt đèn.

**Câu 3:**
- Đề xuất cơ chế giúp đăng kí các devices và sensors mới, monitor trạng thái của các devices và sensors.
- Lập trình logic cho cơ chế đã đề xuất trên.

**Việc định dạng và gửi nhận dữ liệu nhóm sinh viên cần tự đề xuất và thống nhất với nhau.**

**Yêu cầu:**  Tất cả các dịch vụ sử dụng yêu cầu đóng gói và chạy trên Docker container

**Lưu ý**: trình bày hướng tiếp cận, cách giải quyết vấn đề, sơ đồ khối hệ thống, sơ đồ luồng dữ liệu và cách thức triển khai hệ thống vào tài liệu riêng, nộp cùng mã nguồn bài thi.


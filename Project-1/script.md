### **Kịch bản 1**

#### **1. Kịch bản**


Đo nhiệt độ độ ẩm môi trường từ sensor DHT11, lưu dữ liệu đo được lưu vào influxdb, vẽ biểu đồ realtime có hiển thị giá trị nhiệt độ độ ẩm min/max và thời gian đo được, kiểm tra khi nhiệt độ/độ ẩm lớn hơn ngưỡng mà người dùng nhập vào trên giao diện node-red thì sẽ gửi email cảnh báo, và gửi tín hiệu bật/tắt đèn led


#### **2. Chuẩn bị**

- Phần cứng

	1. Esp8266 + cáp usb 
	2. Cảm biến nhiệt độ độ ẩm DHT11
	3. Bảng chân cắm 
	4. Các dây đực-cái 
	5. Module relay 1 kênh
	6. Hai bóng đèn led	
	7. Màn hình OLED

- Phần mềm
   1. Node-red
   2. Docker
   3. Ardunio

#### **3. Công việc**

**3.1 Firmware**

- Nối mạch:
	+ Cảm biến nhiệt độ độ ẩm nối với esp8266, sử dụng chân 16 làm chân data
	+ Đèn led 1 nối trực tiếp với esp8266, sử dụng chân 2 làm ledpin
	+ Đèn led 2 nối với relay
	+ Relay nối với esp8266: chân nguồn (VSS+) nối vào chân 5V, chân nối đất (VSS-) nối vào GNU, chân tín hiệu  nối vào chân số 10
	+ Màn hình OLED cắm thẳng vào esp8266

	(do esp8266 chỉ có 1 chân 5V, trong khi mạch nối có 2 thiết bị là relay và cảm biến nhiệt độ độ ẩm đều cần cắm chân nguồn vào 5V nên sẽ dùng 1 dây 2 đầu là đực nối chân 5V của esp8266 ra bảng điện và cắm 2 chân của 2 thiết bị kia vào)

- Định dạng dữ liệu và giao thức sử dụng
	- Giao thức: dùng MQTT để giao tiếp giữa esp8266 và node-red
			- topic esp8266 **public**: 	**icse/sensor**
			- topic esp8266 **subcribe**: 	**icse/action**
	- Dữ liệu nhiệt độ, độ ẩm đo được từ sensor do esp8266 gửi lên MQTT broker là 1 **String**:
			**'{"tem" : value, "humi" : value }'**
	- Dữ liệu nhận lại từ MQTT broker là 1 **String**:
			**'{"led1": status, "led2": status}'** với status = ON/OFF -> bật tắt led tương ứng.

- Yêu cầu: 
	+ Cho phép người dùng config wifi và nhập mqtt server, mqtt port động
	+ Màn hình OLED hiển thị  độ ẩm và nhiệt độ
	+ Sau 5s thì lấy dữ liệu về nhiệt độ độ ẩm và publish lên mqtt broker với topic là icse/sensor
	+ Khi nhận lại được action từ topic icse/action thì sẽ bật tắt đèn led tương ứng.

**3.2 Node-red**

- Tạo 1 input node mới tên là: threshold config
	- Gồm các trường để người dùng nhập:
		+ 1 trường config MQTT broker
		+ 1 trường nhập MQTT topic
		+ 1 trường nhập email 
		+ 1 trường nhập ngưỡng nhiệt độ
		+ 1 trường nhập ngưỡng độ ẩm

	- Yêu cầu:
		+ Node có 2 output
		+ Có verify type của các trường dữ liệu (email, integer), và cảnh báo khi người dùng nhập không đúng định dạng.
		+ Có help text về chức năng của node cũng như chức năng của các trường.

	- Họat động
		+ **Input** sẽ nhận dữ liệu từ MQTT broker thông qua topic mà người dùng nhập, với định dạng **String**:   
				**'{"tem" : value, "humi" : value }'**
		+ **Output 1** sẽ send dữ liệu với định dạng là **json**, để trong **msg.payload**: 		
				**{led1: status, led2: status}** với status = ON/OFF khi nhiệt độ/độ ẩm lớn hơn/nhỏ hơn ngưỡng người dùng nhập vào
		+ **Output 2** send dữ liệu với định dang **json**, để trong **msg.payload**:
				**{tem : value, humi : value }**
		+ Khi giá trị của nhiệt độ/độ ẩm lớn hơn ngưỡng người dùng nhập vào thì gửi 1 email cảnh báo tới địa chỉ mail mà người dùng đã nhập.

- Tạo flow thực hiện nhiệm vụ: Nhận dữ liệu từ esp8266 qua mqtt topic **icse/sensor**, sau đó

	- Sử dụng node mới tạo là **threshold config** nhận dữ liệu từ esp8266 qua mqtt topic **icse/sensor**, sau đó đẩy message tại **output 1** lên mqtt topic** icse/action**, đẩy message tại **output 2** vào **function node** để xử lý
	- Đẩy dữ liệu lên influxdb, dùng grafana vẽ biểu đồ
	- Đẩy dữ liệu vào function node để convert định dạng dữ liệu sau đó dùng chart node để vẽ biểu đồ,
	- Dùng template node để hiển thị thêm nhiệt độ/độ ẩm min/max (lấy từ influxdb)

**3.3 Hệ thống**

 Sử dụng docker để: 
 
- Chạy: mqtt container, influxdb container, grafana container
- Đóng gói node mới tạo và flow cùng với node-red trong 1 container



#### **Database**

##### **MySQL**: tên database: **bkcloud**

	User: root - Pass: bklcoud

Các bảng trong mysql: 

**device**:

	macAdrr | type | created_at | status

Trong đó: primary key (macAddr)

	CREATE TABLE device (
		macAddr 	VARCHAR(30) 	NOT NULL,
		type		VARCHAR(10) 	NOT NULL,
		status 		VARCHAR(50) 	NOT NULL,
		created_at 	DATETIME 		NOT NULL,
		PRIMARY KEY (macAddr)
	)


**sensor**:

	macAddr | name | unit | created_at | status 

Trong đó: primary key (macAddr, name)

	CREATE TABLE sensor (
		name 		VARCHAR(30) 	NOT NULL,
		macAddr 	VARCHAR(30) 	NOT NULL,
		unit 		VARCHAR(10),
		status 		VARCHAR(50) 	NOT NULL,
		created_at 	DATETIME 		NOT NULL,
		PRIMARY KEY (name, macAddr),
		CONSTRAINT fk_device FOREIGN KEY (macAddr) REFERENCES device(macAddr) ON DELETE CASCADE
	)


##### **InFluxDB**:  tên database: **bkcloud**

Các measurement:

**logs:**

	time | macAddr (tag) | name (tag) | status (field - String)

**data:**

	time | macAddr (tag)  | name (tag) | unit (field - Float) | value (field - Float)



**Dụng cụ phần cứng cần chuẩn bị:** 1 esp8266, 1 cảm biến chuyển động HC-SR501, 1 cảm biến nhiệt độ độ ẩm DHT11, 1 cảm biến ánh sáng BH1750, 1 động cơ RC Servo 9G SG90, 1 bóng đèn led và 1 màn hình OLED.


#### **Thạo**

1.  Tạo smart config cho người dùng connect vào wifi mà esp phát, sau khi connect thành công có giao diện web hiển thị danh sách các wifi để người dùng chọn 1 wifi để esp8266 connect vào, và cho phép người dùng config 2 thông tin là MQTT broker (mặc định để là localhost) và MQTT port (mặc định để 1883). Trong code firmaware cần lưu ý reset lại các wifi mà esp8266 đã connect để luôn yêu cầu người dùng phải chọn wifi để esp connect tới.

2. Dùng millis() để check sau 5s thì đóng gói dữ liệu về nhiệt độ, độ ẩm, ánh sáng gửi lên topic  icse/data với định dạng:

		{
			macAddr: "", 
			type: "data",
			sensorsData: [
				{name: "DHT11-t", value: 24, unit: "C"},	// value của nhiệt độ
				{name: "DHT11-h", value: 60, unit: "%"},	// value của độ ẩm
				{name: "BH1750", value: 6000, unit: "Lux"},	// value của ánh sáng
			]
		}

3. Khi phát hiện có chuyển động thì gửi message thông báo có chuyển động lên topic  icse/data với định dạng:

		{
			macAddr: "", 
			type: "motion",
		}

4. Điều khiển đèn động cơ servo hoặc đèn led tương ứng với message khi nhận lại được định dạng message trên topic icse/MAC/action
	 	 	
		{
			type: "servoAction",
			action: "ON/OFF"
		}

		{
			type: "ledAction",
			action: "ON/OFF"
		}


#### **Đông + Công**

Tạo 2 container node-red là node-red-server (binds port 1880 của container tới port 1880 trên host) và node-red-gateway (binds port 1880 của container tới port 1881 trên host)

Container **node-red-gateway** đóng vai trò là gateway, đăng kí topic **icse/data** để nhận dữ liệu từ các device, 

#### **Trên node-red-gateway**

**1 - ** Trên **node-red-gateway** sử dụng các biến trong **flow context** tên là **newestData-MAC** (với mac là địa chỉ mac của device) để lưu dữ liệu mới nhất nhận được từ **esp** và các biến **status-MAC** để lưu trạng thái của các device và sensor trên nó. Khi nhận được dữ liệu trên topic **icse/data**  với định dạng:
	
		{
				macAddr: "", 
				type: "data",
				sensorsData: [
					{name: "DHT11-t", value: 24, unit: "C"},	// value của nhiệt độ
					{name: "DHT11-h", value: 60, unit: "%"},	// value của độ ẩm
					{name: "BH1750", value: 6000, unit: "Lux"},	// value của ánh sáng
				]
		}

thì:
	
- Kiểm tra định dạng dữ liệu (C: [1, 100]; 	%: [0, 100],	lux: [1, 65535] - đúng định dạng thì trạng thì là ONLINE, khác thì là OFFLINE) theo từng đơn vị đo và so sánh với trạng thái của sensor trong biến **status-MAC**, nếu biến **statuss-MAC** chưa có thì thêm mới, nếu trạng thái của sensor khác nhau thì cập nhật trạng thái của sensor đó trong biến **status-MAC**. Biến **status-MAC** có định dạng:

		{
			"macAddr": "MAC",
			"DHT11-t" : "ONLINE/OFFLINE",
			"DHT11-h" : "ONLINE/OFFLINE",
			"DHT11-t" : "ONLINE/OFFLINE",
			"latestTimeReceiveData": timestamp
		}

	***( không quản lý trạng thái của các sensor không có unit)***

	sau 5 phút thì kiểm tra tất cả các biến **status-MAC**, device nào có **latestTimeReceiveData < now() - 5 phút** thì gửi trạng thái của các sensor sử dụng **HTTP POST** lên server thông qua api **127.0.0.1:1880/api/status**, với định dạng:

		{
			macAddr: "MAC",
			DHT11-t : "ONLINE/OFFLINE",
			DHT11-h : "ONLINE/OFFLINE",
			DHT11-t : "ONLINE/OFFLINE",
			type: "sensorStatus"
		}

 device nào có **latestTimeReceiveData < now() - 30 phút** thì gửi message thông báo device đó **OFFLINE** lên server cũng qua api **127.0.0.1:1880/api/status** với định dạng:
	
	{
			macAddr: "MAC",
			type: "deviceStatus",
			status: "OFFLINE"
		}
	
- Kiểm tra xem biến  **newestData-MAC** đã tồn tại chưa, nếu chưa thì thêm mới, còn có rồi thì cập nhật gía trị cho biến **newestData-MAC**, sau đó thêm  **timestamp** vào dữ liệu, khi đó dữ liệu mới có định dạng:

		{
			macAddr: "", 
			type: "data",
			time: timestamp,
			sensorsData: [
				{name: "DHT11-t", value: 24, unit: "C"},
				{name: "DHT11-h", value: 60, unit: "%"},
				{name: "BH1750", value: 6000, unit: "Lux"},
			]
		}

	***(chỉ cập nhật/thêm mới các sensor có unit đúng định dạng)***

Dữ liệu kia sẽ được thêm vào 1 biến là **devicesDataList** là 1 mảng, để chờ sau 1 phút sẽ gửi dữ liệu lên **node-red-server** thông qua việc gửi **HTTP POST** request tới api **127.0.0.1:1880/api/postData**, sau đó cập nhật lại mảng dữ liệu **devicesDataList**.

Mảng lưu dữ liệu: **devicesDataList** có định dạng:

		devicesDataList = [
			{
				macAddr: "MAC1", 
				data: [
					{
						time: timestamp,
						sensorsData: [
							{name: "DHT11-t", value: 24, unit: "C"},
							{name: "DHT11-h", value: 60, unit: "%"},
							{name: "BH1750", value: 6000, unit: "Lux"},
						]
					},
					.......
				]
			},
			.........
		]



**2 - ** Nhằm mục đích mô phỏng việc bật/tắt quạt khi phòng có người hoặc không có người, sẽ sử dụng kịch bản khi nhận được dữ liệu thông báo có chuyển động lần 1 thì bật quạt, lần 2 thì tắt quạt (trong thực tế sẽ cần check khi nào thì không còn người trong phòng mới tắt) thì ta sẽ lưu 1 biến tên là **motionCount-MAC** trong **flow context**. Khi nhận được thông báo có chuyển động lần đầu tiên thì thiết lập **motionCount-MAC = 1**, khi nhận được lần 2 thì thiết lập lại **motionCount-MAC = 0**, và lần 3 thì lại là 1 ..v..v.. Mỗi khi nhận được dữ lệu thông báo có chuyển động trên topic **icse/data** với định dạng 

		{
			macAddr: "", 
			type: "motion",
		}

	thì kiểm tra gía trị biến **motionCount-MAC**, nếu bằng 0 thì gửi hành động tắt động cơ servo với định dạng dưới lên topic **icse/MAC/action**:

		{
			type: "servoAction",
			action: "OFF"
		}

	nếu biến **motionCount-MAC = 1** thì kiểm tra gía trị nhiệt độ trong biến global context **newestData-MAC**. Nếu nhiệt độ > ngưỡng người dùng nhập  thì gửi hành động quay động cơ RC Servo 9G SG90 lên topic **icse/MAC/action** với định dạng:

		{
			type: "servoAction",
			action: "ON"
		}


#### **Trên node-red-server**

1. Khi nhận được thông tin đăng kí thiết bị mới trên topic **icse/newDevice** với định dạng 

		{
			macAddr: "5C:3B:1A:16:2A",
			type: "ESP8266",
			sensors: [
				{ name: "DHT11-t", unit: "C"},
				{ name: "DHT11-h", unit: "%"},
				{ name: "BH1750", unit: "Lux"},
				{ name: "HC-SR501", unit: ""}
			]
		}

	thì kiểm tra và lưu vào cơ sở dữ liệu, sau đó gửi lại thông báo đăng kí thành công cho device trên topic **icse/MAC/action** với định dạng:

		{
			type: "register", 
			status: "OK"
		}


2. Khi nhận được dữ liệu trên api **api/postData** với định dạng như dưới thì lưu vào measurement **data** trong **influxdb**

		devicesDataList = [
			{
				macAddr: "MAC1", 
				data: [
					{
						time: timestamp,
						sensorsData: [
							{name: "DHT11-t", value: 24, unit: "C"},
							{name: "DHT11-h", value: 60, unit: "%"},
							{name: "BH1750", value: 6000, unit: "Lux"},
						]
					},
					.......
				]
			},
			.........
		]

3.  Sau 10 phút lại lấy dữ liệu trung bình về độ ẩm trong 1 tiếng trước của tất cả các device (gỉa sử tất cả các device đều có cảm biến đo gía trị độ ẩm). Nếu độ ẩm trung bình > 70 % thì gửi hành động bật đèn. Sau 5 phút thì gửi hành động tắt đèn. Hành động bật/tắt đèn được gửi lên **icse/MAC/action** với định dạng:

		{
			type: "ledAction",
			action: "ON/OFF"
		}

4. Khi nhận được message thông báo status của các device/sensor qua api **/api/status** thì kiểm tra status của device/sensors đó tương ứng trong cơ sở dữ liệu. Nếu status mới khác thì up date status trong cả mysql và influxdb.

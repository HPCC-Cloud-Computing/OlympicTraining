msg.sensors = [
    {
        name: "BH1750",
        macAddr: "66:8D:8D:8D:8D",
        unit: "Lux",
        status: "ONLINE",
        created_at: "2017-11-19T00:29:52.000Z"
    }
]

msg.payload = [
    {
        time: "2017-11-19T08:14:26.752Z",
        macAddr: "66:8D:8D:8D:8D",
        name: "BH1750",
        value: 27846
    }
]

// [
//     // group line chart 1
//     {
//         unit: "C / %" ,
//         lines: [{
//             macAddr: "5C:3B:1A:16:2A",
//             sensorID: "5C:3B:1A:16:2A-DHT11",
//             unit: "C",
//             timeSeriesData: [
//                 { time: "2017-11-15T17:56:16.955Z", value: 20},
//                 ...
//             ]
//         }, ...],
//     },
//     // group line chart i
//     ...
// ]

var units_range = {
    c: {min: 1, max: 100},
    lux: {min: 1, max: 100},
    humi: {min: 1, max: 65535}
};

var groupLineChart = [
    {unit: "", lines: []},
    {unit: "Lux", lines: []}
]

for(let i = 0;i<msg.sensors.length;i++){
    msg.sensors[i].timeSeriesData = [];
}

for (let i = 0; i < msg.payload.length; i++) {
    // msg.payload[i].sensorID= msg.payload[i].sensorID.split('-')[1];
    let is_new_sensor = true;
    for (let j = 0; j < msg.sensors.length; j++) {
        if (msg.payload[i].name === msg.sensors[j].name) {
            msg.sensors[j].timeSeriesData.push({
                time: msg.payload[i].time,
                value: msg.payload[i].value
            })
            break;
        }
    }
    // if (is_new_sensor) {
    //     let new_sensor = new Sensor(msg.payload[i].macAddr, msg.payload[i].sensorID,
    //         msg.payload[i].unit);
    //     new_sensor.timeSeriesData.push({
    //         time: msg.payload[i].time,
    //         value: msg.payload[i].value
    //     })
    //     initSensorsData.push(new_sensor);
    // }
}

for (let i = 0; i < msg.sensors.length; i++) {
    if (msg.sensors[i].unit.toLowerCase() === 'c' ||
        msg.sensors[i].unit.toLowerCase() === '%') {
        groupLineChart[0].lines.push(msg.sensors[i]);
        groupLineChart[0].unit += " / " + msg.sensors[i].unit;
    }
    if (msg.sensors[i].unit.toLowerCase() === 'lux') {
        groupLineChart[1].lines.push(msg.sensors[i]);
    }
}

groupLineChart[0].unit = groupLineChart[0].unit.slice(3, groupLineChart[0].unit.length);

msg.payload = groupLineChart;
// return msg;
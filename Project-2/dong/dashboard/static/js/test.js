msg.arrSensorID = msg.payload.sensorID.split(',');
let sensor_query = "";
for(let i = 0;i<msg.arrSensorID;i++){
    if(msg.arrSensorID[i]){
        sensor_query += "or sensorID = '" + msg.arrSensorID[i] + "' ";
    }
}

sensor_query = sensor_query.slice(2, sensor_query.length);

let endTime = Date.now();
let startTime = endTime - 5*1000;
startTime = startTime*Math.pow(10,6),
endTime = endTime*Math.pow(10,6)

msg.query = "select * from data where '" +
    sensor_query + "' and " +
    "time >= "+ startTime + " and " +
    "time <= " + endTime;
// return msg;
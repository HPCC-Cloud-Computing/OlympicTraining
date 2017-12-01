'use strict';

var dataTables;
var realTimeCharts = [];
var devices = [];
var DEVICE_INFO_API = '/device/api/info';
var SENSOR_INFO_API = '/sensor/api/info';
var DEVICE_LOGS_API = '/device/api/logs';
var SENSOR_LOGS_API = '/sensor/api/logs';
var INIT_DATA_API = '/realtime-chart/api/device/initData';
// var LATEST_DATA_API = '/realtime-chart/api/devices/latestData';
var LATEST_DATA_API = '/realtime-chart/api/sensor/latestData';
var MAC_ADDR_PARAM = 'macAddr';
var SENSOR_ID_PARAM = 'sensorIDs';


$('.bkcloud-sidebar-element').each(function (index) {
    $(this).on('click', function () {
        if (!$(this).hasClass('active')) {
            $('ul.sidebar-menu li.bkcloud-sidebar-element.active').removeClass('active');
            $(this).addClass('active');
        }
    })
});

var create_datatables_info = function (selector, data, columns) {
    return $('#' + selector).DataTable({
        data: data,
        columns: columns
    });
};

var create_datatables_logs = function (selector, data, columns) {
    return $('#' + selector).DataTable({
        data: data,
        columns: columns
    });
};

let remove_charts_tab = function () {
    if (realTimeCharts.length) {
        for (let i = 0; i < realTimeCharts.length; i++) {
            realTimeCharts[i].destroy();
        }
        $('#sensor-data-chart').empty();
        $('#sensor-legend-chart').empty();
    }
}

$('#devices-info').on('click', function () {

    remove_charts_tab();
    myChart.destroy();

    $('#content-header-text').text('Devices information');
    $('.bkcloud-dashboard').css('display', 'none');
    $('.bkcloud-datatables-info-container').css('display', '');
    $('#sensor-data-chart-container').css('display', 'none');
    $('#load-data-for-table').css('display', '').text("Loading data ...");
    let getDeviceInfo = getDataForDataTables(DEVICE_INFO_API);
    getDeviceInfo.then(
        function (data) {
            // console.log(data);
            devices = [];
            let data_display = [];
            for (let i = 0; i < data.length; i++) {
                let date_created = data[i].createdAt.split('.')[0];
                date_created = date_created.replace('T', ' ');
                // console.log(date_created);
                data_display.push([
                    data[i].macAddr,
                    data[i].deviceType,
                    date_created,
                    data[i].deviceStatus
                ])
                if (data[i].deviceStatus === "ONLINE") {
                    devices.push({
                        id: data[i].macAddr,
                        text: data[i].deviceType + " - " + data[i].macAddr
                    });
                }
            }
            let columns = [
                {title: "MAC address"},
                {title: "Device type"},
                {title: "Created at"},
                {title: "Status"}
            ];
            if (dataTables) {
                dataTables.destroy();
                $('#bkcloud-datatables-info').empty();
            }
            dataTables = create_datatables_info('bkcloud-datatables-info', data_display, columns);

            $('#load-data-for-table').css('display', 'none');
        },
        function (error) {
            alert("Can't get device info: " + error);
            $('#load-data-for-table').css('display', '').text("Can't get data from server!")
        }
    )
});

$('#sensors-info').on('click', function () {

    remove_charts_tab();

    $('#content-header-text').text('Sensors information');
    $('.bkcloud-dashboard').css('display', 'none');
    $('.bkcloud-datatables-info-container').css('display', '');
    $('#sensor-data-chart-container').css('display', 'none');
    $('#load-data-for-table').css('display', '').text("Loading data ... ");
    let getSensorInfo = getDataForDataTables(SENSOR_INFO_API);
    getSensorInfo.then(
        function (data) {
            // console.log(data);
            let data_display = [];
            for (let i = 0; i < data.length; i++) {
                let date_created = data[i].createdAt.split('.')[0];
                date_created = date_created.replace('T', ' ');
                data_display.push([
                    data[i].macAddr,
                    data[i].sensorID,
                    date_created,
                    data[i].sensorStatus
                ])
            }
            let columns = [
                {title: "Device's mac address"},
                {title: "Sensor name"},
                {title: "Created at"},
                {title: "Status"}
            ];
            if (dataTables) {
                dataTables.destroy();
                $('#bkcloud-datatables-info').empty();
            }
            dataTables = create_datatables_info('bkcloud-datatables-info', data_display, columns);
            $('#load-data-for-table').css('display', 'none');
        },
        function (error) {
            alert("Can't get sensor info: " + error);
            $('#load-data-for-table').css('display', '').text("Can't get data from server!")
        }
    )
});

var getDataForDataTables = function (url) {
    return new Promise(function (resolve, eject) {
        $.ajax(
            {url: url}
        ).done(function (data) {
            resolve(data);
        }).fail(function (jqXHR, textStatus) {
            eject(textStatus);
        });
    });
}

$('#line-chart').on('click', function () {
    $('#content-header-text').text('Lines chart');
    $('#sensor-data-chart-container').css('display', '');
    $('.bkcloud-datatables-info-container').css('display', 'none');
    if (realTimeCharts.length) {
        for (let i = 0; i < realTimeCharts.length; i++) {
            realTimeCharts[i].destroy();
        }
        $('#sensor-data-chart').empty();
        $('#sensor-legend-chart').empty();
    }
    console.log(devices);
    if (devices.length) {
        $('#combobox-devices').css('display', "");
        $('#load-data-for-chart').css('display', "none");
        $('#chart-controller-input').select2({
            width: '100%',
            data: devices
        }).on("select2:select", function (e) {
            $(this).prop('disabled', true);
            var self = this;
            let macAddr = e.target.value;
            if (realTimeCharts.length) {
                for (let i = 0; i < realTimeCharts.length; i++) {
                    realTimeCharts[i].destroy();
                }
                $('#sensor-data-chart').empty();
                $('#sensor-legend-chart').empty();
            }
            getInitDeviceData(macAddr).then(
                function (initData) {
                    let is_had_realtime_data = false;
                    for (let i = 0; i < initData.length; i++) {
                        if (initData[i].lines.length) {
                            is_had_realtime_data = true;
                            let realTimeChart = new RealtimeLineChart('sensor-data-chart', initData[i].unit);
                            realTimeChart.initChart(initData[i].lines);
                            realTimeCharts.push(realTimeChart);
                        }
                    }
                    if (is_had_realtime_data) {
                        $('#no-data-realtime').css("display", 'none');
                    } else {
                        $('#no-data-realtime').css("display", '');
                    }
                },
                function (error) {
                    alert('Can not get device data');
                    console.log(error);
                }
            )
            setTimeout(function () {
                $(self).prop('disabled', false);
            }, 1000);
        })

        getInitDeviceData(devices[0].id).then(
            function (initData) {
                for (let i = 0; i < initData.length; i++) {
                    let is_had_realtime_data = false;
                    if (initData[i].lines.length) {
                        is_had_realtime_data = true;
                        let realTimeChart = new RealtimeLineChart('sensor-data-chart', initData[i].unit);
                        realTimeChart.initChart(initData[i].lines);
                        realTimeCharts.push(realTimeChart);
                    }
                    if (is_had_realtime_data) {
                        $('#no-data-realtime').css("display", 'none');
                    } else {
                        $('#no-data-realtime').css("display", '');
                    }
                }
            },
            function (error) {
                alert('Can not get device data');
                console.log(error);
            }
        )
    } else {
        $('#combobox-devices').css('display', "none");
        $('#load-data-for-chart').css('display', "").text("Have no data!");
    }
});

var getInitDeviceData = function (macAddr) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: INIT_DATA_API + "?" + MAC_ADDR_PARAM + "=" + macAddr,
        })
            .done(function (data) {
                resolve(data);
            });
    });
}



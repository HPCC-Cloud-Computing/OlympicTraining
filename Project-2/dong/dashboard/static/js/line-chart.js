'use strict';

var RealtimeLine = function (id, color, timeSeriesData, line_unit) {
    this.id = id;
    this.color = color;
    this.line_unit = line_unit;
    this.timeSeriesData = timeSeriesData;
    this.linePath = null;
};

var RealtimeLineChart = function (selector, unit) {
    this.selector = "#" + selector;
    this.unit = unit;
    this.lines = [];
    this.setFormat();
    this.updateTimeInterval = 5000;
}

RealtimeLineChart.prototype.setFormat = function () {
    this.chart_format = {};
    var self = this;
    let chart_format = self.chart_format;
    chart_format.margin = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 50
    }
    chart_format.width = 900 - chart_format.margin.left - chart_format.margin.right;
    chart_format.height = 400 - chart_format.margin.top - chart_format.margin.bottom;

    //    set the ranges
    self.x = d3.time.scale().range([0, chart_format.width]);
    self.y = d3.scale.linear().range([chart_format.height, 0]);
    // create svg line
    self.svgLine = d3.svg.line()
        .x(function (d) {
            return self.x(d.time);
        })
        .y(function (d) {
            return self.y(d.value);
        })
        .interpolate("cardinal")
    // define axis for chart
    self.xAxis = d3.svg.axis().scale(self.x)
        .orient("bottom").ticks(d3.time.seconds, 5).tickFormat(d3.time.format("%H:%M:%S"));
    self.yAxis = d3.svg.axis().scale(self.y)
        .orient("left").ticks(10);

}

RealtimeLineChart.prototype.generateColor = function (i) {
    return "hsl(" + i * 100 + ", 100%, 50%)";
}

RealtimeLineChart.prototype.initChart = function (initData) {
    var self = this;
    // return new Promise(function (resolve, reject) {
    //     self.getInitChartData().then(
    //         function (initData) {

                for (let i = 0; i < initData.length; i++) {
                    // initData[i].time = new Date(initData[i].time);
                    let color = self.generateColor(i);
                    let line_id = initData[i].sensorID;
                    let timeSeriesData = initData[i].timeSeriesData;
                    for (let j = 0; j < timeSeriesData.length; j++) {
                        timeSeriesData[j].time = new Date(timeSeriesData[j].time);
                    }
                    let line_unit = initData[i].unit;
                    let new_line = new RealtimeLine(line_id, color, timeSeriesData, line_unit);
                    self.lines.push(new_line);
                }
                self.drawChart();
                self.updator = setInterval(function () {
                    self.updateChart();
                }, self.updateTimeInterval);
                // resolve('success');
    //         },
    //         function (error) {
    //             reject(error)
    //         }
    //     )
    // })
}

// RealtimeLineChart.prototype.getInitChartData = function () {
//     var self = this;
//     return new Promise(function (resolve, reject) {
//         $.ajax({
//             url: INIT_DATA_API + "?" + MAC_ADDR_PARAM + "=" + self.macAddr,
//         })
//             .done(function (data) {
//                 resolve(data);
//             });
//     });
// };

RealtimeLineChart.prototype.getLatestData = function () {
    var self = this;
    let param = '';
    for(let i = 0;i<self.lines.length;i++){
        param += self.lines[i].id + ",";
    }
    if(param) {
        param = param.slice(0, param.length - 1);
    }
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: LATEST_DATA_API + "?" + SENSOR_ID_PARAM + "=" + param,
        })
            .done(function (data) {
                resolve(data);
            });
    });
}

RealtimeLineChart.prototype.drawChart = function () {
    var self = this;
    self.scale_domain_range();
    self.drawBodyAndAxis();
    self.drawLines();
    self.drawLineLegends();
}

RealtimeLineChart.prototype.scale_domain_range = function () {
    var self = this;
    var lines_data = [];
    for (let i = 0; i < self.lines.length; i++) {
        let line = self.lines[i];
        for (let j = 0; j < line.timeSeriesData.length; j++) {
            lines_data.push(line.timeSeriesData[j]);
        }
    }
    self.x.domain([
        d3.min(lines_data, function (d) {
            return d.time;
        }),
        d3.max(lines_data, function (d) {
            return d.time;
        })
    ]);
    self.y.domain([
        0,
        d3.max(lines_data, function (d) {
            return d.value;
        }) * 1.25
    ])
}

RealtimeLineChart.prototype.drawBodyAndAxis = function () {
    var self = this;
    let WIDTH = self.chart_format.width + self.chart_format.margin.left +
        self.chart_format.margin.right;
    let HEIGHT = self.chart_format.height + self.chart_format.margin.top +
        self.chart_format.margin.bottom;

    self.svg_element = d3.select(self.selector)
        .append("svg")
        .attr('class', 'chart')
        .attr("width", WIDTH)
        .attr("height", HEIGHT);
    self.containerElement = self.svg_element.append("g")
        .attr("transform",
            "translate(" + self.chart_format.margin.left + "," +
            self.chart_format.margin.top + ")");

    self.xAxisGroup = self.containerElement.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.chart_format.height + ")")
        .call(self.xAxis);

    self.yAxisGroup = self.containerElement.append('g')
        .attr("class", "y axis")
        .call(self.yAxis);

    self.yAxisGroup
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("x", 25)
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(self.unit);
}

RealtimeLineChart.prototype.drawLine = function (line) {
    var self = this;
    let linePath = self.containerElement.append('path')
        .attr("class", "line")
        .attr("id", line.id.split('-')[0])
        .attr("stroke", line.color)
        .attr("d", self.svgLine(line.timeSeriesData))
    line.linePath = linePath;
}

RealtimeLineChart.prototype.drawLines = function () {
    var self = this;
    for (let i = 0; i < self.lines.length; i++) {
        self.drawLine(self.lines[i]);
    }
}

RealtimeLineChart.prototype.drawNewLines = function (newLineIds) {
    let self = this;
    for (let i = 0; i < newLineIds.length; i++) {
        let newLineId = newLineIds[i];
        for (let j = 0; j < self.lines.length; j++) {
            if (self.lines[j].id === newLineId) {
                self.drawLine(self.lines[j]);
                break;
            }
        }
    }
};


RealtimeLineChart.prototype.updateChart = function () {
    var self = this;
    $.when(self.getLatestData()).then(
        function (latestData) {
            let linesChange = self.updateLine(latestData);

            self.removeOldLines(linesChange.removeLineIds);

            self.scale_domain_range();
            self.xAxisGroup.call(self.xAxis);
            self.yAxisGroup.call(self.yAxis);

            let changeLineIds = [];
            for (let i = 0; i < linesChange.removeLineIds.length; i++) {
                changeLineIds.push(linesChange.removeLineIds[i]);
            }
            for (let i = 0; i < linesChange.newLineIds.length; i++) {
                changeLineIds.push(linesChange.newLineIds[i]);
            }

            for (let i = 0; i < self.lines.length; i++) {
                let isLineChange = false;
                for (let j = 0; j < changeLineIds.length; j++) {
                    if (self.lines[i].id === changeLineIds[j]) {
                        isLineChange = true;
                        break;
                    }
                }
                if (!isLineChange) {
                    self.lines[i].linePath.attr('d', self.svgLine(self.lines[i].timeSeriesData));
                }
            }
            // draw new Lines
            self.drawNewLines(linesChange.newLineIds);
            // if line list has been changed, redraw legend container
            if (changeLineIds.length > 0) {
                self.reDrawLineLegends();
            }
        },
        function (err) {
            alert("Can't get latest data for chart");
            console.log(err);
        }
    )
}

RealtimeLineChart.prototype.updateLine = function (latestData) {
    let self = this;
    let lineListChange = false;
    let newLineIds = [];
    let removeLineIds = [];

    for (let i = 0; i < latestData.length; i++) {
        let is_new_line = true;
        for (let j = 0; j < self.lines.length; j++) {
            if (latestData[i].sensorID === self.lines[j].id) {
                is_new_line = false;
                let lineTimeSerialData = self.lines[j].timeSeriesData;
                let lastOldTimeSerialData = lineTimeSerialData[lineTimeSerialData.length - 1];
                for (let k = 0; k < latestData[i].timeSeriesData.length; k++) {
                    let new_data_node = latestData[i].timeSeriesData[k];
                    new_data_node.time = new Date(new_data_node.time);
                    if (new_data_node.time > lastOldTimeSerialData.time) {
                        lineTimeSerialData.push(new_data_node);
                    }
                }
                break;
            }
        }
        if (is_new_line) {
            lineListChange = true;
            let color = self.generateColor(self.lines.length);
            let line_id = latestData[i].sensorID;
            let timeSeriesData = latestData[i].timeSeriesData;
            for (let j = 0; j < timeSeriesData.length; j++) {
                timeSeriesData[j].time = new Date(timeSeriesData[j].time);
            }
            let new_line = new RealtimeLine(line_id, color, timeSeriesData);
            self.lines.push(new_line);
            newLineIds.push(new_line.id);
        }
    }

    for (let i = 0; i < self.lines.length; i++) {
        let lineTimeSerialData = self.lines[i].timeSeriesData;
        let currentTime = new Date();
        let limitEndTime = new Date(currentTime.getTime() - 60000);
        // remove old data
        for (let k = 0; k < lineTimeSerialData.length; k++) {
            let timeSerieSlice = lineTimeSerialData[k];
            if (timeSerieSlice.time < limitEndTime) {
                lineTimeSerialData.splice(k, 1);
                k = k - 1;
            }
        }
    }

    for (let i = 0; i < self.lines.length; i++) {
        if (self.lines[i].timeSeriesData.length === 0) {
            removeLineIds.push(self.lines[i].id);
        }
    }

    return {
        removeLineIds: removeLineIds,
        newLineIds: newLineIds,
    };

}

RealtimeLineChart.prototype.removeOldLines = function (oldLineIds) {
    let self = this;
    for (let i = 0; i < oldLineIds.length; i++) {
        for (let j = 0; j < self.lines.length; j++) {
            if (self.lines[j].id === oldLineIds[i]) {
                self.lines[j].linePath.remove();
                self.lines.splice(j, 1);
                break;
            }
        }
    }
}

RealtimeLineChart.prototype.drawLineLegends = function () {
    var self = this;

    let legendElement = $(self.selector).parent().find('.chart-legend');
    let legendWidth = 150;
    let legendHeight = self.chart_format.height + self.chart_format.margin.top +
        self.chart_format.margin.bottom;
    let svgLegendElement = d3.select(legendElement.get(0))
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
    let legendContainerElement = svgLegendElement.append("g")
        .attr("transform", "translate(5,5)");
    self.legends = {
        svgLegend: svgLegendElement,
        legendContainerElement: legendContainerElement
    }

    for (let i = 0; i < self.lines.length; i++) {
        let line = self.lines[i];
        let newSvgLegendLine = self.legends.legendContainerElement.append('g')
            .attr("class", "legend")
            .attr("transform", "translate(0, " + (i + 1) * 50 + ")");
        newSvgLegendLine.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", line.color)
            .on('click', function () {
                var active = self.lines[i].active ? false : true;
                var opacity = active ? 0 : 1;

                d3.select("#" + self.lines[i].id.split('-')[1]).style("opacity", opacity);
                self.lines[i].active = active;
            });
        newSvgLegendLine.append("text")
            .attr("x", 23)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(line.id.split('-')[1] + " (" + line.line_unit + ")");
        newSvgLegendLine.hoverRect = newSvgLegendLine.append("rect")
            .attr("y", -9)
            .attr("x", -5)
            .attr("width", 150)
            .attr("height", 36)
            .style("fill", "none");
    }
};

RealtimeLineChart.prototype.reDrawLineLegends = function () {
    var self = this;
    self.legends.legendContainerElement.remove();
    self.legends.svgLegend.remove();
    self.drawLineLegends();
};

RealtimeLineChart.prototype.destroy = function () {
    var self = this;
    self.svg_element.remove();
    // self.legends.legendContainerElement.remove();
    // self.legends.svgElement.remove();
    clearInterval(self.updator);
};










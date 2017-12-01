var myChart;
$('#dashboard').on('click', function () {

    remove_charts_tab();
    $('#content-header-text').text('Dashboard');
    $('.bkcloud-dashboard').css('display', '');
    $('#bkcloud-datatables-container').css('display', 'none');
    $('#sensor-data-chart-container').css('display', 'none');

    var ctx = document.getElementById("myChart");
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                label: 'My first chart',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 1,
                fill: true
            }, {
                label: 'Sensor 1',
                data: [1, 12, 30, 5, 2, 15],
                backgroundColor: [
                    'rgba(36, 63, 238, 0.2)'
                ],
                borderColor: [
                    'rgba(36, 63, 238, 1)'
                ],
                borderWidth: 1,
                fill: 'origin'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
                mode: 'nearest'
            },
            legend: {
                display: true,
                position: 'top'
            }
        }
    });

    let deviceStatusData = {
        datasets: [
            {
                data: [90, 0],
                backgroundColor: [
                    '#3F9F3F', 'rgb(85, 89, 96)'
                ],
            }
        ],
        labels: ['ONLINE', 'OFFLINE']
    }
    //
    var deviceStatusDoughnutChart = new Chart($('#device-status-pie-chart'), {
        type: 'doughnut',
        data: deviceStatusData,
        options: {
            pieceLabel: {
                // render: 'label'
                render: 'percentage',
                fontColor: '#fff'
            }
        }
    });

    let deviceTypesData = {
        datasets: [{
            data: [50, 10, 20, 20],
            backgroundColor: [
                'rgb(226, 206, 27)', 'rgb(91, 201, 36)', '#1c4bcc', '#d60e36'
            ],
        }
        ],
        labels: ['ESP8266', 'UNO', 'PI', 'ABC']
    }
    var deviceTypesPieChart = new Chart($('#device-types-pie-chart'), {
        type: 'pie',
        data: deviceTypesData,
        options: {
            pieceLabel: {
                // render: 'label'
                render: 'percentage',
                fontColor: '#fff'
            }
        }
    });


})
;
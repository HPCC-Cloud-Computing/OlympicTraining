var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hmcsensor@gmail.com', // Your email id
        pass: 'bkhmc20130447' // Your password
    }
});

var mailOptions = {
    from: 'hmcsensor@gmail.com', // sender address
    to: 'haminhcongbkhn@gmail.com', // list of receivers
    subject: 'sensor data warning', // Subject line
    text: "sensor_data: 2131"
};
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    }
});
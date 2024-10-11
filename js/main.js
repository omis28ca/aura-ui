(function ($) {
    "use strict";

    let device_id="";
    let keyPass = "491520";
    let password = "";

    var g1 = new JustGage({
        id: 'g1',
        value: 0,
        min: 0,
        max: 3500,
        symbol: ' RPM',
        pointer: true,
        gaugeWidthScale: 0.2,
        pointerOptions: {
            toplength: 8,
            bottomlength: -20,
            bottomwidth: 6,
            color: '#baa304'
        },
        customSectors: [{
            color: '#ff0000',
            lo: 0,
            hi: 800
        }, {
            color: '#00ff00',
            lo: 900,
            hi: 3500
        }],
        counter: false,
        donut: false
    });

    var g4 = new JustGage({
        label: "label",
        id: 'g4',
        value: .01,
        min: 0,
        max: 10,
        symbol: ' PPM',
        pointer: true,
        pointerOptions: {
            toplength: 8,
            bottomlength: -20,
            bottomwidth: 6,
            color: '#49aa06'
        },
        gaugeWidthScale: 0.4,
        counter: true,
        donut: false,
        showInnerShadow: true,
        shadowOpacity: 1,
        shadowSize: 5,
        shadowVerticalOffset: 10,
        customSectors: {
            ranges: [{
                color: "#ff3b30",
                lo: 0,
                hi: 1
            }, {
                color: "#43bf58",
                lo: 1,
                hi: 5
            },{
                color: "#e26508",
                lo: 1,
                hi: 5
            }]},
        textRenderer: function (val) {
            return val;
        },
        onAnimationEnd: function () {
            console.log('f: onAnimationEnd()');
        }
    });

    var wsbroker = "127.0.0.1";  //mqtt websocket enabled broker
    var wsport = 8080; // port for above

    var client = new Paho.MQTT.Client(wsbroker, wsport,"aura-client-id-" + parseInt(Math.random() * 100, 10));

    client.startTrace();

    client.onConnectionLost = function (responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
    };

    client.onMessageArrived = function (message) {
        console.log(message.destinationName);
        console.log(message.payloadString);

        var data = JSON.parse(message.payloadString);

        if (data.hasOwnProperty("id")) {
            device_id = data.id;
            g1.refresh(data.rpm);
            g4.refresh(parseFloat(data.ppm).toFixed(2));

            if(data.lck===0){
                $("#lock_status").hide();
                $("#unlock_status").show();
            }else{
                $("#lock_status").show();
                $("#unlock_status").hide();
            }

            if(data.pla===1){
                $("#plasma_status").show();
            }else{
                $("#plasma_status").hide();
            }

            $("#txt_device_id").val("SN:"+device_id);

        } else {
            console.log(data);
        }
        // change the value at runtime
        //gauge.value = data.ppm;
        //gauge.refresh();//console.log(client.getTraceLog());
        //gaugeFan.value = parseInt(data.rpm);

    };

    var options = {
        timeout: 30,
        keepAliveInterval: 30,
        //reconnect : true,         // Enable automatic reconnect
        //reconnectInterval: 10,     // Reconnect attempt interval : 10 seconds
        onSuccess: function () {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multile lines of these
            client.subscribe('aurahg', {qos: 1});
            client.subscribe('/aurahg', {qos: 1});
            client.subscribe('aura/data', {qos: 1});

            //use the below if you want to publish to a topic on connect
            //message = new Paho.MQTT.Message("{\"Name\":\"Meter.Watts\",\"Value\":\"0.0\",\"Description\":\"\",\"FieldType\":\"\",\"UpdateTime\":\"2019-01-15T00:57:48.487913Z\",\"NeedsUpdate\":false}");
            //message.destinationName = "hg-104/HomeAutomation.PhilipsHue/1/event";
            var message = new Paho.MQTT.Message("Hello");
            message.destinationName = "/aura";
            client.send(message);

        },
        onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage);
        }
    };

    function init() {
        client.connect(options);
    }



    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    $('#btn_ppm_up').click(function () {
        console.log("btn_ppm_up")
        sendMessage({"act":"poff"})
    });
    $('#btn_ppm_dn').click(function () {
        console.log("btn_ppm_dn")
        sendMessage({"act":"pon"})
    });
    $('#btn_fan_up').click(function () {
        console.log("btn_fan_up")
        sendMessage({"act":"fon"})
    });
    $('#btn_fan_dn').click(function () {
        console.log("btn_fan_dn")
        sendMessage({"act":"rst"})
    });
    $('#btn_on').click(function () {
        console.log("btn_on")
        sendMessage({"act":"fset","spd":255})
    });
    $('#btn_off').click(function () {
        console.log("btn_off")
        sendMessage({"act":"fset","spd":30})
    });

    $('#btn_open').click(function () {
        $('#keypad').show();
        $('#numberPassword').val("");
        $('#controls').hide();
    });

    $('.btn_key').click(function () {
        let key = $(this).data("key");
        password += key;
        updatePasswordField();
        if(password.length >= 6){
            password = password.trim();
            if(Object.is(password, keyPass)){
                console.log("OK")
                sendMessage({"act":"opn"})
            }else{
                console.log("Fail")
            }
            $('#keypad').hide();
            $('#controls').show();
            password = "";
        }
        console.log(password)
    });


    $('.input-range').on('input', function () {
        const min = 0;
        const max = 255;
        const percentage = Math.round((this.value - min) / (max - min) * 100);

        $(this).next('.range-value').html(percentage + "%");
        sendMessage({"act":"fset","spd":Math.round(this.value)})
    });

    // Function to update the password field
    function updatePasswordField() {
        $('#numberPassword').val(password);
    }

    function sendMessage(message) {


            var messagePayload = new Paho.MQTT.Message(JSON.stringify(message));
            messagePayload.destinationName = "aura/client";
            client.send(messagePayload);



    }

    init();


})(jQuery);


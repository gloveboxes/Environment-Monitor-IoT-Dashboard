$(document).ready(function() {
    $("#ledOn").click(function() {
        var deviceId = $("#deviceId").val();
        var uri = "/" + deviceId + "/led/1";
        
        $.post(uri, function() {
            alert("LED ON sent");
        })
        .fail(function(data) {
            alert( "LED ON error" );
        });
    });
        
    $("#ledOff").click(function() {
        var deviceId = $("#deviceId").val();
        var uri = "/" + deviceId + "/led/0";
        
        $.post(uri, function() {
            alert("LED OFF sent");
        })
        .fail(function() {
            alert( "LED OFF error" );
        });
    });
});
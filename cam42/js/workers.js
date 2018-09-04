function timedCount() {
    postMessage("/photo/0/9/alarm.jpg?"+(new Date()).getTime());
    setTimeout("timedCount()",60000);
}

timedCount();
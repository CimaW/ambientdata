function Cam42(){
    this.lineChart=null;
    this.barChart=null;
    this.init=function(){
        (function ($) {
            "use strict"; // Start of use strict

            // Configure tooltips for collapsed side navigation
            $('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
                template: '<div class="tooltip navbar-sidenav-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
            })

            // Toggle the side navigation
            $("#sidenavToggler").click(function (e) {
                e.preventDefault();
                $("body").toggleClass("sidenav-toggled");
                $(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
                $(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");
            });

            // Force the toggled class to be removed when a collapsible nav link is clicked
            $(".navbar-sidenav .nav-link-collapse").click(function (e) {
                e.preventDefault();
                $("body").removeClass("sidenav-toggled");
            });

            // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
            $('body.fixed-nav .navbar-sidenav, body.fixed-nav .sidenav-toggler, body.fixed-nav .navbar-collapse').on('mousewheel DOMMouseScroll', function (e) {
                var e0 = e.originalEvent,
                    delta = e0.wheelDelta || -e0.detail;
                this.scrollTop += (delta < 0 ? 1 : -1) * 30;
                e.preventDefault();
            });

            // Scroll to top button appear
            $(document).scroll(function () {
                var scrollDistance = $(this).scrollTop();
                if (scrollDistance > 100) {
                    $('.scroll-to-top').fadeIn();
                } else {
                    $('.scroll-to-top').fadeOut();
                }
            });

            // Configure tooltips globally
            $('[data-toggle="tooltip"]').tooltip()

            // Smooth scrolling using jQuery easing
            $(document).on('click', 'a.scroll-to-top', function (event) {
                var $anchor = $(this);
                $('html, body').stop().animate({
                    scrollTop: ($($anchor.attr('href')).offset().top)
                }, 1000, 'easeInOutExpo');
                event.preventDefault();
            });

            // Call the dataTables jQuery plugin
            $(document).ready(function () {
                $('#dataTable').DataTable();
            });

        })(jQuery); // End of use strict


        if(typeof(Worker) !== "undefined") {
                if(typeof(this.reloadAlarm) == "undefined") {
                    this.reloadAlarm = new Worker("/js/workers.js");
                }
                this.reloadAlarm.onmessage = function(event) {
                console.log(event.data);
                    $("#lastAlarmImg").attr("src",event.data);
                    $.get( "/dashboard/rest/lastDateAlarm", function( data ) {
                            $("#lastDateSpan").html(moment(data).format("DD-MM-YYYY HH:mm")
                                + " ("
                                + moment(new Date()).format("DD-MM-YYYY HH:mm")
                                + ")"
                            );
                        });
                };
            }

        // Chart.js scripts
        // -- Set new default font family and font color to mimic Bootstrap's default styling
        Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
        Chart.defaults.global.defaultFontColor = '#292b2c';

        var ctx = document.getElementById("myAreaChart");
            lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        lineTension: 0.3,
                        borderColor: ['#dc3545'],
                        backgroundColor:"rgba(0, 0, 0, 0)",
                        pointRadius: 3,
                        pointBackgroundColor: "#dc3545",
                        pointBorderColor: "#dc3545",
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: "#dc3545",
                        pointHitRadius: 20,
                        pointBorderWidth: 1,
                        label: 'Temperature',
                        yAxisID:"temperature",
                    },
                    {
                        lineTension: 0.3,
                        borderColor: ['#007bff'],
                        backgroundColor:"rgba(0, 0, 0, 0)",
                        pointRadius: 3,
                        pointBackgroundColor: "#007bff",
                        pointBorderColor: "#007bff",
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: "#007bff",
                        pointHitRadius: 20,
                        pointBorderWidth: 1,
                        label: 'Humidity',
                        yAxisID:"humidity",
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            id: 'temperature',
                            type: 'linear',
                            min: 0,
                            ticks: {
                                suggestedMax: 50,
                                suggestedMin: 0,
                                callback: function(value, index, values) {
                                    return value+" °C";
                                }
                            }
                        }, {
                            id: 'humidity',
                            type: 'linear',
                            min: 0,
                            max:100,
                            ticks: {
                                suggestedMax: 70,
                                suggestedMin: 0,
                                callback: function(value, index, values) {
                                    return value+"%";
                                }
                            }
                        }]
                    },
                    legend: {
                        display: false
                    }
                }
            });

           var start = moment().subtract(1, 'days');
            var end = moment();

            function cb(start, end) {
                $('#reportrange span').html(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
            }

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                //"timePicker": true,
                //"timePicker24Hour": true,
                ranges: {
                   'Last 24H': [moment().subtract(1, 'days'), moment()],
                   'Today': [moment(), moment()],
                   'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                   'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                   'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                   'This Month': [moment().startOf('month'), moment().endOf('month')],
                   'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            var command=this;
            $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
              var startDate= moment(picker.startDate);
              var endDate= moment(picker.endDate);
              if(picker.chosenLabel=="Last 24H"){
                startDate= moment().subtract(1, 'days');
                endDate= moment();
              }
              var from=startDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
              var to=endDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
              var format="HH:mm";
              if((endDate-startDate)>(86400000+30000)){
                format="DD-MM-YYYY HH:mm"
              }
              command.findAmbientData(from, to,format);
            });

            cb(start, end);
    }
    this.findAmbientData=function(from, to,format){

        if(format == null){
           format = "HH:mm";
        }
        var params="";
        if(from!=null){
            params+=""+encodeURIComponent(from)+"/";
        }
        if(to!=null){
            params+=""+encodeURIComponent(to)+"";
        }
        var command=this;
        $.getJSON( "../select/"+params, function( data ) {
          var labels = [];
          var temperatures = [];
          var humidity = [];
          $.each( data, function( key, val ) {
           var label=moment(val.time).format(format);
            labels.push(label);
            temperatures.push(val.temperature!=null?val.temperature:0);
            humidity.push(val.humidity!=null?val.humidity:0);
          });
          command.plotAreaChart(labels,temperatures,humidity)
        });
    }


    this.plotAreaChart=function(labels,temperatures,humidity){
        lineChart.data.labels=labels;
        lineChart.data.datasets[0].data=temperatures;
        lineChart.data.datasets[1].data=humidity;
        lineChart.update();
    }


    this.plotBarChart=function(ambientData){
        var tempChart = $("#temperatureChart");
        this.tempChart = new Chart(tempChart, {
            type: 'doughnut',
            data: {
                labels: ["Temperature",""],
                datasets: [{
                    label: " ",
                    backgroundColor: ['#dc3545','#DCDCDC'],
                    borderColor: ['#dc3545', '#DCDCDC'],
                    data: [ambientData[0],(60-ambientData[0])]

              }]
          },
          options: {
            rotation:-1*Math.PI,
            circumference:Math.PI,
            tooltips: {
                callbacks: {
                    title: function() {
                        return '';
                    },
                    label: function(tooltipItem, data) {
                        return " "+data.datasets[tooltipItem.datasetIndex].data[0]+" °C";
                    },
                     labelColor: function(tooltipItem, chart) {
                         return {
                             borderColor: '#dc3545',
                             backgroundColor: '#dc3545'
                         }
                     }
                }
            },
             /*   scales: {
                    xAxes: [{
                        time: {
                            unit: 'month'
                        },
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6
                        }
              }],
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 100,
                            maxTicksLimit: 5
                        },
                        gridLines: {
                            display: true
                        }
              }],
                },*/
                legend: {
                    display: false
                }
            }
        });

         var humChart = $("#humidityChart");
         this.humChart = new Chart(humChart, {
                    type: 'doughnut',
                    data: {
                        labels: ["Humidity"],
                        datasets: [{
                            label: " ",
                            backgroundColor: ['#007bff','#DCDCDC'],
                            borderColor: ['#007bff','#DCDCDC'],
                            data: [ambientData[1],(100-ambientData[1])]
                    }],
                    },
                    options: {
                       tooltips: {
                        hoverBackgroundColor:'#007bff',
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return " "+ data.datasets[tooltipItem.datasetIndex].data[0]+"%";
                            },
                            labelColor: function(tooltipItem, chart) {
                                return {
                                    borderColor: '#007bff',
                                    backgroundColor: '#007bff'
                                }
                            }
                        }
                    },
                    rotation:-1*Math.PI,
                    circumference:Math.PI,
                     /*   scales: {
                            xAxes: [{
                                time: {
                                    unit: 'month'
                                },
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    maxTicksLimit: 6
                                }
                      }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    max: 100,
                                    maxTicksLimit: 5
                                },
                                gridLines: {
                                    display: true
                                }
                      }],
                        },*/
                        legend: {
                            display: false
                        }
                    }
                });
    }

    this.openStreammingCam=function(){
        $("#maincontent").fadeOut();
        $("#camsnapcontent").find(".card-img-top").attr("src",this.camSnapUrl)
        $("#camsnapcontent").fadeIn();
    }

    this.alarmFullscreen=function(){
        $("#maincontent").fadeOut();
        $("#camsnapcontent").find(".card-img-top").attr("src","/photo/0/9/alarm.jpg")
        $("#camsnapcontent").fadeIn();
    }

    this.closeStreammingCam=function(){
        $("#camsnapcontent").fadeOut();
        $("#camsnapcontent").find(".card-img-top").attr("src","/images/imagenotfound.png")
        $("#maincontent").fadeIn();
    }
}

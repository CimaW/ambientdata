function Cam42(){
    this.lineChart=null;
    this.barChart=null;
    this.init=function(){
        // Chart.js scripts
        // -- Set new default font family and font color to mimic Bootstrap's default styling
        Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
        Chart.defaults.global.defaultFontColor = '#292b2c';

        var ctx = document.getElementById("myAreaChart");
            this.lineChart = new Chart(ctx, {
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
        this.lineChart.data.labels=labels;
        this.lineChart.data.datasets[0].data=temperatures;
        this.lineChart.data.datasets[1].data=humidity;
        this.lineChart.update();
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

            var hoursChart = $("#hoursChart");
            this.hoursChart = new Chart(hoursChart, {
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
                                      suggestedMax: 100,
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
    }

    this.webSocketServer=null;
    this.webSocketId=null;
    this.webSocketURL="ws://ambientdata.herokuapp.com/";
    this.currentAmbient={temp:-1,hum:-1};
    this.openWebSocket=function(){
      try {
          var control=this;
          this.webSocketServer = new WebSocket(this.webSocketURL);
          this.webSocketServer.onclose = function (closeEvent) {
            control.webSocketServer = new WebSocket(control.webSocketURL);
          }
          this.webSocketServer.onerror = function (errorEvent) {
              console.log("WebSocket ERROR: " + JSON.stringify(errorEvent, null, 4));
          }
          this.webSocketServer.onmessage = function (messageEvent) {
              var wsMsg = messageEvent.data;
              let ambient=JSON.parse(wsMsg);
              control.webSocketId=ambient.id;
              if(ambient.data.temp < 100 && (ambient.data.temp != control.currentAmbient.temp || ambient.data.hum != control.currentAmbient.hum)){
	              control.tempChart.data.datasets[0].data[0] = ambient.data.temp;
            		control.humChart.data.datasets[0].data[0] = ambient.data.hum;
            		control.tempChart.data.datasets[0].data[1] = 60-ambient.data.temp;
            		control.humChart.data.datasets[0].data[1] = 100-ambient.data.hum;
            		control.tempChart.update();
            		control.humChart.update();
                control.currentAmbient.temp = ambient.data.temp;
                control.currentAmbient.hum = ambient.data.hum;
                $("#ambientHum").html(ambient.data.hum+"%");
                $("#ambientTemp").html(ambient.data.temp+"°C");
              }

              if(ambient.data.temp<100){
                let time=moment(ambient.data.timestamp).format("HH:mm:ss");
                control.hoursChart.data.labels.push(time);
                control.hoursChart.data.datasets[0].data.push(ambient.data.temp);
                control.hoursChart.data.datasets[1].data.push(ambient.data.hum);
                if(control.hoursChart.data.labels.length>60){
                  control.hoursChart.data.labels = control.hoursChart.data.labels.slice(1);
                  control.hoursChart.data.datasets[0].data=control.hoursChart.data.datasets[0].data.slice(1);
                  control.hoursChart.data.datasets[1].data=control.hoursChart.data.datasets[1].data.slice(1);
                }
                control.hoursChart.update();
              }

	            let lastUpdate= moment(ambient.data.timestamp).format("YYYY-MM-DD HH:mm:ss");
              $("#realTimeId").html(lastUpdate);
          }
      } catch (exception) {
          console.error(exception);
      }
    }

    this.updateRealTimeChart=function(){
      this.webSocketServer.send('{"id":"'+this.webSocketId+'"}') ;
    }
  
}

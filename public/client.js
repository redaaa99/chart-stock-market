$(function() {
var socket = io();

$.get('/stocks', function(stocks) {
  console.log("Called get");
  if(stocks || stocks.length>9){
    renderQuotes(stocks);
    drawChart(stocks);
  }
});

socket.on('error', function(error){
    humane.log(error, {addnCls: 'humane-libnotify-error'});
});

socket.on('chat message', function(stocks){
  if(stocks || stocks.length>9){
    renderQuotes(stocks);
    drawChart(stocks);
  }
});
socket.on('remove message', function(stocks){
    if(stocks || stocks.length>9){
      renderQuotes(stocks);
      drawChart(stocks);
    }
});


$('#submit').on('click',function(event) {
  event.preventDefault();
  var entry = $('input').val().trim().toUpperCase();
  $('input').val("");
  if(!entry){
    alert("please enter a quote symbol");
    return;
  }
  socket.emit('chat message',entry);
});

$(document).on('click', '.close', function(event) {
      event.preventDefault();
      var index = parseInt(this.id);
      socket.emit('remove message',index);
});


function renderQuotes(stocks){
  $("#stocks").empty();
  for(var i = 0; i < stocks.length; i++) {
    var test  = "<div id=\"popup1\" class=\"overlay\"><div class=\"popup\"><h2>"+stocks[i]+"</h2><a class=\"close\" id="+i.toString()+" href=\"#\">&times;</a><div class=\"content\" id=\"info-"+i+"\" >Loading...</div></div></div>";

      $('#stocks').append(test);
       //$('#stocks').append('<li><div class="info"><span class="title">'+stocks[i]+'</span><span class="close" id="'+i.toString()+'"><i class="fa fa-times" aria-hidden="true"></i></span><div class="content">Thank to pop me out of that button, but now im done so you can close this window.</div></div></li>');
  }
}

function drawChart(names)
{
  var seriesOptions = [],
    seriesCounter = 0;

function createChart() {

    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });
}

$.each(names,function(i, name){
    $.ajax({
      url: 'https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&start_date=2012-05-18&end_date=2017-08-23&api_key=TtcofE5o1LspPik3aRR6',
      dataType: 'json',
      success: function (response) {
          var arr=[];
          //console.log(response);
          $("#info-"+i).text(response.dataset.name);
          arr = response.dataset.data.reverse();
          arr.map(function(element){
            element[0] = new Date(element[0]).getTime();
          });

          //console.log(arr);
          
          seriesOptions[i] = {
              name: name,
              data: arr
          };
          seriesCounter += 1;

          if (seriesCounter === names.length) {
              createChart();
          }
      },
      error: function(error) {    
        humane.log(error.responseJSON.quandl_error.message, {addnCls: 'humane-libnotify-error'});
        $('.overlay').slice(i, i+1).remove();
         socket.emit('remove message',i);        
      }
    });
  });
}

});


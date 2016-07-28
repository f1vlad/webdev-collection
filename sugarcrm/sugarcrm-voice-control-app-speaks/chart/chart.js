$(function() {
    var type = 'funnel';

    var file = window.uQuery('file', /[a-z0-9_]+/i) || monster.get(type + 'file'),
        $file = $('#chartData');
    if (file) {
      $file.val([file]);
    }
    file = $file.val();
    monster.set(type + 'file', file);

    var color = window.uQuery('color', /[a-z0-9_]+/i) || monster.get(type + 'color'),
        $color = $('input[type="radio"][name="color"]'),
        colorLength = 0;
    if (color) {
      $color.val([color]);
    }
    color = $color.filter(':checked').val() || 'default';
    monster.set(type + 'color', color);

    var direction = window.uQuery('direction', /rtl|ltr/i) || monster.get(type + 'direction'),
        $direction = $('input[type="radio"][name="direction"]');
    if (direction) {
      $direction.val([direction]);
    }
    direction = $direction.filter(':checked').val() || 'ltr';
    monster.set(type + 'direction', direction);
    $('html').css('direction', direction);

    var locale = window.uQuery('locale', /[a-z0-9_]+/i) || monster.get(type + 'locale'),
        $locale = $('#locale');
    if (locale) {
      $locale.val([locale]);
    }
    locale = $locale.val();
    monster.set(type + 'locale', locale);

    var wrapLabels = window.uQuery('wrap_labels', /[a-z0-9_]+/i) || monster.get(type + 'wrap_labels'),
        $wrapLabels = $('#wrapLabels');
    if (wrapLabels) {
      $wrapLabels.val([wrapLabels]);
    }
    wrapLabels = !!parseInt($wrapLabels.val(), 10) ? true : false;
    monster.set(type + 'wrap_labels', wrapLabels ? 1 : 0);


    var chartData = [];
    var xIsDatetime = false;
    var yIsCurrency = false;

    var locales = {
      en_US: null,
      ru_RU: {
        'decimal': ',',
        'thousands': '\xa0',
        'grouping': [3],
        'currency': ['\u20BD', ''],
        'dateTime': '%-d %B %Y \u0433., %X GMT%Z', //%c
        'date': '%-d %b %Y \u0433.', //%x
        'time': '%-H:%M:%S', //%X
        'periods': ['AM', 'PM'],
        'days': ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        'shortDays': ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        'months': ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        'shortMonths': ['янв.', 'февр.', 'марта', 'апр.', 'мая', 'июня', 'июля', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
        // Custom patterns
        'full': '%A, %c',
        'long': '%c',
        'medium': '%x, %X',
        'short': '%d.%m.%y, %-H:%M',
        'yMMMEd': '%a, %x',
        'yMEd': '%a, %-d.%m.%Y \u0433.',
        'yMMMMd': '%-d %B %Y \u0433.',
        'yMMMd': '%x',
        'yMd': '%d.%m.%Y',
        'yMMMM': '%B %Y \u0433.',
        'yMMM': '%b %Y \u0433.',
        'MMMd': '%-d %b',
        'MMMM': '%B',
        'MMM': '%b',
        'y': '%Y'
      }
    };

    var funnel_example = {
        "properties": {
          "title": "Pipeline total is $675k",
          "units": "$",
          "yDataType": "currency"
        },
        "data": [
          {
            "key": "Review",
            "count": 1,
            "values": [
              {"x": 0, "y": 2005}
            ]
          },
          {
            "key": "Perception Analysis",
            "count": 3,
            "values": [
              {"x": 0, "y": 13160}
            ]
          },
          {
            "key": "Id. Decision Makers",
            "count": 1,
            "values": [
              {"x": 0, "y": 1307}
            ]
          },
          {
            "key": "Value Proposition",
            "count": 2,
            "values": [
              {"x": 0, "y": 4092}
            ]
          },
          {
            "key": "Misc",
            "count": 3,
            "values": [
              {"x": 0, "y": 3092}
            ]
          },
          {
            "key": "Needs Analysis",
            "count": 1,
            "values": [
              {"x": 0, "y": 2812}
            ]
          }
        ]
      };

    var xValueFormat = function(d, labels, isDate) {
            var val = isNaN(parseInt(d, 10)) || !labels || !Array.isArray(labels) ?
              d : labels[parseInt(d, 10)] || d;
            return isDate ? nv.utils.dateFormat(val, 'yMMMM', chart.locality()) : val;
          };
    var yValueFormat = function(d, isCurrency) {
            return nv.utils.numberFormatSI(d, 2, isCurrency, chart.locality());
          };

    var chart = nv.models.funnelChart()
          .showTitle(true)
          .showLegend(true)
          .tooltips(true)
          .direction(direction)
          .delay(500)
          .wrapLabels(wrapLabels)
          .fmtValue(function(d) {
            if (isNaN(parseFloat(d))) {
              return d;
            }
            return d > 100000 ?
              nv.utils.numberFormatSI(d, 2, yIsCurrency, chart.locality()) :
              nv.utils.numberFormatRound(d, 0, yIsCurrency, chart.locality());;
          })
          .fmtCount(function(d) {
            return d ? ' (' + nv.utils.numberFormatSI(d, 2, false, chart.locality()) + ')' : '';
          })
          .tooltipContent(function(key, x, y, e, graph) {
            var val = nv.utils.numberFormatRound(parseInt(y, 10), 2, yIsCurrency, chart.locality());
            return '<p>Stage: <b>' + key + '</b></p>' +
                   '<p>Amount: <b>' + val + '</b></p>' +
                   '<p>Percent: <b>' + x + '%</b></p>';
          })
          .seriesClick(function(data, eo) {
            chart.dataSeriesActivate(eo);
          })
          .locality(locales[locale]);

    chart.legend.width();
    chart.funnel.textureFill(false);

    d3.select('#chart1')
        .on('click', chart.dispatch.chartClick);

    $('#chart1').resizable({
      maxHeight: 600,
      minHeight: 200,
      minWidth: 200
    });

    $(document).on('resize', '#chart1', function(){
      chart.update();
    });

/*
    $('#chart1').on('resize', function(d) {
      chart.update();
    });
*/
    function loadData(file) {

      var data = funnel_example;

        chartData = data.data ? data : translateDataToD3(data, 'funnelChart');

        colorLength = chartData.data.length;
        xIsDatetime = chartData.properties.xDataType === 'datetime' || false;
        yIsCurrency = chartData.properties.yDataType === 'currency' || false;

        chart
          .colorData(color, {c1: '#e8e2ca', c2: '#3e6c0a', l: colorLength});

        d3.select('#chart1 svg')
            .datum(chartData)
            .call(chart);

        nv.utils.windowResize(chart.update);


    }

    loadData(file);

    $file.on('change', function(d) {
      file = $file.val();
      monster.set(type + 'file', file);
      loadData(file);
    });
    $color.on('click', function(d) {
      color = $color.filter(':checked').val();
      monster.set(type + 'color', color);
      chart
        .colorData(color, {c1: '#e8e2ca', c2: '#3e6c0a', l: colorLength});
      chart.update();
    });
    $direction.on('change', function(d) {
      direction = $direction.filter(':checked').val();
      monster.set(type + 'direction', direction);
      $('html').css('direction', direction);
      chart
        .direction(direction);
      chart.update();
    });
    $locale.on('change', function(d) {
      locale = $locale.val();
      monster.set(type + 'locale', locale);
      chart
        .locality(locales[locale]);
      chart.update();
    });
    $wrapLabels.on('change', function(d) {
      wrapLabels = !!parseInt($wrapLabels.val(), 10) ? true : false;
      monster.set(type + 'wrap_labels', wrapLabels ? 1 : 0);
      chart
        .wrapLabels(wrapLabels);
      chart.update();
    });

});

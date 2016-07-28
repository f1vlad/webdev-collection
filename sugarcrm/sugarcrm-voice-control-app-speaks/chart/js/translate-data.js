
function getChartConfig(chartType) {
    var chartConfig;

    switch (chartType) {
        case 'pie chart':
            chartConfig = {
                chartType: 'pie chart'
            };
            break;

        case 'line chart':
            chartConfig = {
                chartType: 'line chart'
            };
            break;

        case 'funnel chart 3D':
            chartConfig = {
                chartType: 'funnel chart'
            };
            break;

        case 'gauge chart':
            chartConfig = {
                chartType: 'gauge chart'
            };
            break;

        case 'stacked group by chart':
            chartConfig = {
                orientation: 'vertical',
                barType: 'stacked',
                chartType: 'group by chart'
            };
            break;

        case 'group by chart':
            chartConfig = {
                orientation: 'vertical',
                barType: 'grouped',
                chartType: 'group by chart'
            };
            break;

        case 'bar chart':
            chartConfig = {
                orientation: 'vertical',
                barType: 'basic',
                chartType: 'bar chart'
            };
            break;

        case 'horizontal group by chart':
            chartConfig = {
                orientation: 'horizontal',
                barType: 'stacked',
                chartType: 'horizontal group by chart'
            };
            break;

        case 'horizontal bar chart':
        case 'horizontal':
            chartConfig = {
                orientation: 'horizontal',
                barType: 'basic',
                chartType: 'horizontal bar chart'
            };
            break;

        default:
            chartConfig = {
                orientation: 'vertical',
                barType: 'stacked',
                chartType: 'bar chart'
            };
            break;
    }

    return chartConfig;
}

function translateDataToD3(json, chartType, barType) {
    var data = [],
        value = 0,
        strUndefined = 'undefined';

    function sumValues(values) {
        return values.reduce(function(a, b) { return parseFloat(a) + parseFloat(b); }, 0); // 0 is default value if reducing an empty list
    }

    function pickLabel(label) {
        var l = [].concat(label)[0];
        //d.label && d.label !== '' ? Array.isArray(d.label) ? d.label[0] : d.label : strUndefined
        return l ? l : strUndefined;
    }

    if (json.values.filter(function(d) { return d.values && d.values.length; }).length) {

        switch (chartType) {

            case 'barChart':
                var discreteValues = d3.max(json.values, function(d) {
                      return d.values.length;
                    }) === 1;

                data =
                    barType === 'stacked' || barType === 'grouped' ?
                        discreteValues ?
                            [{
                              'key': 'Leads',
                              'type': 'bar',
                              'values': json.values.map(function(d, i) {
                                            return {
                                              'x': i + 1,
                                              'y': sumValues(d.values)
                                            };
                                        })
                            }] :
                            json.label.map(function(d, i) {
                                return {
                                    'key': pickLabel(d),
                                    'type': 'bar',
                                    'values': json.values.map(function(e, j) {
                                            return {
                                              'x': j + 1,
                                              'y': parseFloat(e.values[i]) || 0
                                            };
                                        })
                                };
                            }) :
                        json.values.map(function(d, i) {
                            return {
                                'key': d.values.length > 1 ? d.label : pickLabel(d.label),
                                'type': 'bar',
                                'values': json.values.map(function(e, j) {
                                        return {
                                          'x': j + 1,
                                          'y': i === j ? sumValues(e.values) : 0
                                        };
                                    })
                            };
                        });
                break;

            case 'pieChart':
                data = json.values.map(function(d, i) {
                    var data = {
                        'key': pickLabel(d.label),
                        'values': [{
                            'x': i + 1,
                            'y': sumValues(d.values)
                        }]
                    };
                    if (d.color !== undefined) {
                        data.color = d.color;
                    }
                    if (d.classes !== undefined) {
                        data.classes = d.classes;
                    }
                    return data;
                });
                break;

            case 'funnelChart':
                data = json.values.reverse().map(function(d, i) {
                    var sliceSum = sumValues(d.values);
                    return {
                        'key': pickLabel(d.label),
                        'values': [{
                          'label': sliceSum.toString(),
                          'x': 0,
                          'y': sliceSum
                        }]
                    };
                });
                break;

            case 'lineChart':
                var discreteValues = d3.max(json.values, function(d) {
                          return d.values.length;
                        }) === 1;

                data = json.values.map(function(d, i) {
                    return {
                        'key': pickLabel(d.label),
                        'values': discreteValues ?
                            d.values.map(function(e, j) {
                                return [i, parseFloat(e)];
                            }) :
                            d.values.map(function(e, j) {
                                return [j, parseFloat(e)];
                            })
                    };
                });
                break;

            case 'gaugeChart':
                value = json.values.shift().gvalue;
                var y0 = 0;

                data = json.values.map(function(d, i) {
                    var values = {
                        'key': pickLabel(d.label),
                        'y': parseFloat(d.values[0]) + y0
                    };
                    y0 += parseFloat(d.values[0]);
                    return values;
                });
                break;
        }
    }

    return {
        'properties': {
            'title': json.properties[0].title,
            'yDataType': json.properties[0].yDataType,
            'xDataType': json.properties[0].xDataType,
            // bar group data (x-axis)
            'groups':
            chartType === 'gaugeChart' ?
                [{'group' : 1, 'total': value}] :
            chartType === 'lineChart' && json.label ?
                json.label.map(function(d, i) {
                    return {
                        'label': pickLabel(d)
                    };
                }) :
                json.values.filter(function(d) { return d.values.length; }).length ?
                    json.values.map(function(d, i) {
                        return {
                            'label': pickLabel(d.label)
                        };
                    }) :
                    []
        },
        // series data
        'data': data
    };
}

// code credit: Rich Donohue and Carl Sack for Time Series Proportional Symbol Maps with Leaflet and JQuery
// http://geography.wisc.edu/cartography/tutorials/
$(document).ready(function(){
  var buildings;
  var fillColor = '#BF0D00';
  var strokeColor = '#FFFFFF';
  var scaleFactor = 3;
  var map = L.map('map', {
      center : [40.781256,-73.978179],
      zoom : 15,
      maxZoom : 17
    });

  L.tileLayer(
    'http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png', {
      attribution: 'Acetate tileset from GeoIQ'
  }).addTo(map);  

    $.getJSON("data/units_rent_stabl.geojson")
        .done(function(data) {
          // console.log('data: ', data);
          var info = processData(data);
          createPropSymbols(info.timestamps, data);
          createLegend(info.min,info.max);
          createSliderUI(info.timestamps);
        })
        .fail(function() { alert("There has been a problem loading the data.")});
  
  function processData(data) {
    // console.log("the data is: ", data);
    var timestamps = [];
    var min = Infinity;
    var max = -Infinity;

    for (var feature in data.features) {
      var properties = data.features[feature].properties;

      for (var attribute in properties) {
        if ( attribute != 'id' &&           
           attribute != 'lat' &&
           attribute != 'lng' &&
           attribute != 'house_no' &&
           attribute != 'street' &&
           attribute != 'code' && 
           attribute != 'notes' &&
           attribute != 'note_author' &&
           attribute != 'date' &&
           attribute != 'bbl' && 
           attribute != 'geom' )
        {
          if ( $.inArray(attribute,timestamps) ===  -1) {
            timestamps.push(attribute);
          }
          if (properties[attribute] < min) {
            min = properties[attribute];
          }
          if (properties[attribute] > max) {
            max = properties[attribute];
          }
        }
      }
    }
    return {
      timestamps : timestamps,
      min : min,
      max : max
    }
  }  // end processData()

  function createPropSymbols(timestamps, data) {
    buildings = L.geoJson(data, {

      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            fillColor: fillColor,
            color: strokeColor,
            weight: 1,
            fillOpacity: 0.6
        }).on({
          mouseover: function(e) {
            this.openPopup();
            this.setStyle({color: 'yellow'});
          },
          mouseout: function(e) {
            this.closePopup();
            this.setStyle({color: strokeColor});
          }
        });
      }
    }).addTo(map);
    updatePropSymbols(timestamps[0]);
  } // end createPropSymbols()

  function updatePropSymbols(timestamp) {
    buildings.eachLayer(function(layer) {
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[timestamp]);
      var popupContent = "<b>" + String(props[timestamp]) + " Rent Stabilized Units</b><br>" +
                 "<i>" + props.house_no + ' ' + props.street +
                 "</i> in </i>" + timestamp + "</i>";
      layer.setRadius(radius);
      layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
    });
  } // end updatePropSymbols

  function calcPropRadius(attributeValue) {
    var area = attributeValue * scaleFactor;
    return Math.sqrt(area/Math.PI);
  } // end calcPropRadius

  function createLegend(min, max) {
    if (min < 10) {
      min = 10;
    }
 
    function roundNumber(inNumber) {
          return (Math.round(inNumber/10) * 10);
    }

    var legend = L.control( { position: 'bottomright' } );
    legend.onAdd = function(map) {
      var legendContainer = L.DomUtil.create("div", "legend");
      var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
      // var classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)];
      var classes = [roundNumber(min), 200, roundNumber(max)];
      var legendCircle;
      var lastRadius = 0;
      var  currentRadius;
      var  margin;
      L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
        L.DomEvent.stopPropagation(e);
      });

      $(legendContainer).append("<h2 id='legendTitle'>Number Rent <br> Stabilized Units</h2>");

      for (var i = 0; i <= classes.length-1; i++) {
        legendCircle = L.DomUtil.create("div", "legendCircle");
        currentRadius = calcPropRadius(classes[i]);
        margin = -currentRadius - lastRadius - 2;
        
        $(legendCircle).attr("style", "width: " + currentRadius*2 +
          "px; height: " + currentRadius*2 +
          "px; margin-left: " + margin + "px" );
        
        if (i===0) {
          $(legendCircle).append("<span class='legendValue' style='bottom: 10px;'>"+classes[0]+"<span>");            
        } else if (i===1) {
          $(legendCircle).append("<span class='legendValue' style='bottom: 25px;'>"+classes[1]+"<span>");            
        } else {
          $(legendCircle).append("<span class='legendValue'>"+classes[i]+"<span>");            
        }        

        $(symbolsContainer).append(legendCircle);
        lastRadius = currentRadius;
      }         

      $(legendContainer).append(symbolsContainer);
      return legendContainer;
    };

    legend.addTo(map);
  } // end createLegend()

  function createSliderUI(timestamps) {
    var sliderControl = L.control({ position: 'bottomleft'} );
    sliderControl.onAdd = function(map) {
      var slider = L.DomUtil.create("input", "range-slider");
      L.DomEvent.addListener(slider, 'mousedown', function(e) {
        L.DomEvent.stopPropagation(e);
      });

      $(slider)
        .attr({'type':'range', 'max': timestamps[timestamps.length-1], 'min':timestamps[0], 'step': 1,'value': String(timestamps[0])})
            .on('input change', function() {
              updatePropSymbols($(this).val().toString());
                $(".temporal-legend").text(this.value);
            });
      return slider;
    }

    sliderControl.addTo(map);
    createTemporalLegend(timestamps[0]);
  } // end createSliderUI()

  function createTemporalLegend(startTimestamp) {
    var temporalLegend = L.control({ position: 'bottomleft' });
    temporalLegend.onAdd = function(map) {
      var output = L.DomUtil.create("output", "temporal-legend");
      return output;
    }
    temporalLegend.addTo(map);
    $(".temporal-legend").text(startTimestamp);
  } // end createTemporalLegend()
});
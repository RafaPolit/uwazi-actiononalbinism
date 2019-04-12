/* eslint-disable */
// Replace with final URL once deployed
var domain = 'http://localhost:3000';
var language = 'en';

var $ = document.querySelector.bind(document);

var reportData = {};
var map;

var request = new XMLHttpRequest();

request.open('GET', domain + '/api/search?limit=50&order=desc&sort=metadata.date&types=%5B%225b44d2a211fe4f676f76467e%22%5D');

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(this.response);
    data.rows.forEach(function(row) {
      reportData[row.sharedId] = row.metadata;
    });

    var regions = document.querySelectorAll('.implementation-coutries-list ul');

    regions.forEach(function(region) {
      var regionCountries = region.querySelectorAll('li');
      regionCountries.forEach(function(country) {
        if (!country.className.includes('hidden')) {
          // var implementationValue = reportData[country.dataset.mongoId].a__prevention;
          var implementationValue = reportData[country.dataset.mongoId].d_2_6_national_assessment_of_locally_produced_sunscreen;
          var color = getValueColor(implementationValue);
          country.querySelector('span.value').innerHTML = implementationValue + '%';
          country.querySelector('span.value').style.backgroundColor = 'rgba(' + color.join(',') + ',0.3)';

          var mapCountry = map.querySelector('#' + country.dataset.country);
          country.addEventListener('mouseover', function() { highlightCountry(mapCountry); });
          country.addEventListener('mouseout', function() { unHighlightCountry(mapCountry); });

          mapCountry.style.fill = 'rgb(' + color.join(',') + ')';
          mapCountry.dataset.value = implementationValue;
          mapCountry.addEventListener('mouseover', processLabel);
          mapCountry.addEventListener('mouseout', hideLabel);
        }
      });
    });
  } else {
    console.log('Error loading data!');
  }
};


var getValueColor = function(percent) {
  var R = percent <= 50 ? 255 : Math.round(255 - ((percent - 50)*5.1));
  var G = percent >= 50 ? 255 : Math.round(percent*5.1);
  var B = 0;
  return [R, G, B];
};

var count = 0;

var highlightCountry = function(mapCountry) {
  mapCountry.className.baseVal = 'active';
  processLabel(null, mapCountry);
};

var unHighlightCountry = function(mapCountry) {
  mapCountry.className.baseVal = '';
  hideLabel();
};

var processLabel = function(e, mapCountry) {
  var srcElement = e ? e.srcElement : mapCountry;

  map.querySelector('#svg-text-country').textContent = srcElement.dataset.name;
  map.querySelector('#svg-text-circle').style.fill = 'rgb(' + getValueColor(srcElement.dataset.value).join(',') + ')';
  map.querySelector('#svg-text-value').textContent = srcElement.dataset.value + '%';
  map.querySelector('#map-data-label').style.display = 'inline';
};

var hideLabel = function() {
  map.querySelector('#map-data-label').style.display = 'none';
};

function waitForMapToDisplay(time) {
  if (document.getElementById('svg-map')) {
    var svgObject = document.getElementById('svg-map');
    var svgMap = svgObject.contentDocument;
    if(svgMap && svgMap.querySelector('#africa-map-svg')) {
      map = svgMap;
      request.send();
      return;
    }
    else {
      setTimeout(function() {
          waitForMapToDisplay(time);
      }, time);
    }
  }
  else {
    setTimeout(function() {
        waitForMapToDisplay(time);
    }, time);
  }
}

waitForMapToDisplay(50);

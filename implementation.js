/* eslint-disable */
// Replace with final URL once deployed
var domain = 'http://localhost:3000';
var language = 'en';

var $ = document.querySelector.bind(document);

var reportData = {};
var map;
var selector;
var regions;

var request = new XMLHttpRequest();

request.open('GET', domain + '/api/search?limit=50&order=desc&sort=metadata.date&types=%5B%225b44d2a211fe4f676f76467e%22%5D');

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(this.response);
    data.rows.forEach(function(row) {
      reportData[row.sharedId] = row.metadata;
    });

    regions = document.querySelectorAll('.implementation-coutries-list ul');

    assignButtonEvents();
    changeType(true);
  } else {
    console.log('Error loading data!');
  }
};

var assignButtonEvents = function() {
  $('.options-first-level').querySelectorAll('li').forEach(function(firstLevelOption) {
    var property = firstLevelOption.querySelector('button').dataset.property;

    $('#options-for-' + property).querySelectorAll('li').forEach(function(secondLevelOption) {
      secondLevelOption.querySelector('button').addEventListener('click', function() {
        clearSecondLevelActive(property);
        secondLevelOption.className = "active";
        changeType();
      });
    });

    firstLevelOption.querySelector('button').addEventListener('click', function(e) {
      clearFirstLevelActive();
      firstLevelOption.className = "active";

      hideAllSecondLevel();
      showSecondLevel(e.srcElement.dataset.property);
      changeType();
    });
  });

};

var clearFirstLevelActive = function() {
  $('.options-first-level').querySelectorAll('li').forEach(function(firstLevelOption) {
    firstLevelOption.className = "";
  });
};

var clearSecondLevelActive = function(property) {
  $('#options-for-' + property).querySelectorAll('li').forEach(function(firstLevelOption) {
    firstLevelOption.className = "";
  });
};

var hideAllSecondLevel = function() {
  document.querySelectorAll('.options-second-level').forEach(function(secondLevelBlock) {
    secondLevelBlock.className = "options-second-level hidden";
  });
};

var showSecondLevel = function(property) {
  $('#options-for-' + property).className = "options-second-level";
};

var changeType = function(assignEvents) {
  var property = $('.options-second-level:not(.hidden) li.active button').dataset.property;

  regions.forEach(function(region) {
    var regionCountries = region.querySelectorAll('li');
    regionCountries.forEach(function(country) {
      if (!country.className.includes('hidden')) {

        var implementationValue = reportData[country.dataset.mongoId][property];
        var color = getValueColor(implementationValue);
        country.querySelector('span.value').innerHTML = implementationValue + '%';
        country.querySelector('span.value').style.backgroundColor = 'rgba(' + color.join(',') + ',1)';

        var mapCountry = map.querySelector('#' + country.dataset.country);

        mapCountry.style.fill = 'rgb(' + color.join(',') + ')';
        mapCountry.dataset.value = implementationValue;

        if(assignEvents) {
          country.addEventListener('mouseover', function() { highlightCountry(mapCountry); });
          country.addEventListener('mouseout', function() { unHighlightCountry(mapCountry); });
          mapCountry.addEventListener('mouseover', function(e) { hoverMapCountry(e, country); });
          mapCountry.addEventListener('mouseout', function() { hoverOutMapCountry(country); });
        }
      }
    });
  });
}

var maxLuminosity = 230;
var desaturate = 127;

var lumMultiplier = (maxLuminosity - desaturate) / 50;

var getValueColor = function(percent) {
  var reversedPercent = 100 - percent
  var R = percent <= 50 ? maxLuminosity : Math.round(reversedPercent*lumMultiplier + desaturate);
  var G = percent >= 50 ? maxLuminosity : Math.round(percent*lumMultiplier + desaturate);
  var B = desaturate;
  return [R, G, B];
};

var count = 0;

var hoverMapCountry = function(e, countryLi) {
  processLabel(e);
  countryLi.className = 'active';
};

var hoverOutMapCountry = function(countryLi) {
  hideLabel();
  countryLi.className = '';
};

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

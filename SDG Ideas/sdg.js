/* eslint-disable */
var toggleGroupTable = function(group) {
  var table = group.querySelector('table.sdg-table');
  table.className = table.className.includes(' hidden') ? table.className.replace(' hidden', '') : table.className + ' hidden';
};

var assignGroupClicks = function(groups) {
  groups.forEach(function (group) {
    var groupButton = group.querySelector('button.sdg');
    groupButton.addEventListener('click', function() { toggleGroupTable(group); });
  });
}

var waitForHTML = function(time) {
  if (document.getElementById('sdg-groups')) {
    var groupsElement = document.getElementById('sdg-groups');
    var groups = groupsElement.querySelectorAll('.sdg-group');
    assignGroupClicks(groups);
  }
  else {
    setTimeout(function() {
        waitForHTML(time);
    }, time);
  }
};

waitForHTML(50);

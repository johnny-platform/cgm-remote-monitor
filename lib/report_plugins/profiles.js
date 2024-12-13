'use strict';

var profiles = {
  name: 'profiles'
  , label: 'Profiles'
  , pluginType: 'report'
};

function init () {
  return profiles;
}

module.exports = init;

profiles.html = function html (client) {
  var translate = client.translate;
  var ret =
    '<h2>' + translate('Profiles') + '</h2>' +
    '<br>' + translate('Database records') + '&nbsp' +
    '<br><select id="profiles-databaserecords"></select>' +
    '<br><span id="profiles-default"></span>' +
    '<div id="profiles-chart">' +
    '</div>';
  return ret;
};

profiles.css =
  '#profiles-chart {' +
  '  width: 100%;' +
  '  height: 100%;' +
  '}';

profiles.report = function report_profiles (datastorage) {
  var Nightscout = window.Nightscout;
  var client = Nightscout.client;
  var translate = client.translate;

  var profileRecords = datastorage.profiles;
  var databaseRecords = $('#profiles-databaserecords');

  databaseRecords.empty();
  for (var r = 0; r < profileRecords.length; r++) {
    databaseRecords.append('<option value="' + r + '">' + translate('Valid from:') + ' ' + new Date(profileRecords[r].startDate).toLocaleString() + '</option>');
  }
  databaseRecords.unbind().bind('change', recordChange);

  recordChange();

  function recordChange(event) {
    if ($('#profiles-databaserecords option').length < 1)
      return;
    var currentindex = databaseRecords.val();
    var currentrecord = profileRecords[currentindex];

    // Create tabs for store data, loopSettings, and loopOverrideSettings
    var tabs = $('<div id="tabs"><ul><li><a href="#tab-1">Store Data</a></li><li><a href="#tab-2">Loop Settings</a></li><li><a href="#tab-3">Override Settings</a></li></ul></div>');
    var tab1 = $('<div id="tab-1"></div>');
    var tab2 = $('<div id="tab-2"></div>').append(displayLoopSettings(currentrecord.loopSettings));
    var tab3 = $('<div id="tab-3"></div>').append(displayLoopOverrideSettings(currentrecord.loopSettings.overridePresets));

    // Render store data
    Object.keys(currentrecord.store).forEach(key => {
      tab1.append(displayRecord(currentrecord.store[key], key));
    });

    tabs.append(tab1).append(tab2).append(tab3);
    $('#profiles-chart').empty().append(tabs);
    $('#tabs').tabs({ active: 0 }); // Set the "Store Data" tab as the default

    if (event) {
      event.preventDefault();
    }
  }

  function displayRecord(record, name) {
    var td = $('<td>');
    var table = $('<table class="table-style">'); // Add the class here

    table.append($('<tr>').append($('<td>').append('<b>' + name + '</b>')));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Units') + '</b>:&nbsp' + record.units)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('DIA') + '</b>:&nbsp' + record.dia)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Timezone') + '</b>:&nbsp' + record.timezone)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Carbs activity / absorption rate') + '</b>:&nbsp' + record.carbs_hr)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Insulin to carb ratio (I:C)') + '</b>:&nbsp' + '<br>' + displayRanges(record.carbratio))));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Insulin Sensitivity Factor (ISF)') + '</b>:&nbsp' + '<br>' + displayRanges(record.sens))));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Basal rates [unit/hour]') + '</b>:&nbsp' + '<br>' + displayRanges(record.basal))));

    td.append(table);
    return td;
  }

  function displayLoopSettings(loopSettings) {
    var td = $('<td>');
    var table = $('<table class="table-style">'); // Add the class here

    table.append($('<tr>').append($('<td>').append('<b>' + translate('Maximum Bolus') + '</b>:&nbsp' + loopSettings.maximumBolus)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Maximum Basal Rate Per Hour') + '</b>:&nbsp' + loopSettings.maximumBasalRatePerHour)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Minimum BG Guard') + '</b>:&nbsp' + loopSettings.minimumBGGuard)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Dosing Strategy') + '</b>:&nbsp' + loopSettings.dosingStrategy)));
    table.append($('<tr>').append($('<td>').append(displayPreMealTargetRange(loopSettings.preMealTargetRange))));

    // Add more settings as needed

    td.append(table);
    return td;
  }

  function displayLoopOverrideSettings(overridePresets) {
    var td = $('<td>');
    var table = $('<table class="table-style">'); // Add the class here

    table.append($('<tr>').append($('<td>').append('<b>' + translate('Override Presets') + '</b>:&nbsp' + displayOverridePresets(overridePresets))));

    td.append(table);
    return td;
  }

  function displayOverridePresets(overridePresets) {
    var text = '';

    overridePresets.forEach(preset => {
      if (preset.name) {
        text += '<b>' + translate('Name') + '</b>: ' + preset.name + '<br>';
      }
      if (preset.symbol) {
        text += '<b>' + translate('Symbol') + '</b>: ' + preset.symbol + '<br>';
      }
      if (preset.targetRange) {
        text += '<b>' + translate('Target Range') + '</b>: ' + preset.targetRange.join(' - ') + '<br>';
      }
      if (preset.insulinNeedsScaleFactor !== undefined) {
        text += '<b>' + translate('Insulin Needs Scale Factor') + '</b>: ' + (preset.insulinNeedsScaleFactor * 100) + '%<br>';
      }
      if (preset.duration !== undefined) {
        text += '<b>' + translate('Duration') + '</b>: ' + preset.duration + '<br><br>';
      }
    });

    return text;
  }

  function displayPreMealTargetRange(preMealTargetRange) {
    var text = '<b>' + translate('Pre-Meal Target Range') + '</b>: ' + preMealTargetRange.join(' - ') + '<br>';
    return text;
  }

  function displayRanges(array, array2) {
    var text = '';

    if (array && array2) {
      for (let i = 0; i < array.length; i++) {
        text += array[i].time + '&nbsp:&nbsp' + array[i].value + (array2 ? ' - ' + array2[i].value : '') + '<br>';
      }
    } else {
      for (let i = 0; i < array.length; i++) {
        text += array[i].time + '&nbsp:&nbsp' + array[i].value  + '<br>';
      }
    }
    return text;
  }
}
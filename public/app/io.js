var io = (function() {

  // file handling
  function upload_graph() {
    graphFile = "data/uploads/graph.json";
    msg = '(' + message++ + ')\tNew graph uploaded!';
    update_console(msg);
    reload();
  }

  function upload_game() {
    gameFile = "data/uploads/game.json";
    msg = '(' + message++ + ')\tNew game uploaded!';
    update_console(msg);
    reload();
  }

  //------download / upload functions------
  // download as text
  function download_graph() {
    var i;

    var nodeJson = '{\n "nodes":  [\n';
    for(i = 0; i < nodes.length - 1; i++)
      nodeJson = nodeJson.concat('     {"id": ' + nodes[i].id + ', "reflexive": false},\n');
    nodeJson = nodeJson.concat('     {"id": ' + nodes[i].id + ', "reflexive": false}\n ],\n');

    var linksJson = '"links":  [\n';
    for(i = 0; i < links.length - 1; i++)
      linksJson = linksJson.concat('    {"source": ' + links[i].source.id + ', "target": ' + links[i].target.id + ', "left": false, "right": true},\n');
    linksJson = linksJson.concat('    {"source": ' + links[i].source.id + ', "target": ' + links[i].target.id + ', "left": false, "right": true}\n ]\n}');

    window.open('data:text/json;charset=utf-8,' + escape(nodeJson + linksJson));
  }

  function download_game() {
    var i;

    var stratJson = '{\n "strategies":  [\n';
    for(i = 0; i < strategies.length - 1; i++)
      stratJson = stratJson.concat('     {"id": ' + strategies[i].id + ', "color": "' + strategies[i].color + '"},\n');
    stratJson = stratJson.concat('     {"id": ' + strategies[i].id + ', "color": "' + strategies[i].color + '"}\n ],\n');

    var stratChosenJson = '"strategy_chosen":  [\n';
    for(i = 0; i < strategy_chosen.length - 1; i++)
      stratChosenJson = stratChosenJson.concat('    {"id": ' + strategy_chosen[i].id + ', "strategy": ' + ((strategy_chosen[i].strategy == null) ? 'null' : '"' + strategy_chosen[i].strategy + '"') + '},\n');
    stratChosenJson = stratChosenJson.concat('    {"id": ' + strategy_chosen[i].id + ', "strategy": ' + ((strategy_chosen[i].strategy == null) ? 'null' : '"' + strategy_chosen[i].strategy + '"') + '}\n ],\n');


    var stratAvailJson = '"strategies_available":  [\n';
    for(i = 0; i < strategies_available.length - 1; i++)
      stratAvailJson = stratAvailJson.concat('    {"id": ' + strategies_available[i].id + ', "nodes": [' + strategies_available[i].nodes + ']},\n');
    stratAvailJson = stratAvailJson.concat('    {"id": ' + strategies_available[i].id + ', "nodes": [' + strategies_available[i].nodes + ']}\n ]\n}');

    window.open('data:text/json;charset=utf-8,' + escape(stratJson + stratChosenJson + stratAvailJson));
  }

  function download_log() {
    var log = "";
    for(var i in messages) {
      log = log.concat(messages[i] + '\n');
    }
    window.open('data:text/txt;charset=utf-8,' + escape(log));
  }

  return {
    upload_game: upload_game,
    upload_graph: upload_graph,
    download_log: download_log,
    download_graph: download_graph,
    download_game: download_game
  };
}());

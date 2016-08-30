var io = (function() {

  function upload_dot() {
    game.clear_playground();
    var dot = document.getElementById('modal-dot').value;
    lines = dot.split(/\r?\n/)

    var node_list = new Array();

    for(var l = 0; l < lines.length; l++) {
        var pair = lines[l].split("->");
        if(pair[0] && pair[1]) {
          pair[0] = parseInt(pair[0]);
          pair[1] = parseInt(pair[1]);
          lines[l] = pair;
          if(!in_array(pair[0], node_list))
            node_list.push(pair[0]);
          if(!in_array(pair[1], node_list))
            node_list.push(pair[1]);
        }
        else
          lines[l] = null;
    }
    node_list.sort();
    add_dot_nodes(node_list);
    add_dot_edges(lines);
    lastNodeId = node_list[node_list.length-1];
    strategyless();

    if(num_str = parseInt(document.getElementById('dotStr').value))
      add_strategy(num_str);

    restart();
  }

  function example_dot() {
    var example = 'digraph {\n\t0 -> 1;\n\t1 -> 2;\n\t2 -> 9;\n\t0 -> 3;\n\t3 -> 1;\n\t1 -> 4;\n\t4 -> 2;\n\t2 -> 5;\n\t5 -> 0;\n\t6 -> 0;\n\t7 -> 1;\n\t8 -> 2;\n}';
    window.alert(example);
  }

  function add_strategy(num_strategies) {
    if(num_strategies > strategies.length)
      generate.add_strategy(num_strategies);

    var pw = generate.power_set(num_strategies);

    for (var i = 0; i < strategy_chosen.length; i++) {
      var choose = strategy = pw[Math.floor(Math.random()*pw.length)];
      strategy_chosen[i].strategy = choose[Math.floor(Math.random()*choose.length)];

      var node = strategy_chosen[i].id;
      for (var j = 0; j < strategies_available.length; j++)
        if(in_array(strategies_available[j].id, choose))
          strategies_available[j].nodes.push(node);
    }
  }

  function add_dot_nodes(node_list) {
    // add nodes
    for(var i in node_list) {
      var point = [0,0],
          node = {id: parseInt(i), reflexive: false};
      node.x = point[0];
      node.y = point[1];
      nodes.push(node);
    }
    return;
  }

  function add_dot_edges(lines) {
    // add links
    for (var i = 0; i < lines.length; i++) {
      if(lines[i]) {
        var link = {source: lines[i][0], target: lines[i][1], left: false, right: true};
        links.push(link);
      }
    }
  }

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
    upload_dot: upload_dot,
    upload_game: upload_game,
    upload_graph: upload_graph,
    example_dot: example_dot,
    download_log: download_log,
    download_graph: download_graph,
    download_game: download_game
  };
}());

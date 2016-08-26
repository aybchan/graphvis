var generate = (function() {

  function generate() {
    var n = document.getElementById('modal-nodes').value;
    var s = document.getElementById('modal-strat').value;
    var p = document.getElementById('modal-prob').value;
    var l = lastNodeId + 1;  // index of the first new node

    gen_nodes(n);
    gen_strategies(l, s);
    gen_edges(l,p);
    restart();

  }

  function gen_nodes(n) {
    for(var i = 0; i < n; i++) {
      var point = [0,0],
          node = {id: ++lastNodeId, reflexive: false};
      node.x = point[0];
      node.y = point[1];
      nodes.push(node);
    }
  }

  function gen_strategies(l, s) {
    var strat = power_set(s);
    var pow_len = strat.length;
    var chosen_set = [];

    for (var i = l; i < nodes.length; i++)
      chosen_set.push(strat[Math.floor(Math.random() * pow_len)]);

    var num_nodes = chosen_set.length;

    for (var i = 0; i < num_nodes; i++)
      for (var j = 0; j < chosen_set[i].length; j++)
        strategies_available[chosen_set[i][j]].nodes.push(i+l);

    strategyless();

    for (var i = 0; i < num_nodes; i++) {
      if (chosen_set[i].length == 1)
        strategy_chosen.push({id: i + l, strategy: chosen_set[i][0]});
      else {
        choice = chosen_set[i][Math.floor(Math.random() * chosen_set[i].length)];
        strategy_chosen.push({id: l + i, strategy: choice});
      }
    }
  }

  function power_set(s) {

    var strategies = [];
    for (var i = 0; i < s; i++)
      strategies.push(i);

    var power_set = new Array(new Array());
    for (var i = 0; i < s; i++){
      len = power_set.length
      for (var j = 0; j < len; j++)
        power_set = power_set.concat([power_set[j].concat([strategies[i]])]);
    }
    power_set.shift()
    return power_set;
  }

  function gen_edges(l,p) {
    var j = l + 1;
    var dir = false;
    for (var i = l; i < nodes.length; i++) {
      for (var m = j; m < nodes.length; m++) {
        console.log('i:' + i + 'm:' + m);
        if (Math.random() < p) {
          if (Math.random() > 0.5)
            dir = !dir; 
          var link = {source: node_object(i), target: node_object(m), left: dir, right: !dir};
          links.push(link);
          console.log('link!');
        }
      }
      j++;
    }
  }

  return {
    generate: generate
  };
}());

var cycle = (function() {

  function best_response() {
    if(selected_node)
      var id = selected_node.id;
    else
      return;

    var incoming_nodes = [];
    for (var i in nodes)
      if (game.is_incoming(nodes[i].id, id))
        incoming_nodes.push(nodes[i].id);
    var sorted = strategy_freq(incoming_nodes);


    if (incoming_nodes.length < 1) {
      msg = '(' + message++ + '):\t' + 'Node ' + selected_node.id + ' has no incoming nodes. Strategy unchanged.';
      update_console(msg);
      return;
    }
    msg = '(' + message++ + '):\tNodes ' + incoming_nodes + ' are incoming to node ' + selected_node.id;
    update_console(msg);
    msg = '(' + message++ + '):\t' + 'In-neighbour strategy choices of node ' + selected_node.id + ' (in order): ' + sorted ;
    update_console(msg);

    if(game.strategy_name_by_node(selected_node.id) == sorted[0]) {
      msg = '(' + message++ + '):\t' + 'Node ' + selected_node.id + ' has already chosen ' + sorted[0] + '. Strategy unchanged.';
      update_console(msg);
      return;
    }
    else
      improve_strategy(sorted);
      return;
  }

  function improve_strategy(sorted) {
    for (var i in sorted) {
      if (in_array(selected_node.id, game.nodes_with_strategy(sorted[i]))) {
        if (sorted[i] != game.strategy_name_by_node(selected_node.id)) {
          msg = '(' + message++ + '):\t' + 'Node ' + selected_node.id + ' can improve its payoff by switching to ' + sorted[i] + '!';
          update_console(msg);
          game.change_strategy(selected_node.id, game.strategy_id(sorted[i]));
          return;
        }
        else {
          msg = '(' + message++ + '):\t' + 'Node ' + selected_node.id + ' cannot improve. Strategy unchanged.';
          update_console(msg);
          return;
        }
      }
    }
    msg = '(' + message++ + '):\t' + 'Node ' + selected_node.id + ' cannot improve its strategy because ' + sorted[0] + ' is not available. Strategy unchanged.';
    update_console(msg);
    return;
  }


  function strategy_freq(nodesArray) {
      var stratArray = [];

      for (i in nodesArray) {
        stratArray.push(game.strategy_name_by_node(nodesArray[i]));
      }

      var frequency = {};
      stratArray.forEach(function(value) { frequency[value] = 0; });
      var uniques = stratArray.filter(function(value) {
          return ++frequency[value] == 1;
      });

      return uniques.sort(function(a, b) {
          return frequency[b] - frequency[a];
      });
  }


  function iter_coalition() {
    if(selected_node) {
      var count = cycleCount % coalition_nodes.length;
      selected_node = coalition_nodes[count];
      msg = '(' + message++ + '):\tNode ' + selected_node.id + ' selected!' ;
      update_console(msg);
      best_response();
      cycleCount++;
      restart();
    }
  }

  function same_strategy(before) {
    for( var i = 0; i < before.length; i++) {
      if(before[i] != strategy_chosen[i].strategy)
        return false;
    }
    return true;
  }

  function iter_node() {
    // if no node selected, start from the first node
    if(!selected_node)
      selected_node = nodes[0]

    msg = '(' + message++ + '):\tNode ' + selected_node.id + ' selected!';
    update_console(msg);
    best_response();
    selected_node = nodes[selected_node.id + 1 % nodes.length];
    restart();
  }

  function iter_cycle() {
    var strat_before = [];

    for(var i = 0; i < strategy_chosen.length; i++)
      strat_before.push(strategy_chosen[i].strategy);

    for(var i = 0 ; i < nodes.length; i++) {
      iter_node();
    }

    var check = same_strategy(strat_before);
    if(check) {
      msg = '(' + message++ + '):\t' + 'No change in strategy choices after ' + nodes.length + ' iterations';
      update_console(msg);
    } else {
      msg = '(' + message++ + '):\t' + 'Strategy change after ' + nodes.length + ' iterations: Nash equilibrium not found!';
      update_console(msg);
    }
  }

  function iter_nash() {
    var old_strategies;
    var j = 0;
    var no_change_count = 0;

    while(no_change_count < nodes.length) {
      old_strategies = [];
      // clone list of strategies before iteration
      for(var i = 0; i < strategy_chosen.length; i++)
        old_strategies.push(strategy_chosen[i].strategy);

      iter_node();
      j++;

      if(same_strategy(old_strategies))
        no_change_count++;
      else{
        no_change_count = 0;
        if(j > (5 * nodes.length))
          break;
      }
    }

    if(no_change_count == nodes.length)
      msg = '(' + message++ + '):\t' + ' Nash equilibrium found after ' + j + ' iterations!';
    else
      msg = '(' + message++ + '):\t' + ' No Nash equilibrium after ' + j + ' iterations!';

    update_console(msg);
  }

  return {
        best_response: best_response,
        iter_node: iter_node,
        iter_cycle: iter_cycle,
        iter_nash: iter_nash
  };
}());

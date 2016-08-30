var table = (function() {

  // dynamically update html elements with information
  var html = function html_table() {

    // overall information (first col)
    document.getElementById('total-nodes').innerHTML = nodes.length;
    document.getElementById('total-edges').innerHTML = links.length;
    document.getElementById('social-welfare').innerHTML = game.social_welfare();

    // node information (second col)
    document.getElementById('select-strategy-avail').innerHTML = strategy_list();
    if (selected_node) {
      document.getElementById('select-status-node').innerHTML = 'Node ' + selected_node.id +' selected';
      document.getElementById('select-status-node').className = 'btn btn-primary btn-xs';
      document.getElementById('sel-node').innerHTML = selected_node.id;
      if (game.strategy_id_by_node(selected_node.id) > -1) {
        document.getElementById('sel-strat').innerHTML = game.strategy_name_by_node(selected_node.id);
        document.getElementById('sel-pay').innerHTML = game.node_payoff(selected_node.id);
      } else {
        document.getElementById('sel-strat').innerHTML = "none";
        document.getElementById('sel-pay').innerHTML = 0;
      }
    } else {
      document.getElementById('select-status-node').innerHTML = 'No node selected';
      document.getElementById('sel-node').innerHTML = "none";
      document.getElementById('sel-strat').innerHTML = "no ";
      document.getElementById('sel-pay').innerHTML = "no ";
    }

    if(undirected) {
      document.getElementById('select-status-undirected').innerHTML = 'Undirected edge mode';
      document.getElementById('select-status-undirected').className = 'btn btn-danger btn-xs';
    } else {
      document.getElementById('select-status-undirected').innerHTML = 'Directed edge mode';
      document.getElementById('select-status-undirected').className = 'btn btn-info btn-xs';
    }

    // coalition information
    document.getElementById('coal-size').innerHTML = coalition_nodes.length;
    document.getElementById('coal-nodes').innerHTML = (coalition_nodes.length == 0) ? "empty" : nodes_in_coalition();
    document.getElementById('coal-pay').innerHTML = game.coalition_payoff();
  };

  function strategy_list() {
    var i;
    var available = "<h5>Available:</h5>";
    var not_available = "<h5>Not available:</h5>";
    if(selected_node) {
      id = selected_node.id;
      for (i = 0; i < strategies.length; i++) {
        if (strategies_available.length > 0 && in_array(id, strategies_available[i].nodes))
          (game.strategy_name(i) == game.strategy_name_by_node(id)) ? available += '<li class="active">[ ' + game.strategy_name(i) + ' ]</li>' + '\n' : available += '<li><a href="#s" onclick="game.change_strategy(' + id + ', ' + i + ');">' + game.strategy_name(i) + '</a> <a href="#s" class="text-danger" onclick="game.remove_strategy(' + id + ', ' + i + ');">(-)</a></li>' + '\n';
        else
          not_available += '<li>' + game.strategy_name(i) + ' <a href="#s" onclick="game.add_strategy(' + id + ', ' + i + ');">(+)</a></li>' + '\n';
      }
    }
    else {
      available     += '<li class="active"> [no node selected] </li>'
      not_available += '<li class="active"> [no node selected] </li>'
    }
    return available + '</br>' + not_available;
  }

    return {
           html: html,
           strategy_list:strategy_list
       };
}());

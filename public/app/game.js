var game = (function() {


  // game function

  function is_incoming(out, inc) {
    var i;
    for (i = 0; i < links.length; i++)
    {
      if ((links[i].source.id == out && links[i].target.id == inc && links[i].right) || (links[i].source.id == inc && links[i].target.id == out && links[i].left))
        return true;
    }
    return false;
  }

  //function node_payoff(id) {
  function node_payoff(id){
    var i;
    var j;
    var payoff = 0;
    var strategy = strategy_id_by_node(id);

    for (i = 0; i < strategy_chosen.length; i++)
    {
      if (strategy_chosen[i].strategy == strategy && is_incoming(strategy_chosen[i].id, id))
        payoff++;
    }
    return payoff;
  }

//  function addToAvailableStrategies(nodeId, strategyId) {
  function add_strategy(node, new_strategy) {
    strategies_available[new_strategy].nodes.push(node);

    var i;
    for (i = 0; i < strategy_chosen.length; i++)

      if(strategy_chosen[i].id == node && strategy_chosen[i].strategy == null)
        strategy_chosen[i].strategy = new_strategy;
    restart();
    console.log( msg = '(' + message++ + '):\t' + strategy_name(new_strategy) + ' added to avaliable strategies for node ' + node + '!' );
    update_console(msg);
  }

  //function removeFromAvailableStrategies(nodeId, strategyId) {
  function remove_strategy(nodeId, strategyId) {
    console.log('remove from avail strat ' + nodeId + ' ' + strategyId + ' ' + strategy_name(strategyId));
    var i;
    for (i = 0; i < strategies_available.length; i++) {
      if(strategies_available[i].id == strategyId)  {
        strategies_available[i].nodes.splice(strategies_available[i].nodes.indexOf(nodeId), strategies_available[i].nodes.indexOf(nodeId)+1);
        restart();
        console.log( msg = '(' + message++ + '): \t' + strategy_name(strategyId) + ' removed from avaliable strategies for node ' + nodeId + '!' );
        update_console(msg);
        return;
      }
    }
  }

  // change strategy of a given node (by id) to a given strategy (by id)
  //function changeStrategy (nodeId, strategyId) {
  function change_strategy (node, new_strategy) {
    var i;
    var old_strategy = strategy_name_by_node(node);
    for (i = 0; i < strategy_chosen.length; i++) {
      if (strategy_chosen[i].id == node) {
        strategy_chosen[i].strategy = new_strategy;
        console.log( msg = '(' + message++ + '): \tStrategy of node ' + node + ' changed from ' + old_strategy + ' to ' + strategy_name(new_strategy) + '!' );
        update_console(msg);
        restart();
        return;
      }
    }
  }


  function nodes_with_strategy(strategy) {
    var stratId = strategy_id(strategy);
    for (var i in strategies_available) {
      if (stratId == strategies_available[i].id)
        return strategies_available[i].nodes;
    }
  }

  function available_strategies(id) {
    var available = [];
    for (var i in strategies_available) {
      if (in_array(id, strategies_available[i].nodes))
        available.push(strategy_name(strategies_available[i].id));
    }
    return available;
  }


  //------GUI playground manipulation------

  // clear
  function clear_playground() {
    nodes = [];
    links = [];
    strategy_chosen = [];
    strategies_available = [];
    lastNodeId = -1;
    reset_selected();
    initiate_playground();
    strategyless();
    restart();
    console.log( msg = '(' + message++ + '):\tPlayground emptied!');
    update_console(msg);
  }

  function clear_coalition() {
    coalition_nodes = [];
    cycleCount = 0;
    console.log( msg = '(' + message++ + '):\tCoalition emptied!');
    update_console(msg);
    restart();
  }


  function nodes_in_coalition() {
    var str = [];
    var i;

    for (i = 0; i < coalition_nodes.length ; i++)
      str = str.concat(' ' + coalition_nodes[i].id);

    return str;
  }

  function social_welfare() {
    var i;
    var welfare = 0;

    for (i = 0; i < nodes.length; i++) {
      welfare += node_payoff(nodes[i].id);
    }

    return welfare;
  }

  function strategy_id_by_node(id){
    var i;

    for (i = 0; i < strategy_chosen.length; i++) {
      if (id == strategy_chosen[i].id && strategy_chosen[i].strategy != null)
        return strategy_chosen[i].strategy;
    }
    return -1;
  }

  function strategy_name_by_node(id){
    var i;

    for (i = 0; i < strategy_chosen.length; i++) {
      if (id == strategy_chosen[i].id && strategy_chosen[i].strategy != null)
        return strategy_name(strategy_chosen[i].strategy);
    }
    return "white";
  }

  // return strategy colour name given strategy id
  //function getStratNameById(id) {
  function strategy_name(id){
    var i;
    for (i = 0; i < strategies.length; i++) {
      if (strategies[i].id == id)
        return strategies[i].color;
    }
  }

  //function getStratIdByName(name) {
  function strategy_id(name) {
    var i;
    for (i = 0; i < strategies.length; i++) {
      if (strategies[i].color == name)
        return strategies[i].id;
    }
  }




//GAME



//  function coalitionPayoff() {
  function coalition_payoff() {

    var payoff = 0;
    var i;
    for (i = 0; i < coalition_nodes.length; i++)
      payoff += node_payoff(coalition_nodes[i].id);
    return payoff;
  }


    return {
          social_welfare: social_welfare,
          strategy_name_by_node: strategy_name_by_node,
          strategy_id_by_node: strategy_id_by_node,
          strategy_name: strategy_name,
          strategy_id: strategy_id,
          node_payoff: node_payoff,
          available_strategies: available_strategies,
          remove_strategy: remove_strategy,
          change_strategy: change_strategy,
          add_strategy: add_strategy,
          nodes_with_strategy: nodes_with_strategy,
          is_incoming: is_incoming,
          clear_playground: clear_playground,
          clear_coalition: clear_coalition,
          nodes_in_coalition: nodes_in_coalition,
          coalition_payoff: coalition_payoff
    };
}());

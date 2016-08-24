var table = (function() {

  // dynamically update html elements with information
  var html = function html_table() {

    // overall information (first col)
    document.getElementById('total-nodes').innerHTML = nodes.length;
    document.getElementById('total-edges').innerHTML = links.length;
    document.getElementById('social-welfare').innerHTML = game.social_welfare();

    // node information (second col)
    document.getElementById('select-strategy-avail').innerHTML = strategyList();
    if (selected_node) {
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

    //console.log( '(' + message++ + ') \tHTML table updated.' );

  };

  function strategyList() {
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
           strategyList:strategyList
       };
}());


// function table() {
//
//   var tableY = 15;
//
//   // total node info
//   svg.selectAll('.totalnode').remove();
//   svg.append('svg:text')
//      .attr('x', 40)
//      .attr('y', tableY)
//      .attr('class', 'totalnode')
//      .text(function(d) { return 'Total nodes: ' + nodes.length;});
//   // total edge info
//   svg.selectAll('.totaledge').remove();
//   svg.append('svg:text')
//      .attr('x', 40)
//      .attr('y', tableY + 15)
//      .attr('class', 'totaledge')
//      .text(function(d) { return 'Total edges: ' + links.length;});
//
//   // selected node info
//     if (selected_node) {
//       svg.selectAll('.selectedtextnode').remove();
//
//       svg.append('svg:text')
//          .attr('x', 40)
//          .attr('y', tableY + 30)
//          .attr('class', 'selectedtextnode')
//          .text(function(d) { return "Selected node: " + selected_node.id + ' Strategy: ' + game.strategy_name_by_node(selected_node.id) });
//   }
//     if (!selected_node) {
//       svg.selectAll('.selectedtextnode').remove();
//
//       svg.append('svg:text')
//          .attr('x', 40)
//          .attr('y', tableY + 30)
//          .attr('class', 'selectedtextnode')
//          .text(function(d) { return "Selected node: no node selected" + ' Strategy: ' ;});
//   }
//
//   if (selected_link) {
//     svg.selectAll('.selectedtextlink').remove();
//
//     svg.append('svg:text')
//        .attr('x', 40)
//        .attr('y', tableY + 45)
//        .attr('class', 'selectedtextlink')
//        .text(function(d) { return ' Selected link: ' + selected_link.source.id + ' to ' + selected_link.target.id;});
//   }
//
//   if (!selected_link) {
//     svg.selectAll('.selectedtextlink').remove();
//
//     svg.append('svg:text')
//        .attr('x', 40)
//        .attr('y', tableY + 45)
//        .attr('class', 'selectedtextlink')
//        .text(function(d) { return ' Selected link: ';});
//   }
//
// // social welfare
//   svg.selectAll('.tablesocialwelfare').remove();
//   svg.append('svg:text')
//      .attr('x', 40)
//      .attr('y', tableY + 75)
//      .attr('class', 'tablesocialwelfare')
//      .text(function(d) { return 'Social welfare: ' + socialWelfare(); });
//
// // color payoff
//   if (selected_node) {
//   svg.selectAll('.tablecolorpay').remove();
//   svg.append('svg:text')
//      .attr('x', 40)
//      .attr('y', tableY + 90)
//      .attr('class', 'tablecolorpay')
//      .text(function(d) { return 'Color payoff: ' + nodePayoffById(selected_node.id); });
//   }
//   if (!selected_node) {
//   svg.selectAll('.tablecolorpay').remove();
//   svg.append('svg:text')
//      .attr('x', 40)
//      .attr('y', tableY + 90)
//      .attr('class', 'tablecolorpay')
//      .text(function(d) { return 'Color payoff: no node selected'; });
//   }
//
// // Coalition selection
//
//    if (coalition_nodes.length < 1) {
//    svg.selectAll('.tablecoalition').remove();
//    svg.append('svg:text')
//       .attr('x', 40)
//       .attr('y', tableY + 105)
//       .attr('class', 'tablecoalition')
//       .text(function(d) { return 'Coalition selection: \{ \} ' ; });
//    } else {
//      svg.selectAll('.tablecoalition').remove();
//      svg.append('svg:text')
//         .attr('x', 40)
//         .attr('y', tableY + 105)
//         .attr('class', 'tablecoalition')
//         .text(function(d) { return 'Coalition selection: \{' + nodes_in_coalition() + ' \}'; });
//   }
//    svg.append('svg:text')
//       .attr('x', 40)
//       .attr('y', tableY + 120)
//       .attr('class', 'tablecoalition')
//       .text(function(d) { return 'Coalition size: ' + coalition_nodes.length; });
// }

// set up svg canvas

var svg,
    width  = 800,
    height = 600;

svgInit(width, height);

// graph display settings
var radius = 15,
    link_width = 3,
    link_distance = 160,
    spread = 150,
    text_size = 15,
    font = text_size + 'px sans-serif';

// function variable for synchronised queue
var queue = d3_queue.queue();

// declare global variables
var message = 0,
    messages = [],
    graphFile = "/data/graph.json",
    gameFile = "/data/game.json",
    links,
    nodes,
    path,
    force,
    lastNodeId,
    drag_line,
    undirected = false, // undirected mode for edge drawing
    selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null,
    coalition_mode = null,
    coalition_nodes = [],
    cycleCount = 0,
    wholeCount = 0,
    colour_definitions,
    strategies,
    strategy_chosen,
    strategies_available;

arrow_defn();

// load data for graph (nodes, edges), game (strategies), colour definitions
function reload() {
  d3_queue.queue()
    .defer(d3.json, graphFile)
    .defer(d3.json, gameFile)
    .defer(d3.json, '/json/colours.json')
    .await(read);
}

// load graph and game data from text files on server, and save to globally
// accessible variables
function read(error, graph, game, colours) {
  links = graph.links;
  nodes = graph.nodes;
  strategies = game.strategies;
  strategy_chosen = game.strategy_chosen;
  strategies_available = game.strategies_available;
  colour_definitions = colours.colours;

  console.log( msg = '(' + message++ + ') \tFiles loaded.' );
  console.log( strategy_chosen );
  update_console(msg);

  lastNodeId = nodes.length - 1;
  strategyless();

  // init D3 force layout
  initiate_playground();

  // handles to link and node element groups
  path = svg.append('svg:g').selectAll('path'),
  circle = svg.append('svg:g').selectAll('g');

  restart();
}

// sets up global strategy variables if uploaded data not complete
function strategyless() {
  var non_null_strategy_nodes = [];
  for (i = 0; i < strategy_chosen.length; i++)
    non_null_strategy_nodes.push(strategy_chosen[i].id);
  for (i = 0; i < nodes.length; i++) {
    if(!in_array(i, non_null_strategy_nodes))
      strategy_chosen.push( {id:i, strategy:null} );
  }

  if(strategies.length != strategies_available.length) {
    var strategies_w_nodes = [];

    for (i = 0; i < strategies_available.length; i++)
      strategies_w_nodes.push(strategies_available[i].id);

    for (i = 0; i < strategies.length; i++)
      if(!in_array(strategies[i].id, strategies_w_nodes))
        strategies_available.push({id: i, nodes: []});
  }
}

// reset mouse flags
function reset_selected() {
    selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
    coalition_nodes = [];
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}


// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });

}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links

  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    })
    .style('stroke-width', link_width);

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  update_node_colours();

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', radius)
    .style('fill', function(d) { return (d === selected_node) ? convert_colour(game.strategy_name_by_node(d.id)).brighter().toString() : convert_colour(game.strategy_name_by_node(d.id)); })
    .style('stroke', "gray")
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.2)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('dblclick', function(d) {
      d3.select(this).classed("fixed", d.fixed = false);
    })

    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) {
        d3.select(this).classed("fixed", d.fixed = true);
        return;
      }
      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      update_node_colours();
      table.html();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node) return;

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction, link;
      if(undirected){
          target = mouseup_node;
          source = mousedown_node;
          link = {source: source, target: target, left: true, right: true};
          links.push(link);
      } else {
          if(mousedown_node.id < mouseup_node.id) {
          source = mousedown_node;
          target = mouseup_node;
          direction = 'right';
        } else {
          source = mousedown_node;
          target = mouseup_node;
          direction = 'left';
        }

        link = links.filter(function(l) {
          return (l.source === source && l.target === target);
        })[0];


        if(link) {
          link[direction] = true;
        } else {
          link = {source: source, target: target, left: false, right: true};
          links.push(link);
        }
      }

      // select new link
      selected_link = link;
      selected_node = null;
      restart();
    });

  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 5)
      .attr('class', 'id')
      .style('font', font)
      .style('font-weight', 'bold')
      .text(function(d) { return d.id; });


  g.append('svg:text')
      .attr('x', 18)
      .attr('y', 5)
      .attr('class', 'sa')
      .style('font', font)
      .text(function(d) { return game.available_strategies(d.id); });

  svg.selectAll('.sa').text(function(d){return game.available_strategies(d.id)});

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();

  table.html();

  //console.log( '(' + message++ + ') \tPlayground refreshed.' );
}

function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();

  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

  // insert new node at point
  var point = d3.mouse(this),
      node = {id: ++lastNodeId, reflexive: false};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);
  strategy_chosen.push( {id:lastNodeId, strategy:null} );

  console.log( msg = '(' + message++ + '): \t Node ' + lastNodeId + ' added to graph!' );
  update_console(msg);

  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
    if(mouseup_node)  {
      console.log( msg = '(' + message++ + '): \t Path from node ' + mousedown_node.id + ' to node ' + mouseup_node.id + ' added to graph!' );
      update_console(msg);
    }
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
  restart();
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // switch undirected mode on/off
  if(d3.event.keyCode == 85) {
    undirected = !undirected;

    if(undirected)
      console.log( msg = '(' + message++ + '): \tUndirected edge mode turned on! Press \'u\' to turn off.');
    else
      console.log( msg = '(' + message++ + '): \tUndirected edge mode turned off! Press \'u\' to turn on.');
    update_console(msg);
    table.html();
  }

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        var i;
        for (i = 0; i < strategy_chosen.length; i++) {
          if (selected_node.id == strategy_chosen[i].id) {
            strategy_chosen.splice(i, 1);
            break;
          }
        }
        spliceLinksForNode(selected_node);
        console.log( msg = '(' + message++ + '): \tNode ' + selected_node.id + ' removed from graph!' );
        update_console(msg);
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
        console.log( msg = '(' + message++ + '): \tPath from node ' + selected_link.source.id + ' to node ' + selected_link.target.id + ' removed from graph!' );
        update_console(msg);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 67: // C coalition selection
      if (selected_node) {
        if(in_array(selected_node, coalition_nodes)) {
          for (i = 0; i < coalition_nodes.length; i++) {
            if (coalition_nodes[i] == selected_node) {
              coalition_nodes.splice(i, i + 1)
              console.log( msg = '(' + message++ + '): \t Node ' + selected_node.id + ' removed from coalition!');
              update_console(msg);
              break;
            }
          }
        } else {
          coalition_nodes.push(selected_node);
          console.log( msg = '(' + message++ + '): \t Node ' + selected_node.id + ' added to coalition!');
          update_console(msg);
        }
      }
      restart();
      break;
  }
}

// check if object is in an array, bool
function in_array(obj, arr) {
  return arr.indexOf(obj) > -1;
}

function node_object (id) {
  var i;
  for( i = 0; i < nodes.length; i++) {
    if (nodes[i].id == id)
      return nodes[i];
  }
  console.log( msg = '(' + message++ + ') \tNode not found!' );
  update_console(msg);
  window.alert("node not on graph!");
}


function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}



function update_console(m) {
  messages.push(m);
  for (i = 0; i < 6 ; i++) {
    if(message - i < 1)
      return;
    var consoleStr = "console-" + i;
    document.getElementById(consoleStr).innerHTML = '> ' + messages[message - i - 1];
  }

}

function arrow_defn() {
  // define svg arrow heads for directed graph
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

  // line displayed when dragging new nodes
  drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');
}

function svgInit(w, h) {
    svg = d3.select('#pg')
            .append('svg')
            .attr('oncontextmenu', 'return false;')
            .attr('id', 'svg')
            .attr('width', w)
            .attr('height', h)
            .attr("align", "center")
            .on('mouseover', function(d,i) {
    d3.select(window).on('keydown', keydown).on('keyup', keyup);
  })
            .on('mouseout', function(d,i) {
    d3.select(window).on('keydown', null).on('keyup', null);
  });
  document.getElementById('pg-foot').innerHTML = w + 'px x ' + h + 'px playground. Click display settings to resize.)';
}

function convert_colour(col) {
  var i;

  if(col == "white") return d3.rgb(col);

  for (i = 0; i < colour_definitions.length; i++) {
    if (colour_definitions[i].input == col)
      return d3.rgb(colour_definitions[i].out);
  }

  console.log( msg = '(' + message++ + ') \t ' + col + ' not found!' );
  update_console(msg);

  return d3.rgb(col);
}

function update_node_colours() {
  circle.selectAll('circle')
        .style('fill', function(d) { return (d === selected_node) ? convert_colour(game.strategy_name_by_node(d.id)).brighter().toString() : convert_colour(game.strategy_name_by_node(d.id)); })
        .classed('coalition', function(d) { return in_array(d, coalition_nodes); });
}


function initiate_playground() {
  force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(link_distance)
      .charge(-spread)
      .on('tick', tick);
  reset_selected();
}

function set_display() {
  var w = document.getElementById('modal-width').value;
  var h = document.getElementById('modal-height').value;
  var s = document.getElementById('modal-spread').value;

  width = parseInt(w);
  height = parseInt(h);
  spread = parseInt(s);

  link_distance = (spread > 150) ? spread - spread / 5 : spread + 10;

  display_settings(width, height, spread);
}

function display_settings(w, h, c) {
  document.getElementById('svg').width.baseVal.value = w;
  document.getElementById('svg').height.baseVal.value = h;

  force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([w, w])
      .linkDistance(link_distance)
      .charge(-c)
      .on('tick', tick);

  restart();

  document.getElementById('modal-height').setAttribute("placeholder", height);
  document.getElementById('modal-width').setAttribute("placeholder", width);
  document.getElementById('modal-spread').setAttribute("placeholder", spread);

  document.getElementById('pg-foot').innerHTML = w + 'px x ' + h + 'px playground. Click settings to resize.)';
  console.log( msg = '(' + message++ + '): \t Resized playground to ' + w + ' x ' + h + ' pixels, and node spread to ' + c + '.');
  update_console(msg);
}


// app starts here

// turn popovers on
$(function () {
  $('[data-toggle="popover"]').popover()
})

// set mouse and keyboard behaviours
svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', null)
  .on('keyup', null);

// calls queue manager to load text files syncronously
reload();
restart();
table.html();

import React, { Component } from 'react';
import { render } from 'react-dom';
import { json } from 'd3-fetch';
import { scaleOrdinal } from 'd3-scale';
import { select, selectAll } from 'd3-selection';
import { treemap, hierarchy, treemapResquarify } from 'd3-hierarchy';

// IMPORTANT! IMPORT THIS SO WEBPACK CREATES A FILE IN DOCS FOLDER
// THIS IS WHERE fetchData LOOKS FOR LOCALLY
import './helper/sample.json';
import './helper/flare.json';
// console.log({sampleData});

import './styles/main.scss';

const GAMES = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';
const MOVIES = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
const KICKSTARTERS = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';

class Treemap extends Component {
  constructor(props) {
    super(props)
    this.state = {
       gamesData: [],
       moviesData: [],
       kickstartersData: [],
       h: 600,
       w: 1200,
       p: 50,
    };
    this.createTreemap = this.createTreemap.bind(this);
    this.fetchData = this.fetchData.bind(this);
  };
  
  componentDidMount() {
    console.log('component mounted!');
    // console.log({sampleData})
    // this.fetchData('./json/sample.json');
    this.fetchData('./json/flare.json');
    // this.fetchData(GAMES);
    // this.fetchData(MOVIES);
    // this.fetchData(KICKSTARTERS);
  };

  componentDidUpdate() {
    console.log('state updated: ', this.state);
    if (this.state.data.hasOwnProperty('name')) { // kapag may laman na ang data
      this.createTreemap(this.state.data);
    }
  };

  fetchData(address) {
    json(address, (error, data) => {
      if(error) throw error; 
    })
      .then(data => this.setState({ data }));
  }

  createTreemap(data) {
    console.log('creating treemap...')
    const node = this.node

    const color = scaleOrdinal()

    const sumBySize = d => d.size, // size ay property ng data na nasa flare.json
          sumByCount = d => d.children ? 0 : 1; // kung may children ang current node, 0 ang count

    const rootNode = hierarchy(data)
      .eachBefore(d => {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name
      })
      .sum(sumBySize)
      .sort((a,b) => (
        b.height - a.height || b.value - a.value
      ))           
    // console.log(rootNode.descendants()[3].ancestors()); // ancestor from (node).
    // console.log(rootNode.children.descendants()); // descendant from (node).
    // console.log(rootNode.leaves()) // nodes without children
    // console.log(rootNode.children[rootNode.children.length - 1]) // last child of rootNode
    // console.log(rootNode.count()) // dunno what this does yet

    console.log('rootNode before: ', rootNode.leaves());

    let treemapity = treemap()
      .tile(treemapResquarify) // default is d3.treemapResquarify, uses the golden ratio square format
      .size([this.state.w, this.state.h])
      .round(true) // NOTE: test what happens if not true
      .paddingInner(1) // NOTE: test what happens if not 1
    
    treemapity(rootNode);
    // console.log(treemap(rootNode));
    console.log('rootNode afterr: ', rootNode.leaves());

    select(node).selectAll('g')
      .attr('id', 'cell')
      .data(rootNode.leaves())
      .enter().append('g')
        .attr('class', 'group')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
          .append('rect')
          .attr('id', d => d.data.id)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', d => 'gray')

    selectAll('g').append('clipPath') // kung lumampas 'yung text sa rect, iciclip nito
            .attr('id', d => 'clip-' + d.data.id )
            .append('use')
              .attr('xlink:href', d => '#' + d.data.id)
    
    selectAll('g').append('text')
      .attr('clip-path', d => `url(#clip-${d.data.id})`)
      .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)) //new line every bagong word (capital letter)
        .enter().append('tspan') // tspan kasi new line every 'word' ng leaf node
        .attr('x', 4) // 4px from the left of rect
        .attr('y', (d,i) => 13 + i * 12) // 13px below the top, 15px every line
        .text(d => d) // text 'yung mismong array?
    
    selectAll('g').append('title')
      .text(d => d.data.id + '\n' + d.value) // parang tooltip 'tong title element


    
    
  }

  render() {
    return (
      <div id='main-container'>
        <h1>This is (not yet) a treemap</h1>
        <svg ref={node => this.node = node}
          viewBox={`0 0 ${this.state.w} ${this.state.h}`}
          preserveAspectRatio='xMidYMid meet'>
        </svg>
      </div>
    );
  };
};

render(
  <Treemap />,
  document.getElementById('root')
);
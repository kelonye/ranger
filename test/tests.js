describe('A Ranger', function() {
  
  var hl = function() {
    var wrapper = document.createElement('span');
    wrapper.className = "hl";
    return wrapper;
  }();
  
  it('should ignore when no ranged is supplied', function(done) {
    
    expect(new Ranger().textNodes()).to.equal(undefined);
    
    done();
    
  });
  
  it('should not bound the offset to the maximum possible value for node', function(done) {
    
    var r = {
      startContainer: $('#content strong')[0],
      startOffset: 1,
      endContainer: $('#content strong').eq(1).contents()[0],
      endOffset: 3000
    }
    
    var serialized = new Ranger(r).toJSON();

    // internally we work with the node's length (18) but the serialized returns 3000
    expect(serialized).to.have.property('endOffset').equal(3000);
    
    done();
    
  });
  
  it('should not blow if set ridiculous offsets when start == end', function(done) {
    
    var r = {
      startContainer: $('#content strong')[0],
      startOffset: 11,
      endContainer: $('#content strong')[0],
      endOffset: 3000
    }
    
    expect(new Ranger(r).paint().length).to.equal(1);
    
    done();
    
  });
  
  it('should check unpaint', function(done) {
    
    var r = {
      startContainer: $('#content strong')[0],
      startOffset: 8,
      endContainer: $('#content p')[3],
      endOffset: 10
    }
    
    var ranger = new Ranger(r);
    ranger.paint();
    var beforeText = ranger.toString();
    
    ranger.unpaint();
    ranger.paint(hl);
    expect(ranger.toString()).to.equal(beforeText);
    
    done();
    
  });
  
  it('should swap nodes to the right start/end only internally', function(done) {
    
    var r = {
      startContainer: getAllNodes($('#content strong')[1], true)[0],
      startOffset: 18,
      endContainer: $('#content strong')[0],
      endOffset: 1
    }
    
    var ranger = new Ranger(r);
    // ranger.paint(hl);
    var serialized = ranger.toJSON();
    
    expect(serialized.startContainer).to.equal(Ranger.utils.xpath.getXPath($('#content strong')[1]));
    expect(serialized.startOffset).to.equal(18);
    expect(serialized.endContainer).to.equal(Ranger.utils.xpath.getXPath($('#content strong')[0]));
    expect(serialized.endOffset).to.equal(1);
    
    done();
    
  });
  
  it('should recognize a serialized range, use default painting element and check hash', function(done) {
    
    var r = {
      startContainer: "/html/body/div/p/strong/em",
      startOffset: 1,
      endContainer: "/html/body/div/p/em[2]",
      endOffset: 41
    }    

    var ranger = new Ranger(r);

    var painted = ranger.paint(); // uses default painting element
    
    expect(painted.length).to.be.greaterThan(0);
    
    var text = ranger.toString();
    
    expect(text).to.equal("it amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit");
    
    expect(ranger.id).to.equal('8f2447b3');
    
    painted.forEach(function(p) {
      expect(p.className).to.equal(Ranger.PAINT_CLASS);
      expect(p.getAttribute(Ranger.DATA_ATTR)).to.equal('8f2447b3'); // 8f2447b3 is r's hash
    });
    
    done();
    
  });
  
  it('should accept equivalent descriptions for accessing the same node', function(done) {
    
    // /html/body/div/p/strong,8  is equivalent to  /html/body/div/p/strong/em,2
    
    var r1 = {
      startContainer: "/html/body/div/p/strong",
      startOffset: 8,
      endContainer: "/html/body/div/p[2]",
      endOffset: 0
    }
    
    var r2 = {
      startContainer: "/html/body/div/p/strong/em",
      startOffset: 2,
      endContainer: "/html/body/div/p[2]",
      endOffset: 0
    }
    
    var ranger1 = new Ranger(r1),
      ranger2 = new Ranger(r2);
    
    expect(ranger1.toString()).to.equal(ranger2.toString());
    
    done();
    
  });
    
  it('should equal its serialized counterpart', function(done) {
    
    var r = {
      startContainer: "/html/body/div[2]/p/strong[2]",
      startOffset: 9,
      endContainer: "/html/body/div[2]/p[2]",
      endOffset: 0
    }
    
    var ranger = new Ranger(r);
    ranger.paint(hl);
    
    expect(ranger.toString()).to.equal("cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
    
    var serialized = ranger.toJSON();

    expect(serialized.startContainer).to.equal(r.startContainer);
    expect(serialized.startOffset).to.equal(r.startOffset);
    expect(serialized.endContainer).to.equal(r.endContainer);
    expect(serialized.endOffset).to.equal(r.endOffset);
    expect(serialized.commonAncestorContainer).to.equal(undefined);
    
    var r2 = {
      startContainer: $('#content td')[1],
      startOffset: 1,
      endContainer: $('#content td')[3],
      endOffset: 5
    }
    
    var json1 = new Ranger(r2).toJSON();
    
    expect(new Ranger(json1).toJSON()).to.deep.equal(json1);
    
    done();
    
  });
  
  it('should throw invalid range', function() {
    
    expect(function() {
      
      var r = {
        startContainer: $('#content li')[2],
        startOffset: 1,
        endContainer: $('#content li')[5],
        endOffset: 5
      }
      
      new Ranger(r);
      
    }).to.throw(Error, /Invalid range/);
    
  });
  
  it('should serialize the same result regardless of whether paint has been called or not', function(done) {
    
    var s1 = Ranger.utils.findDeepestNode($('#content p')[3], 438),
      s2 = Ranger.utils.findDeepestNode($('#content li')[1], 7);
    
    var r = {
      startContainer: s1[0],
      endContainer: s2[0],
      startOffset: s1[1],
      endOffset: s2[1]
    }
    
    var ranger = new Ranger(r);
    var json1 = ranger.toJSON();
    ranger.paint(hl);
    var json2 = ranger.toJSON();
    
    expect(json2).to.deep.equal(json1);
    
    done();
    
  });
  
  it('should paint even if there is another highlight', function(done) {
    
    var r = {
      startContainer: "/html/body/div[2]/p/strong[1]",
      startOffset: 1,
      endContainer: "/html/body/div[2]/p/strong[1]",
      endOffset: 3
    }
    
    new Ranger(r).paint(hl);

    r = {
      startContainer: "/html/body/div[2]/p/strong[1]",
      startOffset: 0,
      endContainer: "/html/body/div[2]/p/strong[1]",
      endOffset: 3
    }
    
    // should paint 2 textnodes in "dolor": "d" & "ol"
    // we use greater than, because highlights from other tests could be influencing the result
    expect(new Ranger(r).paint(hl).length).to.be.greaterThan(1);
    
    done();
    
  });
    
  it('should throw an exception when provided shit', function(done) {
    
    expect(function() {
    
      var r = {
        startContainer: "zzzz1]",
        startOffset: "z",
        endContainer: "----",
        endOffset: null
      }
    
      new Ranger(r).toJSON();
    
    }).to.throw(Error);

    expect(function() {
    
      var r = {
        startContainer: "zzzz1]",
        startOffset: 0,
        endContainer: "----",
        endOffset: 10
      }
    
      new Ranger(r).toJSON();
    
    }).to.throw(Error);

    
    done();
    
  });
  
  it('should highlight correctly from non-textnode to non-textnode', function() {
    
    var r = {
      startContainer: "/html/body/div[2]/p[2]/img",
      startOffset: 0,
      endContainer: "/html/body/div[2]/hr",
      endOffset: 0
    }

    var ranger = new Ranger(r),
      painted = ranger.paint(hl);

    expect(painted.length).to.be.greaterThan(0);
    
    expect(ranger.toString()).to.equal("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
    
  });
  
  it('should not break with random start/end nodes', function(done) {
    
    var content = document.getElementById('content'),
      times = 9;
  
    for (var i = 0; i < times; i++) {
    
      // Prepare nodes, filter out highlight spans, and concat with an only-text node list
      // so that text nodes have more weight in the shuffle
    
      var nodes = getAllNodes(content).filter(function(e) { return e.className != 'hl' })
        .concat(getAllNodes(content, true))
        .concat(getAllNodes(content, true));
    
      var shuffledNodes = shuffleArray(nodes);
    
      var start = shuffledNodes[0],
        end = shuffledNodes[shuffledNodes.length - 1];
    
      var r = {
        startContainer: start,
        endContainer: end,
        startOffset: randomIntMax(start.textContent.length),
        endOffset: randomIntMax(end.textContent.length)
      }

      var ranger = new Ranger(r);

      ranger.paint(hl);
    
    }

    done();
    
  });

  it('should not select any SVG text nodes', function(done) {
    
    var start = document.querySelector('ellipse');
    var end = document.querySelector('filter');
    
    var r = {
      startContainer: start,
      endContainer: end,
      startOffset: 0,
      endOffset: 79
    }
    
    var painted = new Ranger(r).paint(hl);
    
    expect(painted.length).to.equal(0);
    
    done();
    
  });
  
  it('should work with selection crossing SVG tags', function(done) {
    
    var s = Ranger.utils.findDeepestNode($('p')[2], 438);
    
    var r = {
      startContainer: s[0],
      endContainer: $('p')[3],
      startOffset: s[1],
      endOffset: 5
    }
    
    var painted = new Ranger(r).paint(hl);
    expect(painted.length).to.be.greaterThan(0);
    
    done();
    
  });
    
  it('should paint the same amount of text nodes', function(done) {
    
    var r = {
      startContainer: document.querySelector('#one em'),
      endContainer: document.querySelector('#three strong'),
      startOffset: 2,
      endOffset: 6
    }
    
    var ranger = new Ranger(r);
    
    var nodes = ranger.textNodes();
    var painted = ranger.paint(hl);
    
    expect(painted.length).to.equal(nodes.length);
    
    done();
    
  });
  
  it('should accept jQuery objects too', function(done) {
    
    expect(function() {
    
      new Ranger({
        startContainer: $('p:first'),
        startOffset: 0,
        endContainer: $('p:first'),
        endOffset: 16
      });
      
    }).not.to.throw();
    
    done();
    
  });
  
  it('should correctly use context in toJSON', function(done) {
    
    var further = $('#further');
    
    var ranger = new Ranger({
      startContainer: further.find('p:first'),
      startOffset: 0,
      endContainer: further.find('p:first'),
      endOffset: 16
    }, { context: further[0] });
    
    expect(ranger.toJSON()).to.deep.equal({
      startContainer: "./p",
      startOffset: 0,
      endContainer: "./p",
      endOffset: 16,
      id: "6e016dfe"
    });
    
    done();
    
  });
  
  it('should ignore additional elements', function(done) {
    
    // We will test two identical paragraphs (except one has a <mark> element, to be ignored),
    // should result in the same serialization
    
    var further = $('#further');
    
    var ranger1 = new Ranger({
      startContainer: further.find('p:first em'),
      startOffset: 0,
      endContainer: further.find('p:first em'),
      endOffset: 16
    }, {
      context: further.find('p:first')
    });
    
    var ranger2 = new Ranger({
      startContainer: further.find('p:eq(2) em'),
      startOffset: 0,
      endContainer: further.find('p:eq(2) em'),
      endOffset: 16
    }, {
      context: further.find('p:eq(2)'),
      ignoreSelector: 'mark'
    });
    
    expect(ranger1.id).to.equal(ranger2.id);
    
    done();
    
  });
  
  it('should equal its serialized counterpart when using contexts', function(done) {
    
    var further = $('#further');
    
    var r1 = new Ranger({
      startContainer: further,
      startOffset: 0,
      endContainer: further,
      endOffset: 16
    }, { context: further });
    
    var json1 = r1.toJSON();

    expect(new Ranger(json1, { context: further }).toJSON()).to.deep.equal(json1);
    
    var r2 = new Ranger({
      startContainer: further.find('em'),
      startOffset: 0,
      endContainer: further.find('em'),
      endOffset: 9
    }, { context: further });
    
    var json2 = r2.toJSON();
    
    expect(new Ranger(json2, { context: further }).toString()).to.equal("More text");
    expect(new Ranger(json2, { context: further }).toJSON()).to.deep.equal(json2);
    
    done();
    
  });
  
  
});

// Utilites

var getAllNodes = function(elem, onlyText) {
  
  var children = Array.prototype.slice.call(elem.childNodes),
    onlyText = onlyText || false;
  
  return children.reduce(function(nodes, child) {

    if (!onlyText || child.nodeType === 3) {
      nodes.push(child);
    } else if (child.nodeType === 1) {
      nodes = nodes.concat(getAllNodes(child, onlyText));
    }
    
    return nodes;
    
  }, []);
  
};

var shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

var randomIntMax = function(max) {
  return Math.floor(Math.random() * (max + 1));
}
var renderer = null,
scene = null,
camera = null,
container = null,
isMouseDown = false,
bigObject = null,
windowWidth = 0,
windowHeight = 0,
clock = null,
nodes = [],
mouse = new THREE.Vector2(),
objects = [],
offset = new THREE.Vector3(),
projector = new THREE.Projector(),
objectSelected, objectIntersected,
plane = null,
currentObject = null,
edgeList = null,
curEdgeIndex = 0,
curNode = null;

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function initializeBuilder(c) {

    container = c;
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    renderer = new THREE.WebGLRenderer( {antialias:true} );


    renderer.setSize(windowWidth, windowHeight);
    renderer.setClearColor(0xeaecfe, 1);
    container.appendChild( renderer.domElement );

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Put in a camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 0, 0, 600 );

    // EVENTS
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
    // CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );


    bigObject = new THREE.Object3D();
    
    
    var material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1 });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(120,0,0));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    var xAxis = new THREE.Line(geometry, material);
    bigObject.add(xAxis);
    
    material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 1 });
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,120,0));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    var yAxis = new THREE.Line(geometry, material);
    bigObject.add(yAxis);
    
    
    material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 1 });
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,0,120));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    var zAxis = new THREE.Line(geometry, material);
    bigObject.add(zAxis);
    

    addMouseHandler(); 
    //var light = new THREE.DirectionalLight( 0x00ffff, 1.5);
    //light.position.set(0, 0, 1);
    //scene.add( light );

    scene.add(bigObject);

    plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
    plane.visible = false;
    scene.add( plane );

}

function getNode(url) {

    for (var i = 0; i<nodes.length; i++) {
        if (nodes[i].url == url) {
            return nodes[i];
        }
    }
    return null;

}

function getGroupCenter(n) {
    for (var i = 0; i < nodes.length; i++) {
        if ((nodes[i].groupID == 0) && (n.group == nodes[i].group)) {
            return [nodes[i].x, nodes[i].y, nodes[i].z];
        }
    }
}


function generateGraph(data, dataSize) {
    //takes edge pair list from the collecter and generates the graph
    edgeList = data;

    console.log("datLen: " + data.length + "   dataSize: " + dataSize);
    console.log("from: "+data[0].from.title + "  "+ data[0].from.group + " " + data[0].from.groupID + " " + data[0].from.groupSize + "  to: " + data[0].to.title  + "  "+ data[0].to.group + " " + data[0].to.groupID + " " + data[0].to.groupSize );
    

    console.log("DATATATATATATAT -== = -- " + dataSize);

    var first = new node(data[0].from, data[0].from.group, data[0].from.groupID, data[0].from.groupSize, data[0].from.infoString, getRandomColor());
    first.initialize();
    nodes.push(first);
    first.setCoords( 0, 0, (first.group * -300) + 300 );
    console.log( 0+" , " + 0 + " , " +first.group);


    var second = new node(data[0].to, data[0].to.group, data[0].to.groupID, data[0].to.groupSize, data[0].to.infoString, getRandomColor());
    second.initialize();
    nodes.push(second);

    second.setCoords( (Math.random()*400 - 200), (Math.random()*400 - 200),  (second.group * -300) + 300 );
    
    console.log(first.x + (Math.random()*200 - 100)+" , " + first.y + (Math.random()*200 - 100)+ " , " +second.group);
    
    addEdge(first, second, data[0].color);
    
    for (var i = 1 ; i<data.length; i++) {
    console.log("from: "+data[i].from.title + "  "+ data[i].from.group + " " + data[i].from.groupID + " " + data[i].from.groupSize + "  to: " + data[i].to.title  + "  "+ data[i].to.group + " " + data[i].to.groupID + " " + data[i].to.groupSize );
        first = getNode(data[i].from.url);
        second = getNode(data[i].to.url);
        if ((first!=null) && (second!=null)) {
            addEdge(first, second, data[i].color);
        }
        else if (first!=null) {
            second = new node(data[i].to, data[i].to.group, data[i].to.groupID, data[i].to.groupSize, data[i].to.infoString, getRandomColor());
            second.initialize();
            nodes.push(second);
            if (second.groupID == 0) {
                second.setCoords( (Math.random()*400 - 200), (Math.random()*400 - 200), ((second.group * -300) + 300));
            }
            else {
                var angle = (2*Math.PI)/(second.groupSize - 1);
                //second.setCoords( 600*Math.cos((Math.random() * second.groupSize)*angle), 600*Math.sin((Math.random() * second.groupSize)*angle), (second.group * - 150) + 300);
                coordList = getGroupCenter(second);
                second.setCoords( 250*Math.cos(2*Math.PI*second.groupID/(second.groupSize - 1)) + coordList[0], 250*Math.sin(2*Math.PI*second.groupID/(second.groupSize - 1)) + coordList[1], ((second.group * -300) + 300));
                console.log( "groupSize: " + second.groupSize + ", groupID: " + second.groupID);            
        }
            
            addEdge(first, second, data[i].color);
        }
        else if (second!=null) {
            first = new node(data[i].from, data[i].from.group, data[i].from.groupID, data[i].from.groupSize, data[i].from.infoString , getRandomColor());
            first.initialize();
            nodes.push(first);
            if (first.groupID == 0) {
                first.setCoords( (Math.random()*400 - 200), (Math.random()*400 - 200), (first.group * -300) + 300);
            }
            else {
                var angle = (2*Math.PI)/(first.groupSize - 1);
                coordList = getGroupCenter(first);
                first.setCoords( 250*Math.cos(2*Math.PI*first.groupID/(first.groupSize - 1)) + coordList[0], 250*Math.sin(2*Math.PI*first.groupID/(first.groupSize - 1)) + coordList[1], ((first.group * -300) + 300));
                console.log( "groupSize: " + first.groupSize + ", groupID: " + first.groupID);
            }
            
            addEdge(first, second, data[i].color);
        }
        else {
            console.log("REEEEThis should never happen");
        }
        console.log();
    }

    updateLabels();


    curEdgeIndex = edgeList.length - 1;

    curNode = getNode(edgeList[curEdgeIndex].to.url);

    cameraTarget(curNode);

    updateSidebar(curNode.relatedNode);

    $("#forwardButton").click(goForward);
    $("#backButton").click(goBackward);



}

function node(relatedNodey, g, gID, gS, infoSt, c) {
    this.color = c;
    this.relatedNode = relatedNodey;
    this.name = this.relatedNode.title;
    this.url = this.relatedNode.url;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.mesh = null;
    this.label = null;
    this.group = g;
    this.groupID = gID;
    this.groupSize = gS;
    this.infoString = infoSt;

    this.edgeVectors = [];

    this.initialize = function() {
        var material = new THREE.MeshBasicMaterial({color: c});
        var geometry = new THREE.SphereGeometry(32, 32, 32);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh["nodey"] = this;
        this.label = makeTextSprite( this.name, { fontsize: 24, backgroundColor: {r:255, g:100, b:100, a:1} } );
        bigObject.add( this.label);
        bigObject.add(this.mesh);
        objects.push(this.mesh);
    };

    this.setX = function(xx) {
                    this.x = xx;
                    this.mesh.position.x = xx;
                };
    this.setY = function(yy) {
                    this.y = yy;
                    this.mesh.position.y = yy;
                };
    this.setZ = function(zz) {
                    this.z = zz;
                    this.mesh.position.z = zz;
                };
    this.setCoords = function(xx,yy,zz) {
                    this.x = xx;
                    this.mesh.position.x = xx;
                    this.y = yy;
                    this.mesh.position.y = yy;
                    this.z = zz;
                    this.mesh.position.z = zz;
                    var zAdd = (Math.abs(zz) * (-15 / 240) + 15);
                    //if (zz<0) 
                        //zAdd = -zAdd;
                    //this.label.position = (new THREE.Vector3(xx + (Math.abs(xx) * (-5 / 240) + 5), yy + (Math.abs(yy) * (-5 / 240) + 5), zz + zAdd)).multiplyScalar(1.1);
                    this.label.position = (new THREE.Vector3());
                    updateLabels();
                };
    this.updateLocation = function() {
                    this.x = this.mesh.position.x;
                    this.y = this.mesh.position.y;
                    this.z = this.mesh.position.z;
                    for (var i = 0; i<this.edgeVectors.length; i++) {
                        console.log(this.edgeVectors[i]);
                        this.edgeVectors[i].set(this.mesh.position.x, this.mesh.position.y,this.mesh.position.z);
                    }
                    this.label.position = (new THREE.Vector3());
                    updateLabels();
                };


}

function updateLabels() {

    var cameraDistance = Math.sqrt(Math.pow(camera.position.x,2) + Math.pow(camera.position.y,2) + Math.pow(camera.position.z,2));

    var scaledDownCameraX = (camera.position.x );
    var scaledDownCameraY = (camera.position.y);
    var scaledDownCameraZ = (camera.position.z);


    //console.log("scaledx: " + scaledDownCameraX + "  scaledy: " + scaledDownCameraY + "  scaledz: " + scaledDownCameraZ);
    
    var curNode = null;
    for (var i = 0; i < nodes.length; i++) {
        curNode = nodes[i];
        var scalar = 40 / Math.sqrt(Math.pow(scaledDownCameraX - curNode.x, 2) + Math.pow(scaledDownCameraY - curNode.y, 2) +  Math.pow(scaledDownCameraZ - curNode.z, 2) );
        
        curNode.label.position.x = curNode.x - (scalar * (-scaledDownCameraX + curNode.x));
        curNode.label.position.y = curNode.y - (scalar * (-scaledDownCameraY + curNode.y));
        curNode.label.position.z = curNode.z - (scalar * (-scaledDownCameraZ + curNode.z));
        //console.log("Node["+i+"]  x: " + curNode.x + "   labelX: " + curNode.label.position.x);
        //console.log("Node["+i+"]  y: " + curNode.y + "   labelY: " + curNode.label.position.y);
        //console.log("Node["+i+"]  z: " + curNode.z + "   labelZ: " + curNode.label.position.z);

    }
}

function addEdge(node1, node2, c) {
    var co;
    if (c=="gray") {
        co = 0xcccccc;
    }
    else if (c=="black") {
        co = 0x000000;
    }

    var material = new THREE.LineBasicMaterial({color: co, linewidth: 3 });

    var geometry = new THREE.Geometry();
    var firstVector = new THREE.Vector3(node1.x,node1.y,node1.z);
    node1.edgeVectors.push(firstVector);
    geometry.vertices.push(firstVector);
    var secondVector = new THREE.Vector3(node2.x,node2.y,node2.z);
    node1.edgeVectors.push(secondVector);
    geometry.vertices.push(secondVector);

    //var line = new THREE.Line(geometry, material);
    var direction = new THREE.Vector3().subVectors(secondVector, firstVector).normalize();
    if (c=="gray") {
        var arrow = new THREE.ArrowHelper(direction, firstVector, computeDistance(node1, node2) - 64, co);
    }
    else if (c=="black") {
        var arrow = new THREE.ArrowHelper(direction, firstVector, computeDistance(node1, node2) - 32, co);
    }
    bigObject.add(arrow);
    
}

function computeDistance(n1, n2) {

    return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y , 2) + Math.pow(n1.z - n2.z, 2))

}

function makeTextSprite( message, parameters )
{
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ? 
        parameters["fontface"] : "Arial";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
        parameters["fontsize"] : 18;
    
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
        parameters["borderThickness"] : 4;
    
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //  parameters["alignment"] : THREE.SpriteAlignment.topLeft;

    //var spriteAlignment = THREE.SpriteAlignment.topLeft;
        

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    //var spriteMaterial = new THREE.SpriteMaterial( 
    //    { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var spriteMaterial = new THREE.SpriteMaterial( 
        { map: texture, useScreenCoordinates: false } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;  
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}



function addMouseHandler()
{
    var dom = renderer.domElement;

    dom.addEventListener( 'mousemove', onMouseMove, false);
    dom.addEventListener( 'mousedown', onMouseDown, false);
    dom.addEventListener( 'mouseup' , onMouseUp, false);
}

function onMouseDown(event)
{
    event.preventDefault();
    isMouseDown = true;
                var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
                projector.unprojectVector( vector, camera );

                var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

                var intersects = raycaster.intersectObjects( objects );

                if ( intersects.length > 0 ) {

                    //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
                    curNode = intersects[0].object.nodey;
                    cameraTarget(curNode);
                    updateSidebar(curNode.relatedNode);
                    for (var i = 0; i<edgeList.length; i++) {
                        if (curNode===getNode(edgeList[i].to.url)) {
                            curEdgeIndex = i;
                        }

                    }
                    if (curNode===getNode(edgeList[0].from.url)) {
                        curEdgeIndex = -1;
                    }

                }
    
}   
function onMouseUp (event) {
    event.preventDefault();
    isMouseDown = false;

}

function onMouseMove( event ) {
    event.preventDefault();

    if (isMouseDown) {
        updateLabels();
    }
    
}

function goForward() {
    var foundNext = false;
    var startIndex = curEdgeIndex;
    while (!foundNext) {
        if (curEdgeIndex<0) {
            if (edgeList[++curEdgeIndex].type != "onOtherUpdated") {
                curNode = getNode(edgeList[curEdgeIndex].to.url);
                cameraTarget(curNode);
                updateSidebar(curNode.relatedNode);
                foundNext = true;
            }
        }
        else if (curEdgeIndex<(edgeList.length - 1)) {
            if (edgeList[++curEdgeIndex].type != "onOtherUpdated") {
                curNode = getNode(edgeList[curEdgeIndex].to.url);
                cameraTarget(curNode);
                updateSidebar(curNode.relatedNode);
                foundNext = true;
            }
        }
        else {
            curEdgeIndex = startIndex;
            break;
        }
    }
}

function goBackward() {
    var foundNext = false;
    var startIndex = curEdgeIndex;
    while (!foundNext) {
        if (curEdgeIndex>0) {
            if (edgeList[--curEdgeIndex].type != "onOtherUpdated") {
                curNode = getNode(edgeList[curEdgeIndex].to.url);
                cameraTarget(curNode);
                updateSidebar(curNode.relatedNode);
                foundNext = true;
            }
        }
        else if (curEdgeIndex==0) {
            if (edgeList[curEdgeIndex].type != "onOtherUpdated") {
                curNode = getNode(edgeList[--curEdgeIndex + 1].from.url);
                cameraTarget(curNode);
                updateSidebar(curNode.relatedNode);
                foundNext = true;
            }
        }
        else {
            curEdgeIndex = startIndex
            break;
        }
    }

}

function cameraTarget(node) {

    controls.target.set(node.x, node.y, node.z);

}

function updateSidebar(relatedNode) {
    $("#title").html("TITLE: " + relatedNode.title + "<br>");
    $("#url").html("URL: " + relatedNode.url + "<br>");
    $("#visits").html("VISITED " + relatedNode.visits + " TIMES <br>");

    var visitTimestampString = "";
    for (var i = 0; i<relatedNode.visitTimestamps.length; i++) {
        visitTimestampString += "start:<br> ";
        visitTimestampString += (new Date(relatedNode.visitTimestamps[i].start)).toUTCString();
        visitTimestampString += "<br>end:<br>";
        visitTimestampString += (new Date(relatedNode.visitTimestamps[i].end)).toUTCString() + "<br>";
    }
    $("#visitTimes").html("VISITS:<br> " + visitTimestampString + "<br>");

    var loadTimestampString = "";
    for (var i = 0; i<relatedNode.loadTimestamps.length; i++) {
        loadTimestampString += "start:<br>";
        loadTimestampString += (new Date(relatedNode.loadTimestamps[i].start)).toUTCString();
        loadTimestampString += "<br>end:<br> ";
        loadTimestampString += (new Date(relatedNode.loadTimestamps[i].end)).toUTCString() + "<br>";
    }
    $("#loadTimes").html("LOADS:<br>" + loadTimestampString + "<br>");

    var idleTimestampString = "";
    for (var i = 0; i<relatedNode.idleTimestamps.length; i++) {
        idleTimestampString += "start:<br>";
        idleTimestampString += (new Date(relatedNode.idleTimestamps[i].start)).toUTCString();
        idleTimestampString += "<br>end:<br> ";
        idleTimestampString += (new Date(relatedNode.idleTimestamps[i].end)).toUTCString() + "<br>";
    }
    $("#idleTimes").html("IDLE TIMES:<br>" + idleTimestampString + "<br>");

    $("#refreshes").html("REFRESHES: " + relatedNode.refreshes + "<br>");

}

function runIt() {
   // Render the scene

    requestAnimationFrame(runIt);
    
    renderer.render( scene, camera );

    controls.update();
    stats.update();
     
}











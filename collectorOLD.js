var nodeList = new Array(); //stores all of the Nodes in the graph
var graphicNodeList = new Array();
var groupSizes = new Array();
var prevNode = null;
var prevTimestamp = null;
var log = "";
var actionNum = 0;



function Timestamp() {
    //keeps track of how long someones stays on a page
    this.start = null;
    this.end = null;
};

function Traversal() {
    //contains information about navigation between two pages
    this.node1 = null;
    this.node2 = null;
    this.directionList = new Array();
    this.typeList = new Array();
    this.timeList = new Array();
};

function Node()  {
    //contains information about a page that has been browsed
    this.group = 0;
    this.groupID = 0;
    this.nextGroup = 0;
    this.nextGroupID = 0;
    this.groupSize = 0;

    this.url = null;
    this.title = null;
    this.timestampList = new Array();
    this.traversalList = new Array();
    this.refreshes = new Array();
};

function simplifyNode(n) {
    return {title: n.title, url: n.url, group:n.group, groupID:n.groupID};
}

function updateTitle(nodeUrl, nodeTitle) {
    /*
    for (var i = 0; i<nodeList.length; i++) {
        if (nodeUrl == nodeList[i].url) {
            nodeList[i].title = nodeTitle;
            console.log(nodeList[i]);
        }
    }
    
    for (var i = 0; i<graphicNodeList.length; i++) {
        console.log("URL: " + nodeUrl + "   nodeTITLE: " +nodeTitle);
        if (graphicNodeList[i].from.url == nodeUrl) {

            graphicNodeList[i].from.title = nodeTitle;
            return;
        }
        else if (graphicNodeList[i].to.url == nodeUrl) {

            graphicNodeList[i].to.title = nodeTitle;
            return;
        }
    }
    */
     

}

var checkNode = function(tempNode) {
    //checks to see if a node is already in our list of nodes
    //log+= "CHECK : tempURL -- " + tempNode.url + "\n";
    for (var i = 0; i<nodeList.length; i++) {
        //log += "looking at i: " + i + " -- url: " + nodeList[i].url + "\n";
        if (tempNode.url == nodeList[i].url) {
            //log+="SUCCCCCESSSSS!!\n";
            return nodeList[i];
        }
    }
    return null;
};

var checkTraversal = function(tList, url) {
    //checks if a traversal is in a particular nodes' traversal list, returns the traversal object if it is there, returns null otherwise
    for (var i = 0; i<tList.length; i++) {
        if ((tList[i].node1.url == url) || (tList[i].node2.url == url)) {
            return tList[i];
        }
    }
    return null;
};


var action = function(tab, type) {
    //meat of the collector.js backgroud script, gets called whenever pages are loaded and constructs the information gathered by page loads

    log += "action " + actionNum + "  --  " + type + "\n";
    actionNum++;

    var time = (new Date()).getTime();
    var curNode = new Node();
    var tempTraversal = new Traversal();
    var tempTimestamp = new Timestamp();
    curNode.url = tab.url;
    curNode.title = tab.title;
    

    if (!((curNode.title == "") || (curNode.title == "") || (curNode.title.substring(0,22) == "https://www.google.com")|| (curNode.title.substring(0,22) == "https://www.google.com")  || (curNode.title.substring(0,14) == "www.google.com") || (curNode.title.substring(0,14) == "www.google.com") || curNode.title.substring(0,16) == "chrome-extension" || curNode.title == "GraphsGraphsGraphs" || curNode.title == "Your Titles" ) ) {
        //TODO better handling of corner cases

        if (prevNode!=null) { //not the first page
            
            if (prevNode.url != curNode.url) { //check page isn't being refreshed

                
                //used only for print statements
                var time = (new Date()).getTime();
                dddd = new Date(); 
                dddd.setTime(time);


                var check = checkNode(curNode);
                if (check!=null) {
                    //another node exists with this url

                    curNode = check;
                    var traverseCheck = checkTraversal(curNode.traversalList, prevNode.url);

                    if (traverseCheck!=null) { //this traversal already exists
                        log+= "existing traversal\n";
                        tempTraversal = traverseCheck;
                        traverseCheck.timeList.push(time);


                        if (type == "onActivated") {
                            tempTraversal.typeList.push("highlight");
                            log+= "EXISTING HIGHLIGHT From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "gray"});
                            prevTimestamp.end = time;
                            tempTimestamp.start = time;
                            prevTimestamp = tempTimestamp;
                            curNode.timestampList.push(tempTimestamp);
                        }
                        else if (type == "onCurrentUpdated") {
                            tempTraversal.typeList.push("hardLink");
                            log+= "EXISTING HARDLINK From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                            prevTimestamp.end = time;
                            tempTimestamp.start = time;
                            prevTimestamp = tempTimestamp;
                            curNode.timestampList.push(tempTimestamp);
                        }
                        else if (type == "onOtherUpdated") {
                            tempTraversal.typeList.push("softLink");
                            log+= "EXISTING SOFTLINK From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " +dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                        }
                        log += "\n\n";

                        if (traverseCheck.node1.url == curNode.url) {
                            traverseCheck.directionList.push(-1);
                        }
                        else if (traverseCheck.node2.url == curNode.url) {
                            traverseCheck.directionList.push(1);
                        }
                        else {
                            log += "should never happen!";
                        }


                    }
                    else { //this is a new traversal, existing nodes
                        tempTraversal.node1 = prevNode;
                        tempTraversal.node2 = curNode;

                        tempTraversal.timeList.push(time);

                        if (type == "onActivated") {
                            tempTraversal.typeList.push("highlight");
                            log+= "HALFNEW HIGHLIGHT From: " + prevNode.title + "  ----- To: " + curNode.title +  "  --  " +dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "gray"});
                            prevTimestamp.end = time;
                            tempTimestamp.start = time;
                            prevTimestamp = tempTimestamp;
                            curNode.timestampList.push(tempTimestamp);
                        }
                        else if (type == "onCurrentUpdated") {
                            tempTraversal.typeList.push("hardLink");
                            log+= "HALFNEW HARDLINK From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                            prevTimestamp.end = time;
                            tempTimestamp.start = time;
                            prevTimestamp = tempTimestamp;
                            curNode.timestampList.push(tempTimestamp);
                        }
                        else if (type == "onOtherUpdated") {
                            tempTraversal.typeList.push("softLink");
                            log+= "HALFNEW SOFTLINK From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                            graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                        }
                        log += "\n\n";

                        tempTraversal.directionList.push(1);


                        prevNode.traversalList.push(tempTraversal);
                        curNode.traversalList.push(tempTraversal);
                        prevTimestamp.end = time;

                    }
                }
                else {
                    //no existing node with same URL

                    tempTraversal.node1 = prevNode;
                    tempTraversal.node2 = curNode;

                    tempTraversal.timeList.push(time);

                    if (type == "onActivated") { 
                        //only happens if someone highlights a page before it has finished loading
                        tempTraversal.typeList.push("highlight");
                        log+= "NEW HIGHLIGH From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                        curNode.group = prevNode.group;
                        curNode.groupID = prevNode.groupID++;
                        curNode.nextGroup = prevNode.nextGroup + 1;
                        graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "gray"});
                        prevTimestamp.end = time;
                        tempTimestamp.start = time;
                        prevTimestamp = tempTimestamp;
                        curNode.timestampList.push(tempTimestamp);
                    }
                    else if (type == "onCurrentUpdated") {
                        tempTraversal.typeList.push("hardLink");
                        log+= "NEW HARDLINK From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                        curNode.group = prevNode.group + 1;
                        groupSizes.push(1);
                        prevNode.nextGroup++;
                        curNode.groupID = 0;
                        curNode.nextGroup = prevNode.nextGroup + 1;
                        curNode.nextGroupID = 1;
                        prevTimestamp.end = time;
                        tempTimestamp.start = time;
                        prevTimestamp = tempTimestamp;
                        curNode.timestampList.push(tempTimestamp);
                        graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                    }
                    else if (type == "onOtherUpdated") {
                        tempTraversal.typeList.push("softLink");
                        log+= "NEW SOFTLINK ON OTHER From: " + prevNode.title + "  ----- To: " + curNode.title + "  --  " + dddd.toTimeString();
                        curNode.group = prevNode.group;
                        groupSizes[curNode.group]++;
                        curNode.nextGroup = prevNode.nextGroup;
                        curNode.groupID = prevNode.nextGroupID;
                        prevNode.nextGroupID++;
                        curNode.nextGroupID = 0;
                        graphicNodeList.push({from: simplifyNode(prevNode), to: simplifyNode(curNode), color: "black"});
                    }
                    log += "\n\n";


                    tempTraversal.directionList.push(1);


                    prevNode.traversalList.push(tempTraversal);
                    curNode.traversalList.push(tempTraversal);
                    

                    nodeList.push(curNode);
                    
                } 
                if (type != "onOtherUpdated") {
                    prevNode = curNode;
                    prevTimestamp = tempTimestamp;
                }    
            }
            else {
                //prevNode and curNode are the same url
                prevNode.refreshes.push(time);
                log+= "refresh \n\n";
            }
        }
        else {
            //prevNode is null, this is first load
            tempTimestamp.start = time;
            curNode.timestampList.push(tempTimestamp);
            curNode.group = 0;
            groupSizes.push(1);
            curNode.groupID = 0;
            curNode.nextGroup = 1;
            curNode.nextGroupID = 1;
            prevNode = curNode;
            prevTimestamp = tempTimestamp;
            log += "starting... " + curNode.title + "\n\n";
            nodeList.push(curNode);
        }
    }
    
    
    
    
};




function listString() {
    var s = [];

    for (var i = 0; i<nodeList.length; i++) {
        var temp = "NODE " + i + " ---------- TITLE: " + nodeList[i].title + "---------- URL:  " + nodeList[i].url;
        s.push(temp);
        s.push(" ");
        for (var j = 0; j<nodeList[i].timestampList.length; j++) {
            var starter = new Date();
            var ender = new Date();
            starter.setTime(nodeList[i].timestampList[j].start);
            ender.setTime(nodeList[i].timestampList[j].end);
            s.push(" " + j + ": -- START: " +  starter.toTimeString() + " -- END: " + ender.toTimeString());
        }
        s.push("\n REFRESHES: ");
        for (var j = 0; j<nodeList[i].refreshes.length; j++) {
            var ttt = new Date();
            ttt.setTime(nodeList[i].refreshes[i]);
            s.push(ttt.toTimeString());
        }
        s.push(" ");
        for (var j =0; j<nodeList[i].traversalList.length; j++) {
            var timeString = "";
            for (var k = 0; k<nodeList[i].traversalList[j].timeList.length; k++) {
                var timey = new Date();
                timey.setTime(nodeList[i].traversalList[j].timeList[k]);
                timeString += ",  " + k + " - TIME: " + timey.toTimeString() + " - TYPE: " + nodeList[i].traversalList[j].typeList[k] ;

            }
            s.push(" " + j + ": -- N1: " + nodeList[i].traversalList[j].node1.title + " -- N2: " + nodeList[i].traversalList[j].node2.title + 
                    " -- DIR: " + nodeList[i].traversalList[j].directionList +  " ---- TIMES: " + timeString);
        }
        s.push("------------------------------------------------------------------");
        s.push("------------------------------------------------------------------");
        s.push("------------------------------------------------------------------");
        
    }
    return s;
};

function getInfoString(gn) {
    var curNode = null;
    for (var i = 0; i< nodeList.length; i ++) {
        if (gn.url == nodeList[i].url) {
            curNode = nodeList[i];
        }
    }
    var infoString = "";
    if (curNode != null) {
        infoString += "\nTITLE:  " + curNode.title;
        infoString += "\nURL:    " + curNode.url;
        infoString += "\nTIMESTAMPS: \n";
        for (var i = 0; i<curNode.timestampList.length; i++) {
            infoString += "START: " + ((new Date(curNode.timestampList[i].start)).toTimeString()) + "    END: " + ((new Date(curNode.timestampList[i].end)).toTimeString()) + "     DURATION " + ((curNode.timestampList[i].end - curNode.timestampList[i].start)/1000 ) + " seconds "  + "\n";
        }
        infoString += "\nTRAVERSALS: \n";
        for (var i = 0; i<curNode.traversalList.length; i++) {
            if (curNode.traversalList[i].node1 == curNode) {
                infoString+= "to: " + curNode.traversalList[i].node2.title + "\n";
                for (var j = 0; j<curNode.traversalList[i].directionList.length; j++) {
                    infoString+= j + " " +curNode.traversalList[i].directionList[j] + "   TYPE: "  + curNode.traversalList[i].typeList[j] + "\n";
                }
                for (var j = 0; j<curNode.traversalList[i].directionList.length; j++) {
                    infoString+= i + " at " + ((new Date(curNode.traversalList[i].timeList[j])).toTimeString()) + "\n";
                }
            } 
            else {
                infoString+= "to: " +  curNode.traversalList[i].node1.title + "\n";
                for (var j = 0; j<curNode.traversalList[i].directionList.length; j++) {
                    infoString += j + " " +curNode.traversalList[i].directionList[j] +  "   TYPE: "  + curNode.traversalList[i].typeList[j] + "\n";
                }
                for (var j = 0; j<curNode.traversalList[i].directionList.length; j++) {
                    infoString += j + " at " + ((new Date(curNode.traversalList[i].timeList[j])).toTimeString()) + "\n";
                }
            }
        }
    }
    return infoString;
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "request") {
        sendResponse({content: listString()});
    }
    else if (request.greeting == "log"){
        sendResponse({message: log});
    }
    else if (request.greeting == "graphData") {
        for (var i = 0; i < graphicNodeList.length; i++) {
            graphicNodeList[i].from.infoString = getInfoString(graphicNodeList[i].from);
            graphicNodeList[i].to.infoString = getInfoString(graphicNodeList[i].to);
            graphicNodeList[i].from.groupSize = groupSizes[graphicNodeList[i].from.group];
            graphicNodeList[i].to.groupSize = groupSizes[graphicNodeList[i].to.group];
        }
        sendResponse({data: graphicNodeList, size: nodeList.length});
    }
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab){
        action(tab, "onActivated");
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        if (tab.highlighted) {
            action(tab, "onCurrentUpdated");
        }
        else {
            action(tab, "onOtherUpdated");
        }
    }
    else if (changeInfo.status == "complete") {
        updateTitle(tab.url, tab.title);
    }
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({'url': chrome.extension.getURL('graphic.html')}, function(tab) {
    });
});
/*
chrome.windows.onRemoved.addListener(function(windowId) {
    for (var i = 0; i < graphicNodeList.length; i++) {
            graphicNodeList[i].from.infoString = getInfoString(graphicNodeList[i].from);
            graphicNodeList[i].to.infoString = getInfoString(graphicNodeList[i].to);
        }
    var myData = JSON.stringify(graphicNodeList);
    $.ajax({
        type: "POST",
        url: "http://www.elliotkorte.com/request.php",
        data: {'myData':myData},
        success: function() {
            console.log("SUCCESSSSS");
        }
    });
});
*/
























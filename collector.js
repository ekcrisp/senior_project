var edgeList = new Array();
var nodeList = new Array();
var prevNode = null;
var prevVisitTimestamp = null;
var prevLoadTimestamp = null;
var prevVisitTimestampDisplay = null;
var prevLoadTimestampDisplay = null;
var groupSizes = new Array();

function Timestamp() {
    //keeps track of how long someones stays on a page
    this.start = null;
    this.end = null;
};


function Node() {
	//properties related to the webpage
	this.url = "";
	this.title = "";
	this.visits = 0;
	this.visitTimestamps = new Array();
	this.loadTimestamps = new Array();
	this.refreshes = new Array();
	this.completedLoads = new Array();

	//properties for drawing the graph and displaying information
	this.group = 0;
    this.groupID = 0;
    this.nextGroup = 0;
    this.nextGroupID = 0;
    this.groupSize = 0;
    this.visitTimestampsDisplay = new Array();
	this.loadTimestampsDisplay = new Array();


}

function findNode(url) {
	//todo
	for (var i = 0; i<nodeList.length; i++) {
		if (url == nodeList[i].url) {
			return nodeList[i];
		}
	}
	return null;
}

function action(tab, type, completed) {
	//meat of the collector, gets called whenever a page is highlighted, or loaded
	var curTime = (new Date()).getTime();
	var curTimeDisplay = (new Date(curTime)).toUTCString();

	if (prevNode==null) {
		//this is the first page load
		var curNode = new Node();
		curNode.url = tab.url;
		curNode.title = tab.title;
		var curLoadTimestamp = new Timestamp();
		curLoadTimestamp.start = curTime;
		var curVisitTimestamp = new Timestamp();
		curVisitTimestamp.start = curTime; 
		curNode.visitTimestamps.push(curVisitTimestamp);
		curNode.loadTimestamps.push(curLoadTimestamp);
		curNode.visits++;
		curNode.completedLoads.push(false);

		curNode.group = 0;
        groupSizes.push(1);
        curNode.groupID = 0;
        curNode.nextGroup = 1;
        curNode.nextGroupID = 1;
        var curLoadTimestampDisplay = new Timestamp();
		curLoadTimestampDisplay.start = curTimeDisplay;
		var curVisitTimestampDisplay = new Timestamp();
		curVisitTimestampDisplay.start = curTimeDisplay;
		curNode.visitTimestampsDisplay.push(curVisitTimestampDisplay);
		curNode.loadTimestampsDisplay.push(curLoadTimestampDisplay);		

		nodeList.push(curNode);
        prevNode = curNode;


	}
	else {
		if (completed) {
			//find node that finished loading and update values
			var curNode = findNode(tab.url);
			if (curNode==null) {
				console.log("COMPLETED NODE NULL, SHOULD NEVER HAPPEN\n");
				return;
			}
			curNode.title = tab.title;
			curNode.loadTimestamps[curNode.loadTimestamps.length - 1].end = curTime;
			curNode.loadTimestampsDisplay[curNode.loadTimestampsDisplay.length - 1].end = curTimeDisplay;
			curNode.completedLoads[curNode.completedLoads.length - 1] = true;
			return;

		}
		else {
			var curNode = findNode(tab.url);

			if (curNode==null) { //this is a new page
				
				curNode = new Node();
				curNode.url = tab.url;
				curNode.title = tab.title;
				var curLoadTimestamp = new Timestamp();
				curLoadTimestamp.start = curTime;
				curNode.loadTimestamps.push(curLoadTimestamp);
				var curLoadTimestampDisplay = new Timestamp();
				curLoadTimestampDisplay.start = curTimeDisplay;
				curNode.loadTimestampsDisplay.push(curLoadTimestampDisplay);

				if (type=="onCurrentUpdated") {
					var curVisitTimestamp = new Timestamp();
					curVisitTimestamp.start = curTime; 
					curNode.visitTimestamps.push(curVisitTimestamp);
					curNode.visits++;
					curNode.completedLoads.push(false);

					curNode.group = prevNode.nextGroup;
			        groupSizes.push(1);
			        curNode.groupID = 0;
			        curNode.nextGroup = prevNode.nextGroup + 1;
			        curNode.nextGroupID = 1;
			        
					var curVisitTimestampDisplay = new Timestamp();
					curVisitTimestampDisplay.start = curTimeDisplay;
					curNode.visitTimestampsDisplay.push(curVisitTimestampDisplay);

					prevNode.visitTimestamps[prevNode.visitTimestamps.length - 1].end = curTime;

					edgeList.push({from: prevNode, to: curNode, type: "onCurrentUpdated", color: "black"});
					nodeList.push(curNode);
			        prevNode = curNode;
		    	}
		    	else if (type=="onOtherUpdated") {
					
					curNode.group = prevNode.group;
					groupSizes[prevNode.group]++;
			        curNode.groupID = prevNode.nextGroupID++;
			        curNode.nextGroup = prevNode.nextGroup;
			        curNode.nextGroupID = 0;

			        curNode.completedLoads.push( false);

					prevNode.visitTimestamps[prevNode.visitTimestamps.length-1].end = curTime;

					nodeList.push(curNode);
					edgeList.push({from: prevNode, to: curNode, type: "onOtherUpdated", color: "black"})	
			        

		    	}
		    	else {
		    		console.log("NEW NODE HIGHLIGHT SHOULD NEVER HAPPEN\n");
		    	}

			}
			else if (curNode === prevNode) { //this node is a refresh

				curNode.refreshes.push(curTime);
				var curLoadTimestamp = new Timestamp();
				curLoadTimestamp.start = curTime;
				curNode.loadTimestamps.push(curLoadTimestamp);
				var curLoadTimestampDisplay = new Timestamp();
				curLoadTimestampDisplay.start = curTimeDisplay;
				curNode.loadTimestampsDisplay.push(curLoadTimestampDisplay);

			}
			else { //this node already exists
				

				if (type=="onCurrentUpdated") {
					var curLoadTimestamp = new Timestamp();
					curLoadTimestamp.start = curTime;
					curNode.loadTimestamps.push(curLoadTimestamp);
					var curLoadTimestampDisplay = new Timestamp();
					curLoadTimestampDisplay.start = curTimeDisplay;
					curNode.loadTimestampsDisplay.push(curLoadTimestampDisplay);

					var curVisitTimestamp = new Timestamp();
					curVisitTimestamp.start = curTime; 
					curNode.visitTimestamps.push(curVisitTimestamp);
					curNode.visits++;
					curNode.completedLoads.push( false);
			        
					var curVisitTimestampDisplay = new Timestamp();
					curVisitTimestampDisplay.start = curTimeDisplay;
					curNode.visitTimestampsDisplay.push(curVisitTimestampDisplay);

					prevNode.visitTimestamps[prevNode.visitTimestamps.length - 1].end = curTime;

					edgeList.push({from: prevNode, to: curNode, type: "onCurrentUpdated", color: "black"});
			        prevNode = curNode;

				}
				else if (type=="onOtherUpdated") {
					var curLoadTimestamp = new Timestamp();
					curLoadTimestamp.start = curTime;
					curNode.loadTimestamps.push(curLoadTimestamp);
					var curLoadTimestampDisplay = new Timestamp();
					curLoadTimestampDisplay.start = curTimeDisplay;
					curNode.loadTimestampsDisplay.push(curLoadTimestampDisplay);

					curNode.completedLoads.push( false);

					prevNode.visitTimestamps[prevNode.visitTimestamps.length-1].end = curTime;

					edgeList.push({from: prevNode, to: curNode, type: "onOtherUpdated", color: "black"});

				}
				else if (type=="onHighlight") {
					prevNode.visitTimestamps[prevNode.visitTimestamps.length-1].end = curTime;

					var curVisitTimestamp = new Timestamp();
					curVisitTimestamp.start = curTime; 
					curNode.visitTimestamps.push(curVisitTimestamp);
					curNode.visits++;

					edgeList.push({from: prevNode, to: curNode, type: "onOtherUpdated", color: "gray"});

					prevNode = curNode;
				}

			}
		}

	}
}




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if (request.greeting == "log"){
        sendResponse({message: "no log at this time"});
    }
    else if (request.greeting == "graphData") {
    	for (var i =0; i<nodeList.length; i++) {
    		nodeList[i].groupSize = groupSizes[nodeList[i].group];
    	}
        sendResponse({data: edgeList, size: nodeList.length});
    }
});



chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab){
        action(tab, "onHighlight");
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        if (tab.highlighted) {
            action(tab, "onCurrentUpdated", false);
        }
        else {
            action(tab, "onOtherUpdated", false);
        }
    }
    else if (changeInfo.status == "complete") {
        action(tab, "completion", true);
    }
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({'url': chrome.extension.getURL('graphic.html')}, function(tab) {
    });
});
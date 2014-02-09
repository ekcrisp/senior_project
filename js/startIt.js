

document.addEventListener('DOMContentLoaded', function () {


    chrome.runtime.sendMessage({greeting: "graphData"}, function(response) {
  
        initializeBuilder(document.getElementById("container"));
        
        generateGraph(response.data, response.size);

        runIt();
    });

});
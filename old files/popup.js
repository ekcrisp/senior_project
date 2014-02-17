
document.addEventListener( 'mousedown', onMouseDown, false );

function onMouseDown(event)
{
    chrome.runtime.sendMessage({greeting: "log"}, function(response) {
        console.log(response.message);
    });
    
}

document.addEventListener('DOMContentLoaded', function () {
    
    chrome.runtime.sendMessage({greeting: "request"}, function(response) {
        
        var curActionList = response.content;
    
        for (var i = 0; i < curActionList.length; i++) {
            var txtNode2 = document.createTextNode(curActionList[i]);
            document.getElementById("actions").appendChild(txtNode2);
            document.getElementById("actions").appendChild(document.createElement("br"));
        }
    });
});

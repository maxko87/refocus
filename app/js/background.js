var progList = [];

function onClickHandler(info, tab) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "focus_on_text"}, function(response) {});
  });
};

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
  var id = chrome.contextMenus.create({"title": "Focus on Selection", "contexts": ["selection"],
                                         "id": "context_selection"});
});

chrome.contextMenus.onClicked.addListener(onClickHandler);


//figure out how sendResponse works... may be useful, not sure yet
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if (request.action == "add_to_proglist"){
		addToProg([request.url, request.title]);
		sendResponse({farewell:"progList:" + progList});
		console.log(progList);
		//only need to keep title + URL
	}
	if (request.action == "remove_from_proglist"){
		removeFromProg(request.url); //need to get item from somewhere...
	}
});


//add to saved progress list
function addToProg(item) {
	progList.push(item); //add item to progress list
	
	//refresh all of the other tabs to update the list
	//chrome.tabs.sendMessage({action: "update_proglist_add"}, function(response) {});
}

//remove from saved progress list
function removeFromProg(url) {
	//search for url in the list, then splice
	var ind = progList.indexOf(url);
	progList.splice(ind, 1);
	
	//refresh all of the other tabs to update the list
	//chrome.tabs.sendMessage({action: "update_proglist_remove"}, function(response) {});
}




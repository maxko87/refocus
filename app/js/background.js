

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
		sendResponse({farewell:"adding to proglist..."});
		//addToProg(item); //need to get item from somewhere...
		//only need to keep title + URL
	}
	if (request.action == "remove_from_proglist"){
		//removeFromProg(item); //need to get item from somewhere...
		//only need to keep title + URL
	}
});


//add to saved progress list
function addToProg(item) {
	progList.push(item); //add item to progress list
	
	//refresh all of the other tabs to update the list
	chrome.tabs.sendMessage({action: "update_proglist_add"}, function(response) {});
}

//remove from saved progress list
function removeFromProg(item) {
	//use splice function
	
	//refresh all of the other tabs to update the list
	chrome.tabs.sendMessage({action: "update_proglist_remove"}, function(response) {});
}




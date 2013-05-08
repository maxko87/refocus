var progList = [];

function onClickHandler(info, tab) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendMessage(tab.id, {action: "focus_on_text"}, function(response) {});
  });
};

chrome.runtime.onInstalled.addListener(function() {
  var id = chrome.contextMenus.create({"title": "Focus on Selection", "contexts": ["selection"],
                                         "id": "context_selection",
										 "onclick": onClickHandler
										 });
});

chrome.runtime.onStartup.addListener(function() {
  var id = chrome.contextMenus.create({"title": "Focus on Selection", "contexts": ["selection"],
                                         "id": "context_selection",
										 "onclick": onClickHandler
										 });
});

//set up context menu option for adding link to queue
chrome.contextMenus.create({"title": "Add to Progress List", "contexts": ["link"], 
								"id": "link_selection", 
								"onclick": function(info, tab){
									console.log('clicked context menu item');
									//var linkurl = chrome.contextMenus.onClickData.linkURL();
									chrome.tabs.sendMessage(tab.id, {action: "add_from_CM", url:info.linkURL, title: ""});
								}
							});

								
//chrome.contextMenus.onClicked.addListener(onClickHandler);


//figure out how sendResponse works... may be useful, not sure yet
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if (request.action == "add_to_proglist"){
		addToProg(request.url, request.title);
	}
	else if (request.action == "remove_from_proglist"){
		removeFromProg(request.url); //need to get item from somewhere...
	}
	else if (request.action == "populate_proglinks"){
		populate();
	}
	else if (request.action == "change_order"){
		reOrder(request.start, request.end, request.url);
	}
});

//populate progress bar when page is refreshed or changed
function populate(){
	chrome.tabs.getSelected(null, function(tab){
		for (var i=0; i<progList.length; i++){
			chrome.tabs.sendMessage(tab.id, 
				{action: "update_proglist_add", url: progList[i][0], title: progList[i][1]}, 
				function(response) {});
		}
	});
}


//add to saved progress list
function addToProg(link, name) {
	progList.push([link, name]); //add item to progress list
	
	chrome.tabs.getAllInWindow(null, function(tab){
		for (var i = 0; i<tab.length; i++){
			chrome.tabs.sendMessage(tab[i].id, {action: "update_proglist_add", url: link, title: name}, 
				function(response) {});
		}
	});
}

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.executeScript(null, {code:"$('#focusBtn').click();"});
});

//remove from saved progress list
function removeFromProg(link) {
	//search for url in the list, then splice
	var ind = progList.indexOf(link);
	progList.splice(ind, 1);
	
	chrome.tabs.getAllInWindow(null, function(tab){
		for (var i = 0; i<tab.length; i++){
			chrome.tabs.sendMessage(tab[i].id, {action: "update_proglist_remove", url: link}, 
				function(response) {});
		}
	});
}

//reorder progress list
function reOrder(start, end, link) {
	
	//reOrder progList somehow
	var item = progList[start];
	progList.splice(start, 1);
	progList.splice(end, 0, item);
	console.log(progList);
	
	chrome.tabs.getAllInWindow(null, function(tab){
		for (var i = 0; i<tab.length; i++){
			chrome.tabs.sendMessage(tab[i].id, {action: "update_proglist_reorder", url: link, start: start, end: end}, 
				function(response) {});
		}
	});
}


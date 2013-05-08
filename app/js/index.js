$(document).ready(function() {

    var SUPPORTED_SITES = ["theglobalmail"];

    var words_per_modal = 25;
    var index = 0;
    var words = []; //each element in an array [p, h] where p = text, h = html
	var proglinks = []; //list of links in progress bar, [ui.draggable.context.href, obj]
	var completed = []; //articles that user has finished reading
    var fullPageContentsRetrieved = false;
	var initialSort = false;
	
	 //this will need to be smarter about what text on the page to return.
    var MAX_CHAR_MODAL_LEN = 350;
    var MIN_CHAR_MODAL_LEN = 30;
    var SENTENCES_PER_CHUNK_PREF = 2;
	
	//populate current progress bar with saved proglinks
	chrome.extension.sendMessage({action: 'populate_proglinks'}, function(response){});
	console.log('populate proglinks message sent');

    function getSelectionHtml() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (typeof document.selection != "undefined") {
            if (document.selection.type == "Text") {
                html = document.selection.createRange().htmlText;
            }
        }
        console.log("getting selection html");
        console.log(html);
        return "<div>" + html + "</div>";
    }

    var focusHelper = function(html_of_selection){
        words = [];
        index = 0;
        $(html_of_selection).find('p, img, li, .large-image-box, .small-image-box, .story-header-image').each(function(index, current){
            /**
            if ( $(current).is('img') ){
                console.log(current);
                console.log($(current));
                var caption = "<p>" + current.alt + "</p>";
                var image = "<p>" + current + "</p>";
                var captioned_image = "<p>" + image + caption + "</p>";
                console.log(current.alt);
                console.log(caption);
                console.log(captioned_image);
                if (current.height > 100 && current.width > 100){
                    //words.push([captioned_image, captioned_image]); TODO
                    words.push([$(current).clone(), $(current).clone()]);
                }
            }
            **/
            
            if ( $(current).is('.large-image-box') ){
                console.log('large image box found');
                var $newdiv = $(current).clone();
                $newdiv.find('.attribution').remove();
                $newdiv.find('img').click(function(e){
                    e.preventDefault();
                });
                words.push([$newdiv, $newdiv]);
            }
            
            else if ( $(current).is('.small-image-box') ){
                console.log('small image box found');
                var $newdiv = $(current).clone();
                $newdiv.find('.attribution').remove();
                $newdiv.find('img').click(function(e){
                    e.preventDefault();
                });
                words.push([$newdiv, $newdiv]);
            }
            
            else if ( $(current).is('.story-header-image') ){
                console.log('story header image found');
                var $newdiv = $(current).clone();
                $newdiv.find('.attribution').remove();
                $newdiv.find('img').click(function(e){
                    e.preventDefault();
                });
                words.push([$newdiv, $newdiv]);
            }

            else {//if ( $(current).is('p') ){
                var p = $(current).text();
				console.log(p[p.length - 1]);
                
				var h = $(current).context.innerHTML;
				
                if (p.length > MIN_CHAR_MODAL_LEN){
                    if (p.length < MAX_CHAR_MODAL_LEN){
                        if ( $(current).is('li') ){
                            p = "○ " + p;
                            h = "○ " + h;
                        }
                        words.push([p,h]); //keep both text (p) and html (h)
                    }
                    else {						
						var prelim_words = p.split(". ");
                        var prelim_words_html = h.split(". ");

                        var queue = "";
                        var queue_html = "";
                        var j = 0;

                        for (i=0; i<prelim_words.length; i++){
                            if (j < SENTENCES_PER_CHUNK_PREF){
								if (i == prelim_words.length -1){
									queue += prelim_words[i];
									queue_html += prelim_words_html[i];
								}
								else {
									queue += prelim_words[i] + ". ";
									queue_html += prelim_words_html[i] + ". ";
								}
								
								//queue += prelim_words[i] + ". ";
								//queue_html += prelim_words_html[i] + ". ";
                                
								j += 1;
                            }
                            else if (j == SENTENCES_PER_CHUNK_PREF){
                                j = 0;
                                words.push([queue, queue_html]);
								if (i == prelim_words.length -1){
									queue = prelim_words[i];
									queue_html = prelim_words_html[i];
								}
								else {
									queue = prelim_words[i] + ". ";
									queue_html = prelim_words_html[i] + ". ";
								}
								//queue = prelim_words[i] + ". ";
                                //queue_html = prelim_words_html[i] + ". ";
                            }
                        }
                        if (queue.length > 0){
							console.log("should be a period");
							console.log(queue[queue.length-2]);
							/**if (queue[queue.length-2] == "."){
								queue.splice(queue.length-2, 2);
								queue_html.splice(queue_html.length-2, 2);
							}**/
                            words.push([queue, queue_html]);
							console.log("rest of split got pushed");
                        }
                    }
                }   
            }
        });

        //remove some crap (sentences starting w/ lowercase letters, not ending in periods)
        var final_words = []
        for (i=0; i<words.length; i++){
            if (words[i][1]){
                var string_html = words[i][1];
                console.log(string_html.toString());
                if (string_html.toString().indexOf("[object Object]") === -1) {
                    console.log("STRING HTML:");
                    console.log(string_html.toString());
                    if (string_html.lastIndexOf(".") > string_html.lastIndexOf("</p>") && string_html.lastIndexOf("</p>") > string_html.length - 8){
                        words[i][1] = string_html.substring(0, string_html.lastIndexOf("."));
                    }
                    var string = words[i][0];
                    if (string.charAt(0) == string.toUpperCase().charAt(0)){
                        final_words.push(words[i]);
                    }
                }
                else{
                    final_words.push(words[i]);
                }
            }
        }
        console.log("final words:");
        console.log(final_words);
        return final_words;
    }

    var getFullPageFocusContents = function(){

        if (fullPageContentsRetrieved){
            return words;
        }
        fullPageContentsRetrieved = true;
        //body = $('body').text();
		//var result = focusHelper(article);
		var result = null;
		if ($(".story-content").length > 0){
			result = focusHelper(".story-content"); //for Global Mail
		}
        else if ($(".entry-content").length > 0){
			result = focusHelper(".entry-content"); //for Time
			
		}
		else {
			result = focusHelper(article);
		}
        return result;
    }
    
    var focusOnChunk = function() {
        fullPageContentsRetrieved = false;
        var result = focusHelper(getSelectionHtml());
        var new_words = []
        for (i=0; i<words.length; i++){
            console.log("WHAT");
            console.log(words[i][1]);
            console.log(typeof words[i][1].toString);
            //if (typeof words[i][1].toString === 'function' && words[i][1].toString().charAt(0) !== "<" && words[i][0].toString().charAt(0).toUpperCase() == words[i][0].toString().charAt(0)){
            if (words[i][0].toString().charAt(0).toUpperCase() == words[i][0].toString().charAt(0)){    
                new_words.push(words[i]);
                console.log("new words push");
            }
        }
        words = new_words;
        $('#myModal').modal();
        $('#modalContent').text(words[0][0]);
        fixButtonFocus();
    }
    

    /*
    //FULL OF HACKS
    var focusOnChunk = function() {
        fullPageContentsRetrieved = false;
        var text = window.getSelection().toString();
        console.log(text);
        //reset every new selection
        //var focus_words = text.split(". ");
        //var focus_index = 0;
        //for now, we use the same the variables for selection and full focus. TODO
        var pre_words = text.split(". ");
        console.log(pre_words);
        index = 0;
        words = [];
        //convert to [text,html] (actually [text, text] for now)
        for (i=0; i<pre_words.length; i++){
            words.push( [pre_words[i], pre_words[i]] );
        }     

        //add back periods that were split off
        for (i=0; i<words.length-1; i++){
            words[i][0] += ".";
            words[i][1] += ".";
        }           
        $('#myModal').modal();
        $('#modalContent').text(words[0][1]);
        fixButtonFocus();
        console.log(words);
    }

    */
 
	//make sure this still works for the focus on text
    chrome.extension.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.action == "focus_on_text"){
            focusOnChunk();
        }
		
		//if item was added to progress list
		if (request.action == "update_proglist_add"){
			console.log('update progress list, add');
			var dup = false;
			for (var i = 0; i<proglinks.length; i++){
				if (proglinks[i][0] == request.url){
					dup = true;
					break;
				}
			}
			if (!dup){
				var res = addToProgress(request.url, request.title);
				proglinks.push([request.url, res]);
			}
        }
		
		//if item was removed from progress list
		if (request.action == "update_proglist_remove"){
			console.log('update progress list, remove');
			for (var i=0; i<proglinks.length; i++){
				if (proglinks[i][0] == request.url){
					removeFromProgress(proglinks[i][0]);
					proglinks.splice(i, 1);
					break;
				}
			}
			//removeFromProgress(request.url);
		}
		
		//if item was reordered progress list
		if (request.action == "update_proglist_reorder"){
			console.log('update progress list, reorder');
			reOrder(request.start, request.end);
			if (!initialSort){
				reOrderDivs(request.start, request.end, request.url);
			}
			else{
				initialSort = false;
			}
		}
		
		if (request.action == "add_from_CM"){
			var dup = false;
			for (var i=0; i<proglinks.length; i++){
				if (proglinks[i][0] == request.url){
					dup = true;
				}
			}
			if (!dup){
				var res = addToProgress(request.url, request.title);
				proglinks.push([request.url, res]);
				//send message to background page to update all progress lists
				chrome.runtime.sendMessage({action: 'add_to_proglist', url: request.url, title:""}, function(response){});
			     flashSidebar();
            }
		}
      });
	


    //setup page
    $('body').children().wrapAll('<div id="article" class="container-fluid scrollable article-content"/>');
	
	

    //buttons at the top
    $('body').prepend('<div class="row-fluid" id="topBar"> \
                          <div class="btn-group"> \
                            <button class="focusBtn" data-toggle="tooltip" data-placement="bottom" title="Click to start Focusing" id="focusBtn"></button> \
                          </div> \
                        </div>');
	

    $("#focusBtn").tooltip({trigger: 'manual'});

	var progBarVisible = true;
    var progBarWidth = 300;

	$('body').prepend('<div class="progbar" id="proglist">\
							<div class="refocus-logo">\
							</div>\
    						<div class="hide-arrow">\
    						</div>\
                            <div class="progbar-header">\
                            <p class="text-center"> Links to Visit </p> \
    						</div>\
                            <div class="progbar-body">\
                                <div class="progbar-content scrollable">\
        							<ul id="cont-list">\
        							<li><div class="drag-links-here">\
    									<p class="text-center-smaller">Drag and drop links that you want to explore later</p> \
    								</div></li> \
                                    <li>\
                                    <a class="clear-completed-text" id="clearCompleted">Clear Completed</a>\
                                    </li>\
                                    <li>\
                                    <a class="help-text" id="help">Help</a>\
                                    </li>\
                                    </ul>\
                                </div>\
                            <div class=error id=supported></div> \
					</div> ');


    function adjustArticleSize(progBarWidth){
        var windowSize = $("body").css("width");
        var articleWidth = windowSize.slice(0, windowSize.length-2) - progBarWidth;
        $("#article").css("width",articleWidth+"px");

    }

    adjustArticleSize(300);


    function toggleProgressBar(){
    	if(progBarVisible){ //hiding progbar
            $('#supported').hide();
    		//$(".progbar").css("width", "30px");
            $(".progbar").animate({
                width: "30px"
            },300);
    		$(".progbar-content").css("visibility", "hidden");
			$(".refocus-logo").css("visibility", "hidden");
            $(".progbar-header").css("visibility", "hidden");
			$(".hide-arrow").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/grey_unhide_arrow.png)");
			//$(".hide-arrow:hover").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/grey_unhide_arrow.png)");
    		progBarVisible = false;
            adjustArticleSize(30);
    	}
    	else{ //showing progbar
            $('#supported').show();
    		//$(".progbar").css("width", "300px");
            $(".progbar").animate({
                width: "300px"
            },300);

    		$(".progbar-content").css("visibility", "visible");
			$(".refocus-logo").css("visibility", "visible");
            $(".progbar-header").css("visibility", "visible");
			$(".hide-arrow").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/grey_hide_arrow.png)");
			//$(".hide-arrow:hover").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/grey_hide_arrow.png)");

    		progBarVisible = true;
            adjustArticleSize(300);
    	}

    }
	
    function flashSidebar(){
        $(".progbar").animate({
            width: "50px"
        }, 500);
        $(".progbar").animate({
            width: "30px"

        }, 500);

    }

    //modal
    $('body').append('<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> \
                          <div class="modal-header"> \
                            <button class="btn" id="modalPrevBtn"> << </button> \
                            <button class="btn" id="modalNextBtn"> >> </button> \
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button> \
                          </div> \
                          <div class="modal-body"> \
                            <p id="modalContent"></p> \
                          </div> \
                        </div>');


    //check if this website is supported
    my_site = $(location).attr('href');
    supported = false;
    for (i=0; i<SUPPORTED_SITES.length; i++){

        if (my_site.indexOf(SUPPORTED_SITES[i]) != -1){
            supported = true;
        }
    }
    if (!supported){
        $('#supported').text("This website is not supported by Refocus.io. Improper chunking may occur.");
    }


    //makes sure we can press prev/next on the modal, also scrolls
    var fixButtonFocus = function(){
        //hide/show correct buttons
        if (index > 0)
            $('#modalPrevBtn').attr("disabled", false);
        else
            $('#modalPrevBtn').attr("disabled", true);

        if (index < words.length - 1)
            $('#modalNextBtn').attr("disabled", false);
        else
            $('#modalNextBtn').attr("disabled", true);

        //scroll to text
        var element = $("body p:contains(\"" + words[index][0].substring(0, Math.min(words[index][0].length, 30)) + "\")").not($('#modalContent'));
        if (!element)
            var element = $("div:contains(\"" + words[index][0] + "\")");

        console.log($(element).offset());
        if ($(element).offset() != null){
            $('html, body').animate({
                scrollTop: $(element).offset().top - $(window).height()/2
            }, 500);
        }

        //set listener for clicks
        $("#modalContent > a").on("click", function(e){
            console.log('add to progress bar');
            
            e.preventDefault();
            e.returnValue = false;
            
            var cont = $(this).context;
            //don't add duplicates
            var dup = false;
            for (var i=0; i<proglinks.length; i++){
                if (proglinks[i][0] == cont.href){
                    dup = true;
                }
            }
            if (!dup){
                var res = addToProgress(cont.href, cont.textContent);
                proglinks.push([cont.href, res]);
                //send message to background page to update all progress lists
                chrome.runtime.sendMessage({action: 'add_to_proglist', url: cont.href}, function(response){});
                 flashSidebar();

            }
            
        }); 
    }
        //set listener for clicks
        
    //}

    

    // BUTTONS!
    $('#focusBtn').click(function(){
        console.log(window.getSelection());
        if(progBarVisible){
            toggleProgressBar();
        }
        if (!fullPageContentsRetrieved){
            words = getFullPageFocusContents();
        }
        if (window.getSelection() != ""){
            focusOnChunk();
        } 
        $('#myModal').modal();
        $('#modalContent').html(words[index][1]); //KAI changed from text to html
        fixButtonFocus();
    });


    //Precursor to actual functionality of top right icon
//    chrome.browserAction.onClicked.addListener(function(tab) {
//        console.log('Turning ' + tab.url + ' red!');
/*        if (words.length == 0){
            words = getFullPageFocusContents();
        }
        $('#myModal').modal();
        $('#modalContent').html(words[index][1]); //KAI changed from text to html
        fixButtonFocus();
*/
//    });

    $('#modalPrevBtn').click(function(){
        if (!$('#modalPrevBtn').is(":disabled")){
            index -= 1
            $('#modalContent').html(words[index][1]); //KAI changed from text to html
            fixButtonFocus();
        }
    });

    $('#modalNextBtn').click(function(){
        if (!$('#modalNextBtn').is(":disabled")){
            index += 1
            $('#modalContent').html(words[index][1]); //KAI changed from text to html
            fixButtonFocus();
        }
    });

    //hide/show focus button on modal shown/hidden
    $('#myModal').on('shown', function () {
        $('#topBar').fadeOut('slow');
    });
    $('#myModal').on('hidden', function () {
        $('#topBar').fadeIn('slow');
        toggleProgressBar();
    })


    //map keyboard shortcuts to stuff
    $('html').keypress(function(e){
        var c = String.fromCharCode(e.which);
        if (c === "f"){
            $('#focusBtn').click();
        }
    });

    $('html').keydown(function(e){
        if (e.keyCode == 37 && $('#myModal').data('modal').isShown ) { //left arrow
            e.preventDefault();
            $('#modalPrevBtn').click();
        } 
        else if (e.keyCode == 39 && $('#myModal').data('modal').isShown) { //right arrow
            e.preventDefault();
            $('#modalNextBtn').click();
        } 
    });
	
	//hide and open progress bar

	$('.hide-arrow').click(function() {
		toggleProgressBar();
	}
		);

	var proghidden = false;
	
	//drag and drop links
	
	//find the links on original page - 
	var links = $("#article").find("a");
    var zIndexStore = 1;
	
	//links in the progress list that we want to exclude from being added to itself.
	for (var i = 2; i<links.length; i++){
		jQuery(links[i]).draggable({
			helper: "clone",
			start: function(e, ui){
				//console.log(e);
				$(this).css("position", "relative");
                zIndexStore = $(this).css("z-index");
				$(this).css("z-index",100000);
			},
            stop: function(e,ui){
                $(this).css("z-index", zIndexStore);
            },
			zIndex: 100000,
			appendTo: 'body',
			cursorAt: {left: 0}
		});
	}
	
	//adding links to the progress list
	function addToProgress(href, title){
		//add icon-remove
		var string1 = "<li class='progitem'><div class='checkbox-div'><input type='checkbox'/></div>";
		var atag = "<div class='linkitem'><a href='"+href+"'>"+title+"</a></div>"; //try either outerText or textContent
		var closebtn = '<div class="xbtn-div"><button type="button" class="close xbtn" aria-hidden="true">x</button></div>'; 
		var result = $(string1+closebtn+atag+"</li>");
		//$("#cont-list").prepend(result);
		var drag = $('.drag-links-here').parent();
		result.insertBefore(drag);
		
		//allow user to remove the link from the progress list
		$(".xbtn").click(function(){
			console.log('close link div');
			$(this).parent().parent().remove();
			//need to remove from proglinks
			for (var i=0; i<proglinks.length; i++) {
				if (proglinks[i][0] == href){
					chrome.runtime.sendMessage({action: 'remove_from_proglist', url: href}, function(response){});
					proglinks.splice(i, 1);
					break;
				}
			}
			
		});
		
		$(result.find('input:checkbox')).click(function(e){
			if (e.target.checked){
				markComplete([href, result]);
			}
			else {
				markIncomplete([href, result]);
			}
		});

		newTitle = title;
        //update link title asynchronously
        $.ajax({
            url: href
        }).done(function(data) {
            //console.log(data);
            var matches = data.match(/<title>(.*?)<\/title>/);
            if (matches){
                newTitle = matches[1];
                var link = $('.progbar a[href$=\"' + href + '\"]');
                link.text( newTitle );
                //link.text( newTitle + "(" + link.text() + ")" );
            }
        });
		
		return result;
		
	}
	
	//update other tabs, removed progress item
	function removeFromProgress(url){
		console.log('in function removeFromProgress');
		for (var i = 0; i < proglinks.length; i++){
			if (proglinks[i][0] == url){
				var objToRemove = proglinks[i][1];
				objToRemove.remove();
				proglinks.splice(i, 1);
				break;
			}
		}
		
	}
	
	//sort the items in the progress list.
	$("#cont-list").sortable({
		start: function(e, ui){
			var index = ui.item.index();
			ui.item.data("start_ind", index);
		}, 
		stop: function(e, ui){
			var end_ind = ui.item.index();
			var start_ind = ui.item.data("start_ind");
			if (start_ind != end_ind){
				console.log("different index");
				var link = ui.item.find('a')[0].href;
				initialSort = true;
				chrome.extension.sendMessage({action: 'change_order', start: start_ind, end: end_ind, url:link}, 
												function(response){});
			}
			console.log(index);
		}
	}); 
	$("#cont-list").disableSelection();
	
	
	$(".progbar").droppable({		
		drop: function(e, ui){
			var draggedObj = ui.draggable;
			var context = draggedObj.context;
						
			//make sure we do not an extra entry while sorting
			if (context.className != 'progitem ui-sortable-helper' && context.className != 'progitem ui-sortable-helper active'){ 
				var dup = false;
				for (var i = 0; i<proglinks.length; i++){
					if (proglinks[i][0] == context.href){
						dup = true;
						break;
					}
				}
				if (!dup){ //make sure user does not add a duplicate entry
					var newItem = addToProgress(context.href, context.textContent);
					proglinks.push([context.href, newItem]);
					//send message to background page to update all progress lists
					chrome.runtime.sendMessage({action: 'add_to_proglist', url: context.href, title: context.textContent}, 
												function(response){});
				}
			}

			$('.progbar-content').css('border-style','none');
			//$('.drag-links-here').remove();

		},

		activate: function(){
			$('.progbar-content').css('border-style','dashed');
		}

	});

	
	//mark a link as completed
	function markComplete(item){
		completed.push(item);
	}
	
	function markIncomplete(item){
		var ind = completed.indexOf(item);
		completed.splice(ind, 1);
	}
	
	$('#clearCompleted').click(function(){
		for (var i=0; i<completed.length; i++){
			var ind = proglinks.indexOf(completed[i]);
			chrome.runtime.sendMessage({action: 'remove_from_proglist', url: completed[i][0]}, function(response){});
			console.log('completed: '+ completed[i][0]);
			removeFromProgress(completed[i][0]);
		}
		completed = [];
	});

    $("#help").click(function(){
        $("#focusBtn").tooltip('show');
        setTimeout(function(){$("#focusBtn").tooltip('destroy');},2000);
    });
	
	function markActive(item){
		item.addClass("activelink");
	}
	
	//reorder in Proglinks
	function reOrder(start, end){
		console.log("reorder the proglinks");
		var item = proglinks[start];
		proglinks.splice(start, 1);
		proglinks.splice(end, 0, item);
		console.log(proglinks);
	}
	
	function reOrderDivs(start, end, url){
		console.log("reorder the divs");
		var item = proglinks[end][1];
		//item.remove();
		console.log(item);
		var nextitem;
		if (end >= proglinks.length){
			nextitem = $(".drag-links-here").parent();
			item.insertBefore(nextitem);
		}
		else {
			nextitem= proglinks[end+1][1];
			console.log("nextitem");
			console.log(nextitem);
			item.insertBefore(nextitem[0]);
		}
		
		
	}
	

});


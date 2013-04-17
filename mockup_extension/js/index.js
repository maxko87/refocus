$(document).ready(function() {

    var words_per_modal = 25;
    var index = 0;
    var words = [];
	var proglinks = []; //attempt at saving the links, currently does not work
	var completed = []; //articles that user has finished reading



    var focusOnChunk = function() {
        var text = window.getSelection().toString();
        //reset every new selection
        //var focus_words = text.split(". ");
        //var focus_index = 0;
        //for now, we use the same the variables for selection and full focus. TODO
        words = text.split(". ");
        index = 0;
        //add back periods that were split off
        for (i=0; i<words.length-1; i++)
            words[i] += ".";
        $('#myModal').modal();
        $('#modalContent').text(words[index]);
        fixButtonFocus();
    }

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.action == "focus_on_text"){
            focusOnChunk();
        }
      });


    //setup page
    $('body').children().wrapAll('<div id="article" class="container-fluid scrollable article-content"/>');
	
	alert("hi");
	

    //buttons at the top
    $('body').prepend('<div class="row-fluid" id="topBar"> \
                          <div class="btn-group text-center"> \
                            <button class="btn" id="focusBtn">FOCUS</button> \
                          </div> \
                        </div>');
	

	var progBarVisible = true;

	$('body').prepend('<div class="progbar" id="proglist">\
    							<div class="hide-arrow">\
    							</div>\
    							<div class="progbar-content">\
    								<h3 class="text-center"> Progress List </h3> \
    									<ul id="cont-list"></ul> \
										<p class="text-center">Drag Links Here to Add</p> \
										<button class="btn text-right" id="clearCompleted">Clear Completed Articles</button>\
								</div> \
							</div>     							');

    function toggleProgressBar(){
    	if(progBarVisible){
    		$(".progbar").css("width", "2%");
    		$(".progbar-content").css("visibility", "hidden");
    		progBarVisible = false;
    	}
    	else{
    		$(".progbar").css("width", "25%");
    		$(".progbar-content").css("visibility", "visible");

    		progBarVisible = true;
    	}

    }

    var oldBodyText = '<div class="progbar span2" id="proglist"> \
						  <div class="tabbable verticaltabs-container"> \
							<ul class="nav nav-tabs"> \
								<li class="active" id="progresstab"><a href="#progress" data-toggle="tab">Hide</a></li> \
							</ul> \
							<div class="tab-content" id="tab-cont"> \
								<div class="tab-pane fade active in" id="progress"> \
									<h3 class="text-center">Progress List</h3> \
									<ul id="cont-list"></ul> \
									<p class="text-center">Drag Links Here to Add</p> \
									<button class="btn text-right" id="clearCompleted">Clear Completed Articles</button>\
								</div> \
							</div> \
						  </div> \
					  </div>'
	//progress bar
	
	
    //modal
    $('body').append('<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> \
                          <div class="modal-header"> \
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button> \
                          </div> \
                          <div class="modal-body"> \
                            <p id="modalContent"></p> \
                          </div> \
                          <div class="modal-footer"> \
                            <button class="btn" id="modalPrevBtn"> << </button> \
                            <button class="btn" id="modalNextBtn"> >> </button> \
                          </div> \
                        </div>');


    //makes sure we can press prev/next on the modal, also scrolls
    var fixButtonFocus = function(){
        if (index > 0)
            $('#modalPrevBtn').attr("disabled", false);
        else
            $('#modalPrevBtn').attr("disabled", true);

        if (index < words.length - 1)
            $('#modalNextBtn').attr("disabled", false);
        else
            $('#modalNextBtn').attr("disabled", true);

        var element = $("body p:contains(\"" + words[index].substring(0, Math.min(words[index].length, 10)) + "\")").not($('#modalContent'));
        console.log(element);
        if (!element)
            var element = $("div:contains(\"" + words[index] + "\")");

        $('html, body').animate({
            scrollTop: $(element).offset().top - $(window).height()/2
        }, 500);
    }

    //this will need to be smarter about what text on the page to return.
    var getFullPageFocusContents = function(){
        //body = $('body').text();
        $('p').each(function(index, current){
            var p = $(current).text();
            if (p.length > 30){
                words.push(p);
            }
        });
        return words;
    }

    // BUTTONS!
    $('#focusBtn').click(function(){
        if (words.length == 0){
            words = getFullPageFocusContents();
        }
        $('#myModal').modal();
        $('#modalContent').text(words[index]);
        fixButtonFocus();
        //jake: put scrolling to words[index] here
    });

    $('#modalPrevBtn').click(function(){
        if (!$('#modalPrevBtn').is(":disabled")){
            index -= 1
            $('#modalContent').text(words[index]);
            fixButtonFocus();
        }
    });

    $('#modalNextBtn').click(function(){
        if (!$('#modalNextBtn').is(":disabled")){
            index += 1
            $('#modalContent').text(words[index]);
            fixButtonFocus();
        }
    });


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
	
	//Kai
	//hide and open progress bar

	$('.hide-arrow').click(function() {
		alert("clicked");
		toggleProgressBar();
	}
		);

	var proghidden = false;
	//$('#progresstab').click(function(){
	//	console.log('clicked');
	//	toggleProgressBar();
		/*
        if (proghidden == false){
			//hide progress bar content
			$("#tab-cont").addClass("hidden");
			$("#proglist").removeClass("progbar");
			
			//change to true
			proghidden = true;
        }
		else {
			//restore the progress bar content
			$("#tab-cont").removeClass("hidden");
			$("#proglist").addClass("progbar");
			//change to false;
			proghidden = false;
		}
		*/
    //});
	
	//drag and drop links
	
	//find the links on original page - 
	var links = $("body").find("a");
	
	//links in the progress list that we want to exclude from being added to itself.
	//var pllinks = $("#proglist").find("a"); 
	//console.log(pllinks);
	for (var i = 2; i<links.length; i++){
		jQuery(links[i]).draggable({
			helper: "clone",
			start: function(e, ui){
				//console.log(e);
			}
		});
	}
	
	//adding links to the progress list
	function addToProgress(context){
		var linkinfo = context;
		//add icon-remove
		var string1 = "<li class='progitem'><input class='span1' type='checkbox'>";
		var atag = "<a href='"+linkinfo.href+"'>"+linkinfo.textContent+"</a>"; //try either outerText or textContent
		var closebtn = '<button type="button" class="close xbtn" aria-hidden="true">x</button>'; 
		var result = $(string1+atag+closebtn+"</li>");
		$("#cont-list").append(result);
		
		//allow user to remove the link from the progress list
		$(".xbtn").click(function(){
			console.log('close link div');
			$(this).parent().remove();
			//need to remove from proglinks
			var ind = proglinks.indexOf(result);
			proglinks.splice(ind, 1);
		});
		
		$(result.find('input:checkbox')).click(function(e){
			if (e.target.checked){
				markComplete(result);
			}
			else {
				markIncomplete(result);
			}
		});
		
		return result;
		
	}
	
	//sort the items in the progress list.
	$("#cont-list").sortable(); 
	$("#cont-list").disableSelection();
	
	
	$("#tab-cont").droppable({		
		drop: function(e, ui){
			var draggedObj = ui.draggable;
			var context = draggedObj.context;
						
			//make sure we do not an extra entry while sorting
			if (context.className != 'progitem ui-sortable-helper' && context.className != 'progitem ui-sortable-helper active'){ 
				if (proglinks.indexOf(draggedObj) < 0){ //make sure user does not add a duplicate entry
					var newItem = addToProgress(context);
					proglinks.push(draggedObj); //save the new ui.draggable.context to array, keep track of articles
					
				}
			}
		}
	});
	
	//load the progress bar with the saved information when refreshing or moving between webpages
	for (var i=0; i<proglinks.length; i++) {
		addToProgress(proglinks[i]);
	}
	
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
			proglinks.splice(ind, 1);
			completed[i].remove();
		}
		completed = [];
	});
	
	function markActive(item){
		item.addClass("activelink");
	}

	
	
	/**for (var i; i<pllinks.size; i++){
		if ($.inArray(pllinks[i], links)){
			//remove link from links
			links = $.grep(links, function(val) { return val != pllinks[i]; });
		}
	}**/
	
	//var tblinks = $("#topBar").find("a");	
	/**for (var i; i<tblinks.size; i++){
		if ($.inArray(tblinks[i], links)){
			//remove link from links
			links = $.grep(links, function(val) { return val != tblinks[i]; });
		}
	}**/
	

});


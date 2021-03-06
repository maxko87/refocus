$(document).ready(function() {

    var words_per_modal = 25;
    var index = 0;
    var words = []; //each element in an array [p, h] where p = text, h = html
	var proglinks = []; //list of links in progress bar, ui.draggable.context.href
	var completed = []; //articles that user has finished reading


    //FULL OF HACKS
    var focusOnChunk = function() {
        var text = window.getSelection().toString();
        console.log(text);
        //reset every new selection
        //var focus_words = text.split(". ");
        //var focus_index = 0;
        //for now, we use the same the variables for selection and full focus. TODO
        var pre_words = text.split(". ");
        console.log(pre_words);
        index = 0;
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
 
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.action == "focus_on_text"){
            focusOnChunk();
        }
      });


    //setup page
    $('body').children().wrapAll('<div id="article" class="container-fluid scrollable article-content"/>');
	
	

    //buttons at the top
    $('body').prepend('<div class="row-fluid" id="topBar"> \
                          <div class="btn-group"> \
                            <button class="focusBtn" data-toggle="tooltip" data-placement="bottom" title="Click to go into Focus Mode" id="focusBtn"></button> \
                          </div> \
                        </div>');
	

    $("#focusBtn").tooltip()

	var progBarVisible = true;

	$('body').prepend('<div class="progbar" id="proglist">\
							<div class="refocus-logo">\
							</div>\
    						<div class="hide-arrow">\
    						</div>\
    						<div class="progbar-content">\
    							<p class="text-center"> Progress List </p> \
    							<ul id="cont-list"></ul> \
    							<div class="drag-links-here">\
									<p class="text-center-smaller">Drag and drop links that you want to explore later</p> \
								</div> \
								<a class="clear-completed" id="clearCompleted">Clear Completed</a>\
							</div> \
					</div> ');

    function toggleProgressBar(){
    	if(progBarVisible){
    		$(".progbar").css("width", "2%");
			//$(".progbar").css("min-width", "10px");
    		$(".progbar-content").css("visibility", "hidden");
			$(".refocus-logo").css("visibility", "hidden");
			$(".hide-arrow").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/black_unhide_arrow.png)");

    		progBarVisible = false;
    	}
    	else{
    		$(".progbar").css("width", "20%");
			//$(".progbar").css("min-width", "300px");
    		$(".progbar-content").css("visibility", "visible");
			$(".refocus-logo").css("visibility", "visible");
			$(".hide-arrow").css("background-image", "url(http://web.mit.edu/anvishap/www/refocus/black_hide_arrow.png)");

    		progBarVisible = true;
    	}

    }
	
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
        var element = $("body p:contains(\"" + words[index][0].substring(0, Math.min(words[index][0].length, 10)) + "\")").not($('#modalContent'));
        if (!element)
            var element = $("div:contains(\"" + words[index][0] + "\")");

        $('html, body').animate({
            scrollTop: $(element).offset().top - $(window).height()/2
        }, 500);

        //set listener for clicks
        $("#modalContent > p > a").on("click", function(e){
            console.log('add to progress bar');
            
            e.preventDefault();
            e.returnValue = false;
			
			//don't add duplicates
			if (proglinks.indexOf($(this).context.href) < 0){
			    addToProgress($(this).context);
				proglinks.push($(this).context.href);
			}
			
        }); 
    }

    //this will need to be smarter about what text on the page to return.
    var getFullPageFocusContents = function(){
        //body = $('body').text();
        $('#article').find('p').each(function(index, current){
            var p = $(current).text();
			
			var h = $(current).context.outerHTML;
			
            if (p.length > 30){
                words.push([p,h]); //keep both text (p) and html (h)
            }
			
        });

        //remove some crap
        var final_words = []
        for (i=0; i<words.length; i++){
            var string = words[i][0];
            if (string.charAt(0) == string.toUpperCase().charAt(0)){
                console.log(string.charAt(0));
                console.log(string.toUpperCase().charAt(0));
                final_words.push(words[i]);
            }
        }
        return final_words;
    }
	
	

    // BUTTONS!
    $('#focusBtn').click(function(){
        if (words.length == 0){
            words = getFullPageFocusContents();
        }
        $('#myModal').modal();
        $('#modalContent').html(words[index][1]); //KAI changed from text to html
        fixButtonFocus();
    });

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
	
	//Kai
	//hide and open progress bar

	$('.hide-arrow').click(function() {
		toggleProgressBar();
	}
		);

	var proghidden = false;
	
	//drag and drop links
	
	//find the links on original page - 
	var links = $("#article").find("a");
	
	//links in the progress list that we want to exclude from being added to itself.
	//var pllinks = $("#proglist").find("a"); 
	//console.log(pllinks);
	for (var i = 2; i<links.length; i++){
		jQuery(links[i]).draggable({
			helper: "clone",
			start: function(e, ui){
				//console.log(e);
				$(this).css("position", "relative");
				$(this).css("z-index",100000);
			},
			zIndex: 100000,
			appendTo: 'body',
			cursorAt: {left: 0}
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
			var ind = proglinks.indexOf(linkinfo.href);
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

        //update link title asynchronously
        $.ajax({
            url: linkinfo.href
        }).done(function(data) {
            console.log(data);
            var matches = data.match(/<title>(.*?)<\/title>/);
            if (matches){
                var newTitle = matches[1];
                var link = $('.progbar a[href$=\"' + linkinfo.href + '\"]');
                link.text( newTitle );
                //link.text( newTitle + "(" + link.text() + ")" );
            }
        });
		
		return result;
		
	}
	
	//sort the items in the progress list.
	$("#cont-list").sortable(); 
	$("#cont-list").disableSelection();
	
	
	$(".progbar").droppable({		
		drop: function(e, ui){
			var draggedObj = ui.draggable;
			var context = draggedObj.context;
						
			//make sure we do not an extra entry while sorting
			if (context.className != 'progitem ui-sortable-helper' && context.className != 'progitem ui-sortable-helper active'){ 
				if (proglinks.indexOf(context.href) < 0){ //make sure user does not add a duplicate entry
					var newItem = addToProgress(context);
					proglinks.push(context.href); //save the new ui.draggable.context to array, keep track of articles
					
				}
			}

			$('.progbar-content').css('border-style','none');
			$('.drag-links-here').remove();

		},

		activate: function(){
			$('.progbar-content').css('border-style','dashed');
		}

	});


	//load the progress bar with the saved information when refreshing or moving between webpages
	/*for (var i=0; i<proglinks.length; i++) {
		addToProgress(proglinks[i]);
	}*/
	
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
	

});


$(document).ready(function() {

    var words_per_modal = 25;
    var index = 0;
    var words = [];
	var proglinks = [];

    //buttons at the top
    $('body').prepend('<div class="row-fluid" id="topBar"> \
                          <div class="btn-group text-center"> \
                            <button class="btn" id="focusBtn">FOCUS</button> \
                          </div> \
                        </div>');
						
	//progress bar
	$('body').prepend('<div class="progbar" id="proglist"> \
						  <div class="tabbable verticaltabs-container"> \
							<ul class="nav nav-tabs"> \
								<li class="active" id="progresstab"><a href="#progress" data-toggle="tab">Hide</a></li> \
							</ul> \
							<div class="tab-content" id="tab-cont"> \
								<div class="tab-pane fade active in" id="progress"> \
									<h3 class="text-center">Progress List</h3> \
									<ul id="cont-list"></ul> \
									<p class="text-center">Drag Links Here to Add</p> \
								</div> \
							</div> \
						  </div> \
					  </div>');
	
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
    var getModalContents = function(){
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
            words = getModalContents();
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
	var proghidden = false;
	$('#progresstab').click(function(){
		console.log('clicked');
        if (proghidden == false){
			//hide progress bar content
			$("#tab-cont").addClass("hidden");
			$("#proglist").removeClass("progbar");
			//$("#proglist").hide("slide", {direction: "left"}, 20);
			
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
    });
	
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
	
	
	$("#tab-cont").droppable({		
		drop: function(e, ui){
			//console.log(ui.draggable); //.context
			var linkinfo = ui.draggable.context;
			//add icon-remove
			var string1 = "<li><div class='progitem'>";
			var atag = "<a href='"+linkinfo.href+"'>"+linkinfo.outerText+"</a>";
			var closebtn = '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>'; 
			//"<i class='icon-remove'></i>";
			$("#cont-list").append(string1+atag+closebtn+"</div></li>");
			
			//need icon to remove the link from the progress bar
			
			//proglist.add(ui.draggable.context); //add the ui.draggable.context object to the progress list
			//check the syntax for the add
			
		}
	});
	
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


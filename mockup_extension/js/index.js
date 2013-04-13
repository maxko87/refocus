$(document).ready(function() {

    var words_per_modal = 25;
    var index = 0;
    var words = [];

    //buttons at the top
    $('body').prepend('<div class="row-fluid" id="topBar"> \
                          <div class="span9 btn-group text-center"> \
                            <button class="btn" id="focusBtn">FOCUS</button> \
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


    //actually a really dumb split for now
    var smartSplit = function(data) {
        words = [
            "Night is enveloping the hills of Cisarua, a resort town high outside Jakarta, and the area’s evening rituals are beginning. Rainwater thunders down from nearby mountaintops along hundreds of canals and rivulets that go whooshing on into the polluted sink that is Indonesia’s capital.",
            "Across the bowl-shaped valley, dozens of mosques begin booming the call to prayer, all merging together into an asynchronous whine. In hillside villas, groups of men from Saudi Arabia — some in traditional white thawb robes, some in baggy track pants – load up on the evening’s stock of alcohol, which is banned in their home country. On motorbikes and in cars, pimps begin ferrying in the men’s other vice — Arabic-speaking Indonesian women.",           "Elena and Hernán (all the names in this piece are pseudonyms) soon became a couple, of sorts—he already had a wife and children, and other mistresses. But Elena was different than the docile women he was accustomed to.",
            "(See the photos behind the story: Barat Ali Batoor’s series from Cisarua, In Between Persecution And Asylum.)",
            ];
        return words;
    }

    //makes sure we can press prev/next on the modal
    var fixButtonFocus = function(){
        if (index > 0)
            $('#modalPrevBtn').attr("disabled", false);
        else
            $('#modalPrevBtn').attr("disabled", true);

        if (index < words.length - 1)
            $('#modalNextBtn').attr("disabled", false);
        else
            $('#modalNextBtn').attr("disabled", true);
    }

    //this will need to be smarter about what text on the page to return.
    var getDocBody = function(){
        body = $('body').text();
        return body;
    }


    $('#focusBtn').click(function(){
        if (words.length == 0)
            data = getDocBody();
            words = smartSplit(data); //array of paragraphs per modal, done only the first time focus'd on that page
        $('#myModal').modal();
        $('#modalContent').text(words[index]);
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

    $('#myModal').on('shown', function () {
        $('html').keydown(function(e){
            if (e.keyCode == 37) { //left arrow
                e.preventDefault();
                $('#modalPrevBtn').click();
            } 
            else if (e.keyCode == 39) { //right arrow
                e.preventDefault();
                $('#modalNextBtn').click();
            } 
        });
    });

    $('#myModal').on('hidden', function () {
        $('#myModal').removeAttr('keypress');
    });

});



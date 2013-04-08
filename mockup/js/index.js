$(document).ready(function() {

    var words_per_modal = 25;
    var index = 0;
    var words = [];

    //actually a really dumb split for now
    var smartSplit = function(data) {
        words = [
            "Elena first met Hernan at a bar. She was in her early twenties, hanging out in a Juarez club frequented by people involved in the drug world, people who partied hard and were always flush with cash.",
            "Elena spotted Hernan across the room and asked a friend to introduce them. She was aggressive that way. She was also strikingly attractive and had a wild streak that made her uninterested in stable men with stable careers.",
            "Elena and Hernán (all the names in this piece are pseudonyms) soon became a couple, of sorts—he already had a wife and children, and other mistresses. But Elena was different than the docile women he was accustomed to.",
            "If he pushed her she pushed back. She was not afraid of his violent character—her father was abusive, as were many of the men she’d been with since her adolescence, when she’d discovered her sexuality.",
        ];
        return words;
    }
  
    //data contains the text to be focused and modal'd
    var startFocus = function(data) {
        if (words.length == 0)
            words = smartSplit(data); //array of paragraphs per modal, done only the first time focus'd on that page
        $('#myModal').modal();
        $('#modalContent').text(words[index]);
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


    $('#focusBtn').click(function(){
        $.ajax({
            url : "https://dl.dropbox.com/u/12516935/sample_text.txt",
            dataType: "text",
            success : function (data){
                startFocus(data);
            }
        }); 
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



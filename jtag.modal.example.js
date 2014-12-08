//make one of these to show modal content
<script id="ModalDialog">
show:function(what){
this.named('content').html(what);
}

<div name="content">

//make many of these, one per info button needed
<script id="InfoButton">
__ready__:function(){
var source = $(this).attr('source');

$(this).click(function(){
MyModal.jtag.show($(source).html());
});
}

<div>
<img src"image/questionmark.png">


<script id="DansTest">
   //actually make the modal dialog
   <ModalDialog id="MyModal">

   //make the two InfoButtons that are paired (point) to the divs with text, by selector
   <InfoButton source="#someid1" pic="questionmark">
   <InfoButton source="#someid2">


   
    //make it shake it bake it
    <div class="jtag">template:'DansTest'

    //make many of these, one for each info button paired to it
    <div class="hidden" id="someid1">
    some text to show 1

    <div class="hidden" id="someid2">
    some text to show 2

"use strict"

    ///////////////////////////////////////
   //                                   //
  //           Word Libraries          //
 //                                   //
///////////////////////////////////////


    //includes
    var fnords  = "hostile hostility destroy destroying destroyed destruction disintegrate disintegrating disintegrated weak weaken weakening weakness weakened calamity sacrifice sacrificing sacrifice birth rebirth eat eating eaten waste wasted wasting renew renewing renewed harm harming harmed injure injuring injurious injured freeze freezing exhaust exhaustion destroy destruction disasters disaster disastrous war burn burned burning fire blaze crisis aggression aggressive invasion invaded die dying stifling stifled suffer fear fears buildup blockade block blockage collapse collapsed fall buildup force forced forcing surge surging surged heart fight fighting fights cover covered covering threat threatening pressure pressures squeezed squeeze squeezing crush crushed crushing choke choked choking constraint constrained constrained burden burdening burdened shooting shoot shot dead death dying chaos chaotic menace menaced menacing violence bad evil insult insulting insulted anger angry angered resentment resent resenting frustration frustrated frustrating love loved loving resent resents resenting resented exhilaration exhilarated exhilarating exult tough tougher toughness toughening broke broken brake breaking strain strained straining strained sticky sticking dirt dirty filth filthy clean cleaning cleansing cleansed cleaned bury buried burying backbone cut cutting slash slashed slashing stab stabbed stabbing landslide watershed slip slippage slipping crack cracking cracked danger overstimulate boom pressure pressures ferocious happiness happy love loving loved hate hatred hating hated runaway bedrock cancer disease diseased sick sickness sickening sickened grow growing growth hot heat cool cold blow blowing blows bleeding bleed bled kill killing killed suck sucking suck fetus fetuses infant infants placenta womb birth birthing born child children grandchild grandchildren mother mothers father fathers grandmother grandmothers grandfather grandfathers brat brats bratty sewer sewers cespool cesspit";

    //excludes
    var not_fnords = "a an the i me my mine he him his she her hers you yours they them theirs we us our ours this that it its and or not of to be is are was were in on all as so with for by a b c d e f g h i j k l m n o p q r s t u v w x y z";

    //  eventually the relevant keywords can be moved from the 'fnords' variable to these.  
    //  then the WordStatObject() can be rewritten so that the fnords dictionary object is passed as the fist argument to the constructor.
    //  the final intent is to output a percentage value for each group found in the input text.  we could use a Raphaël object to draw a graph.
    //  if gf theory holds, we should get a nice sinusoidal curve with a peak at the current "fetal drama" stage.
    //
    //var fnords            = "";
    //var fnords.strong     = "";
    //var fnords.cracking   = "";
    //var fnords.collapse   = "";
    //var fnords.upheval    = "";
    //var fnords.others     = "";


    ///////////////////////////////////////
   //                                   //
  //       Statistics Processing       //
 //                                   //
///////////////////////////////////////


        // Returns an object with the following properties
        //
        //  obj.filtered_input           An array of words from the input text matching words in the includes text.
        //  obj.include_frequencies      A dictionary of the above words and thier frequencies in the input text.
        //  obj.total_frequencies        A dictionary of all input text (miuns the excludes) 
        //        
        function WordStatObject( includes, excludes, input ){

            //Prepare for case-insensitive searches
            var includes    = includes.toLowerCase(); 
            var excludes    = excludes.toLowerCase();
            var input       = input.toLowerCase();
            

            //Split text strings into arrays of words, dividing on whitespace and punctuation. This changes these from strings to arrays.
            var delimiters  = new RegExp(/[^a-z]{1,}/);
            includes    = includes.split(delimiters);
            excludes    = excludes.split(delimiters);
            input       = input.split(delimiters);	

            //Strip away all excludes from input
            var aa      = new Array;
            for(var i = 0 ; i < input.length ; i++){
                if(excludes.indexOf( input[i] ) < 0 )
                    aa.push(input[i]);
            }
            input = aa;
            aa = null;

            //Base object which will be returned by this function
            var a = new Object;

            //Array of the input words, filtered by includes
            a.filtered_input = new Array;
            for(var i = 0 ; i < input.length ; i++)
                if(includes.indexOf(input[i]) > -1 )
                 a.filtered_input.push(input[i]);



            //A function for sorting dictionary entries by thier value, highest first
            function sortDictByValue(dictionary){
                var sorting_array   = new Array;
                
                for(var i in dictionary){ //make an array of arrays: [[key:value],[key:value],...]
                    sorting_array.push([ dictionary[String(i)] , String(i) ]);
                }

                sorting_array.sort(function compare(x, y){
                    if ( x[0] == y[0] )
                     return 0;
                    else if ( x[0] < y[0] )
                     return 1;
                    else
                     return -1;
                });

                dictionary  = {};
                for( var i = 0; i <= sorting_array.length - 1; i++ ){                
                    dictionary[sorting_array[i][1]]    = sorting_array[i][0];
     
                }
                return dictionary;
            }

            //Dictionary of input word:frequency values, sorted highest to least
            a.include_frequencies    = new Object;
            for(var i in a.filtered_input){ 
                if(a.include_frequencies[ a.filtered_input[i] ] == undefined)
                    a.include_frequencies[ a.filtered_input[i] ] = 1;
                else 
                    a.include_frequencies[ a.filtered_input[i] ] =  a.include_frequencies[ a.filtered_input[i] ] +1 ;
            }

           a.include_frequencies = sortDictByValue(a.include_frequencies);//sort from highest to least

            //Dictionary of total word:frequency values, minus the excludes
            a.total_frequencies       = new Object;
            for(var i in input)
                if(a.total_frequencies[ input[i] ] == undefined)
                    a.total_frequencies[ input[i] ] = 1;
                else
                    a.total_frequencies[ input[i] ] = a.total_frequencies[ input[i] ] +1;    

           a.total_frequencies  = sortDictByValue(a.total_frequencies);
        
            //Return the Word Statistics Object
            return a;                    
        }



       //Acessor function to parse the WordStatObject.total_frequencies into presentable HTML
       function parseFrequencyResultsIntoHTML(stats_dictionary){
            var t = '';
            for( var i in stats_dictionary ){
                t = t + '<div class="statistic_datum_wrapper">' + stats_dictionary[i] + '&nbsp;' + String(i) + '</div>'; 
            }
            return t;
            };
                   
       //Acessor function to parse the WordStatObject.total_frequencies into presentable HTML


       ///////////////////////////////////////
      //                                   //
     //       Initialization Events       //
    //                                   //
   //           Requires jQuery         //
  //                                   //
 ///////////////////////////////////////
 
        //Varaible to hold the current item index of texts we've fetched from the samples[{'desc','text'}] array 
        var samples_increment = 0;

        //all On-Readys
        $(document).ready(function(){

            //Create persistent jQuery objects that reference the info buttons and info popups.
            var info_divs = $('.infoouter');
            var infobuttons = $('.infobutton');
            
            //Create persistent jQuery objects that reference the function buttons and  popups.
            var function_buttons    = $('div.function_button');
            var statistics_display  = $('div#statistics_display');
            
            
            //Hide all the info popups and give them state flags.
            info_divs.hide();
            info_divs.each( function(i){
                this.is_hidden = true;
            });
            
            //Hide results panel
            statistics_display.hide();
            //Give it some attributes that hold its state
            statistics_display[0].last_called_by = "nothing";
            statistics_display[0].is_hidden = true;
            
            

            //Add click handlers to (x) div-buttons that .hide() thier container divs.
            $('.closex').click(function(){
                var container_div = $(this.parentNode);
                container_div.hide();
                container_div[0].is_hidden = true;  
            });       
 
             
         
            //Add click handlers to any button with .buttonshadow to cause a button-press visual effect
            $('.buttonshadow').mousedown(function(){
                var thisitem = $(this);
                thisitem.removeClass('buttonshadow');
            }).mouseup(function(){
                $(this).addClass('buttonshadow');
            }).mouseout(function(){
                $(this).addClass('buttonshadow');
            });
 
            //Make all links open in new windows
            $('a').each(function(){
                this.target = "_blank";
            });


            //Add click handlers to info buttons to toggle thier corresponding info popups.
            infobuttons.click(function(){
                
                var this_info_box = $( '#' + this.id + '.infoouter');
                var button_id = this.id;
                
                if(this_info_box[0].is_hidden){
                    // hide all other info boxes
                    info_divs.each(function(i){    
                        if( button_id != this.id && !this.is_hidden ){
                            this.is_hidden = true;
                            $(this).hide();
                        }                        
                    });
                    // and display the relevant one
                    this_info_box[0].is_hidden = false;
                    this_info_box.show();
                }
                else {
                    // dismiss it, leaving a clear view of the page
                    this_info_box[0].is_hidden = true;
                    this_info_box.hide();   
                }
             });

            //Function to set the text in the input boxes
            function setInputBoxesText( samples_increment ){
                $('textarea#input_desc').text( sample_texts[samples_increment]['desc'] );
                $('textarea#input_text').text( sample_texts[samples_increment]['text'] );
            }

            //Set text for initial pageload 
            setInputBoxesText( samples_increment );

            //Create a WordStatObject when the page is ready
            var fnord_stats = new WordStatObject( fnords , not_fnords , $("textarea#input_text").text() );           
                     
            //Create a callback to process the data again when the text in input_text has changed
            $("textarea#input_text").change(function(){
                fnord_stats = new WordStatObject( fnords , not_fnords , $("textarea#input_text").text() );
            });
            
            
            // Func to set [1] the height of the tool interface areas, [2] The position of function buttons, dynamically
            // on init, and also on page resize
           function layoutDynamically(){
                // get window and element dimension values, calculate
                var jqwindow         = $(window);
                var window_height   = jqwindow.height();
                var window_width    = jqwindow.width();
                var header_height   = $('div#header_box').height()
                var items_height    = window_height - header_height - 120;
                var jqinput_area    = $('div#input_area');
                // set the height of the div containing the text boxes (the 'text' textarea expands to fill it )
                jqinput_area.height( items_height ).width(window_width * 0.8 );
                // calculate the position of the top function button, then an increment for each subsequent function button,
                // based on a sizeable fraction of the overall window hieght, divided by the total number of buttons.
                var function_button_wrappers = $('div.function_button_wrapper');
                function_button_wrappers.each(function(i){
                    var top_button_position = header_height + 125;//last number is an offset
                    var poistion_increment = (window_height * 0.65) / function_button_wrappers.length;
                    // set the position of each button group using css.  works because the wrapper's position:fixed;
                    $(this).css('top', String( top_button_position + (poistion_increment * i) ) + 'px');    
                });                  
                // set the position and dimensions of the results pane
                var input_text_box = $('textarea#input_text');
                statistics_display.offset( input_text_box.offset() );
                statistics_display.width( input_text_box.width() );
                statistics_display.height( input_text_box.height() );
            }


            // do it once on ready()
            layoutDynamically();
            // add a callback to window.resize event.
            $(window).resize(function(){ layoutDynamically(); });
 
 
            
            //Add click handlers to info buttons to put thier corresponding results in the results box
            function_buttons.click(function(){
                
                var this_id = this.id;
                
                function showStatisticsPane( this_id, remember_button_id ){
                    //Test to see which function button id was called, and then populate with relevant data
                    if( this_id == 'show_fnords' )
                        statistics_display.children('.infoinner').html( fnord_stats.filtered_input.join(' ') );
                    else if( this_id == 'fnord_count' )
                        statistics_display.children('.infoinner').html( parseFrequencyResultsIntoHTML(fnord_stats.include_frequencies) );
                    else if( this_id == 'word_count' )
                        statistics_display.children('.infoinner').html( parseFrequencyResultsIntoHTML(fnord_stats.total_frequencies) );
                    else if( this_id == 'fnord_curve' )
                        statistics_display.children('.infoinner').html( "placeholder for &lt;SVG&gt; graph elelement generated by Raphael" );

                   // record the current stat item being displayed
                   if(remember_button_id)
                        statistics_display[0].last_called_by = this_id;
                        
                    if(statistics_display[0].is_hidden){
                    //Make the statistics popup visible  
                        statistics_display.show();
                        statistics_display[0].is_hidden = false;
                    }
                }
                
                if( this_id == 'next_sample' ){
                
                    samples_increment++;
                    
                    // if at the end of the samples db, loop back to the beginning
                    if( samples_increment == sample_texts.length )   
                        samples_increment = 0;
                    // Paint the new text into the textarea#input_text
                    setInputBoxesText( samples_increment );
                    // trigger the textbox's change() event so a new wordStatObject() is made, with new data to display 
                    $("textarea#input_text").trigger('change');
                    //if the statistics popup isn't hidden
                    if(!statistics_display[0].is_hidden)
                        //update the statistics display pane's contents using the previous button argument, which now references new data
                        showStatisticsPane( statistics_display[0].last_called_by , false );
                }               
                else 
                    showStatisticsPane( this_id , true  );
            });

            //document.write($("textarea#input_text").text());

            //document.write(fnord_stats.filtered_input.join(" ... "));

            //for( var i in fnord_stats.include_frequencies )
            //  document.write( fnord_stats.total_frequencies[i] + "&nbsp; &nbsp" + i + "<br>");  
            
            //Delete the big, window-covering div that will otherwise tell you to turn Javascript back on.
            $('div.no_script').remove();      

        });

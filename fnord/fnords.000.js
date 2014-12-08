    ///////////////////////////////////////
   //                                   //
  //          Fnord Libraries          //
 //                                   //
///////////////////////////////////////


    //includes
    var fnords  = "hostile hostility destroy destroying destroyed destruction disintegrate disintegrating disintegrated weak weaken weakening weakness weakened calamity sacrifice sacrificing sacrifice birth rebirth eat eating eaten waste wasted wasting renew renewing renewed harm harming harmed injure injuring injurious injured freeze freezing exhaust exhaustion destroy destruction disasters disaster disastrous war burn burned burning fire blaze crisis aggression aggressive invasion invaded die dying stifling stifled suffer fear fears buildup blockade block blockage collapse collapsed fall buildup force forced forcing surge surging surged heart fight fighting fights cover covered covering threat threatening pressure pressures squeezed squeeze squeezing crush crushed crushing choke choked choking constraint constrained constrained burden burdening burdened shooting shoot shot dead death dying chaos chaotic menace menaced menacing violence bad evil insult insulting insulted anger angry angered resentment resent resenting frustration frustrated frustrating love loved loving resent resents resenting resented exhilaration exhilarated exhilarating exult tough tougher toughness toughening broke broken brake breaking strain strained straining strained sticky sticking dirt dirty filth filthy clean cleaning cleansing cleansed cleaned bury buried burying backbone cut cutting slash slashed slashing stab stabbed stabbing landslide watershed slip slippage slipping crack cracking cracked danger overstimulate boom pressure pressures ferocious happiness happy love loving loved hate hatred hating hated runaway bedrock cancer disease diseased sick sickness sickening sickened grow growing growth hot heat cool cold blow blowing blows bleeding bleed bled kill killing killed suck sucking suck fetus fetuses infant infants placenta womb birth birthing born child children grandchild grandchildren mother mothers father fathers grandmother grandmothers grandfather grandfathers brat brats bratty sewer sewers cespool cesspit";

    //excludes
    var not_fnords = " a an the i me my mine he him his she her hers you yours they them theirs we us our ours this that it its and or not of to be is are was were in on all as so with";

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
  //           Text Libraries          //
 //                                   //
///////////////////////////////////////


var loremipsum="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?<br /><br />At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.";




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
            

            //Split text strings into arrays of words, dividing on whitespace and punctuation.
            var delimiters  = new RegExp(/[^a-z]{1,}/);
            var includes    = includes.split(delimiters);
            var excludes    = excludes.split(delimiters);
            var input       = input.split(delimiters);	

            //Strip away all excludes from input
            var aa      = new Array;
            for(var i in input)
                if(excludes.indexOf( input[i] ) < 0 ) 
                    aa[i] = input[i];
            var input   = aa;
            delete aa;

            //Base object which will be returned by this function
            var a = new Object;

            //Array of the input words, filtered by includes
            a.filtered_input = new Array;
            for(var i = 0 ; i <= input.length -1; i++)
                if(includes.indexOf(input[i]) > -1 )
                 a.filtered_input.push(input[i]);

            //A function for sorting dictionary entries by thier value, highest first
            function sortDictByValue(dictionary){
                var sorting_array   = new Array;
                for(var i in dictionary){ //make an array of arrays: [[key:value],[key:value],...]
                    sorting_array.push([ dictionary[i] , i ]);
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


       ///////////////////////////////////////
      //                                   //
     //       Initialization Events       //
    //                                   //
   //           Requires jQuery         //
  //                                   //
 ///////////////////////////////////////

        $(document).ready(function(){

            //Hide all the explanation popups and give them state flags.
            var explaindivs = $('.explainouter');
            explaindivs.hide();
            explaindivs.each( function(i){
                this.hide_status = true;
            });

            

            //Add click handlers to (x) div-buttons that .hide() thier container divs.
            $('.closex').click(function(){
                var explaindiv = $(this.parentNode);
                explaindiv.hide();
                explaindiv[0].hide_status = true;
                
            });       

            //Add click handlers to [?] div-buttons to toggle explanation popups with the same id.
            
            var explainbuttons = $('.explainbutton');

            explainbuttons.click(function(){
                var relevant_explaindiv = $( '#' + this.id + '.explainouter');
                if(relevant_explaindiv[0].hide_status){
                    relevant_explaindiv[0].hide_status = false;
                    relevant_explaindiv.show();
                }

                var button_id = this.id;
                explaindivs.each(function(i){
                   if( button_id != this.id ){
                    this.hide_status = true;
                    $(this).hide();
                   }
                });
             });

            //don't need these jQuery objects anymore
            delete explainbuttons;
            delete explaindivs;

           
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


            //Stick some text in the input fields.  Eventually this will be replaced with stock stuff from the server. 
            $('textarea#input_desc').text( 'Sample Description' );
            $('textarea#input_text').text( 'Sample input text' );

        });

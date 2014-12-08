

/*Securebook, author, James Robey, jrobey.services@gmail.com
all rights reserved*/

//"use strict";

// JTAG.JS: A FRAMEWORK FOR COMBINING JSON AND JQUERY TEMPLATES INTO 
// A MANAGABLE STRUCTURE USEFUL FOR COMPOSITION AND ITERATION.
//
//Author: James Robey, jrobey.services@gmail.com, 2011

//ABOUT THE JTag OBJECT:
//
// JTags refer to Jquery Lists, or alternately, James Lists, after the author. They are 
// a means by HTML can be client-side templated, using JSON, to create web-applications.
// They are built on top of jquery templates, and so enhance and repackage that system into
// a framework that is far more convenient, providing for using templates for the 
// structure of the document itself, as well as building lists backed by JSON locally or from
// a URL. The concept is actually simple, but the application of it involves some conventions. 
// It is advised in this case that sample code be handy when trying to learn the JTag system!
//
// What do I need to know about JTags? 
//
// given: an "item" is a Jquery HTML template that will be stamped out and ordered into a list.
//
// given: an item's data is a dictionary of values - one json ".obj"ect.
//
// given: the ".obj"ects come from either a url or from a "source". If neither a url or a source is given
//        then the object (singluar!) comes from the key values written inside the tag.
//
// given: the list-as-a-whole (or list items themselves) can refresh and syncronize themselves to 
//        the server, as a list of json dictionaries, by using the .sync() and .refresh() methods.
//        a brain dead "protocol" (always a list of dicts) is used such that to save items,
//        you send a list of those items which are presumed to have an id such that the server can
//        make the change. The server can elect to send back an altered version that will be updated 
//        in response, or deleted, or just skipped (left alone) by passing the dict, an empty dict, 
//        or false, respectively.
//
// given: A JTag is an object that manages html element and json, and keeps them in sync as the list 
//        changes. It handles removing and adding items by removing or adding json objects,
//        handles  multi-selection, "updates" (syncs) items to a server backend for CRUD-by-url 
//        i.e. (/get /edit /remove). It's the high-level abstraction of a data driven interface
//  
// given: A recursive method, FindJTagsRecursively(), will make new JTags recursively on any tag with
//        class "jtag", such that that inner text of these nodes is a javascript dictionary 
//        configuring it. In this way, Jlists may be defined included, and invoked directly from 
//        ANY html dynamically!
//
// given: that "private" methods are underscored; try not to use (but it's nice to know 
//        that the _remove() method, for instance, can delete without upsetting selection.. the
//        others might help to have to)
//
// given: you have access to example code that you can use to learn the jtag pattern
// 
// How does a JTag get made? Is it magic? 
//      JTags can be made directly from javascript by passing the options needed binding the JTag to a target node, 
//      among other things:
//
//      var MyJTag = new JTag({options});
//
//      When jtag.js is included in your project, however, a function is run on ready that allows for a second way to 
//      make a JTag. Using the FindJTagsRecursively function, you can defined and invoke JTags directly, right in your 
//      HTML directly. The target is automatically set to the node. If the node has an ID, then the JTag becomes 
//      accessible under JTags[ID] for ease of access. JTags can have parents and children of two types. One type
//      is of child templates rendered (.children) when a source or url is given, and another is parent and child 
//      JTAGS - that is, the closest ancestor that was made by a JTag, and any children (.jchildren) that are 
//      associated with jtags. This allows for event binding between jtags, useful when asking an interior jtag
//      to paint json managed by a parent jtag. Again, this is all about convention and example code will explain better!
//
//      The most used form, then, of JTags is to place this in your HTML, which is invoked on document ready.
//
//  <div class="jtag">
//      {options}  /* YOU MUST USE ONLY "slash-star" type comments inside tags! */
//  </div>
//
//      HERE is a more realistic example, showing a JTag being defined that does something on load,
//      and illustrates the idea of the interior being a javascript dictionary:
//
//  <div class="jtag">
//      /** i can have comments so long as they are of slash-star type!  */
//  
//      /** the template to use */
//      template:'SomeTemplate', 
//
//      /** dont forget to put commas after every entry! */
//
//      /** "source" provides the objects to paint. If i wanted to use a URL, use the "source:" parameter,
//          and if i wanted to use neither the "source" will be the keys in this 'tag' dictionary */
//      source:[{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}],
//
//      /** if this is here the list becomes multiselect, with options. You must give the css selectors to apply on highlight and select */
//      selectable:['css_selector_to_highlight', 'css_selector_to_select'], 
//
//      /** this method will be called on load. We also have __init__, __ready__, __after__ for initialization stages. */
//      __loaded__:function(){
//          alert(this.source.length+" templates have been created using "+this['template']);
//      },
//
//      /** this method will be called when one item only has been selected in the JTag, at which point an syncedtemplate could
//          could be loaded, or other action taken, with the .obj of the selected item: */
//      __selection__:function(item){
//          if(item) alert("A selection (of one item) has been made: "+item.obj.id);
//      }
//  </div>
//
// JTag options (may be incomplete):
//      url: a url to retrive json from OR the set of objs as an expression, skipping any request.
//      source: a url to retrive json from OR the set of objs as an expression, skipping any request.
//      template: the id of the jquery template to use (which is always presumed to be an id)
//      target: the css selector of the container in which items should be written. 
//      selectable: if the name of a css class, make the objs of list selectable where the selected obj has that css applied.
//      autoinit: if true, do not run the list when created OR on the first page ready.
//      container: choose a different top-level container then the tag where children are made - useful for scrolling on a table wrapped
//                 in a div, for instance, since you can scroll a div to the bottom but not a table!
//      query: a json obj (usually dict) that is sent along with the request when a list reloads.
//
//      A GOTCHA: NOTE YOU MUST HAVE ONLY ONE TOP LEVEL NODE IN A TEMPLATE USED IN "LIST" MODE INSTEAD OF 
//      "STRUCTURAL" MODE, WHERE N CHILDREN ARE FINE.

//start framework code:

//////////////////////////////////////////////////////////////////////////////
// Help javascript out - add in some stuff the list.js framework can use.
//////////////////////////////////////////////////////////////////////////////
    var urlParams = {};
    (function () {
        var e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
            q = window.location.search.substring(1);

        while (e = r.exec(q))
           urlParams[d(e[1])] = d(e[2]);
    })();

    //I give arrays a remove method. Don't that make sense?
    if(Array.prototype['remove'] == undefined){
        Array.prototype.remove = function(index){
            this.splice(index, 1);
        };
    }else{
        throw "Warning: tried to give array a remove method, but it already has one!";
    }
    
    //I give arrays an insert method. Don't that make sense?
    if(Array.prototype['insert'] == undefined){
        Array.prototype.insert = function(what, at){
          this.splice(at, 0, what);
        };
    }else{
        throw "Warning: tried to give array an insert method, but it already has one!";
    }
    
    //I give arrays an insert method. Don't that make sense?
    if(Array.prototype['last'] == undefined){
        Array.prototype.last = function(){
          return this[this.length-1];
        };
    }else{
        throw "Warning: tried to give array a last method, but it already has one!";
    }
    
    if (!Array.prototype.map)
    {
      Array.prototype.map = function(fun, thisp)
      {
        var len = this.length;
        if (typeof fun != "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
          if (i in this)
            res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
      };
    }
    
    if (!Array.prototype.filter)
    {
      Array.prototype.filter = function(fun /*, thisp*/)
      {
        var len = this.length;
        if (typeof fun != "function")
          throw new TypeError();

        var res = new Array();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
          if (i in this)
          {
            var val = this[i]; // in case fun mutates this
            if (fun.call(thisp, val, i, this))
              res.push(val);
          }
        }

        return res;
      };
    }

////////////////////////////////////////////////////////////////////////////////
// Some event management
////////////////////////////////////////////////////////////////////////////////

    var isShiftPressed;
    var isCrtlPressed;
    var isAltPressed;
    var isMouseDown;

    //note, and make globally availble whether meta keys are down or up.
    $(document).mouseup(function(e){ 
        isMouseDown = false;
        isShiftPressed = e.shiftKey; 
        isCrtlPressed = e.crtlKey; 
        isAltPressed = e.altKey; 
        return true;
    });
    
    $(document).click(function(e){ 
        isMouseDown = true;
    });

////////////////////////////////////////////////////////////////////////////////
// The fundamental event mecahanism: register, set, and unset - if used to set
// values on objects, anything registered for those atrributes will be informed
// of the change. This is as convienent to use with booleans as it is numbers
// so it's often the case that globally accessible dictionaries will thus be
// made to hold state that the applicaiton can react to when changed. It's also 
// used to say things like "the list has changed" or "the name of the template 
// to use is now". etc.
//
// register(Global, "something", function(val){obj, attr, val, oldval}(alert(obj, attr, val, oldval);)
// set(Global, "something", "this is a test");

// this will cause an alert message to pop up with the value "this is a test", presuming 
// a dictionary called Global exists (i.e Global = {})
////////////////////////////////////////////////////////////////////////////////
    
    //I will pair a method to an attribute on a given object such that if the set function 
    //is called to change that attribute the method will be called with the object changed and the attr's new value
    //the boundobject parameter can specify an object that will receive a _releaseRegistrations() method
    //so that any registrations made will be unmade when boundobject._releaseRegistrations() is called!
    function register(obj, attr, method, context, boundobject){
        if(!obj['_registeredAttributes'])  
            obj._registeredAttributes = {};
        if(!obj['_registeredAttributes'][attr])  
            obj['_registeredAttributes'][attr] = new Array;

        obj['_registeredAttributes'][attr].push([method, context]);     
        
        if(boundobject !== undefined){            
            if(boundobject['_attributesRegistered'] === undefined){
                boundobject['_attributesRegistered'] = [];
                boundobject._releaseRegistrations = _releaseRegistrations;
            }
                
            boundobject['_attributesRegistered'].push([obj, attr, method]);  
        }
    }
    
    //same as register, but make sure the method is unique. Useful.
    function registerOnce(obj, attr, method, context, boundobject){
        if(obj['_registeredAttributes'] && obj['_registeredAttributes'][attr])
            for(var i = 0; i < obj['_registeredAttributes'][attr].length ; i ++)
                if(obj['_registeredAttributes'][attr][i][1] == context){
                    alert("not adding method (duplicate):\n"+context);
                    return false;
                }
                    
        register(obj, attr, method, context, boundobject);
    }
    
    //this method will be assigned to boundobjects specified when registering events.
    //when this method is called on that boundobject, all registrations bound will be released!
    function _releaseRegistrations(){
        if(this['_attributesRegistered'] != undefined){
            //for all the recorded registrations-to-remove, 
            for(var i = this['_attributesRegistered'].length-1; i >= 0; i --){
                var obj = this['_attributesRegistered'][i][0];
                var attr = this['_attributesRegistered'][i][1];
                var method = this['_attributesRegistered'][i][2];
                
                //use that information to find the registration (going backwards) removing them.
                for(var j = obj['_registeredAttributes'][attr].length-1; j >= 0; j --)
                    if(obj['_registeredAttributes'][attr][j][0] == method)
                        obj['_registeredAttributes'][attr].remove(j);
            }
        }   
    }

    //I will set a attribute on an obj such that any methods registered via 
    //the register() method will fire.
    function set(obj, attr, val){
        //record the value before we set it so we can send both old and new below
        var oldval = obj[attr];
        //do the actual assignment
        obj[attr] = val;
    
        //if there is a registered object to set, go through all the methods, firing them
        var idx_to_remove = [];
        var regAttrs = obj['_registeredAttributes'];
        if(regAttrs && regAttrs[attr])
            for(var i = 0; i < regAttrs[attr].length; i ++){
                var entry = obj['_registeredAttributes'][attr][i];
                //if no context is given, the context is object on which the item was registered.
                var context = entry[1] ? entry[1] : obj;
                entry[0].call(context, val, oldval, obj, attr);
            }
    }
    
    //unset an attribute by passing undefined as the value.
    var unset = function(obj, attr){
        set(obj, attr);
    }
    
////////////////////////////////////////////////////////////////////////////////
// Lets spruce jquery up a bit:
////////////////////////////////////////////////////////////////////////////////

    if($.fn['reverse']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    //allow to reverse the order of nodes in a chain of jquery calls. neat.
    $.fn.reverse = function() {
        this.pushStack(this.get().reverse());
        return this;
    }
    
    //return a node interior to ourselves named 'name'. This is quicker then looking 
    //for id's as well as being factorable.
    if($.fn['named']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.named = function(name){
        return $($(this).find("[name="+name+"]")[0]);
    }
    
    //return the actual element behind the jquery node. This was not necessary
    //until jtags became stored primarily on DOM nodes (instead of in pure javascript)
    //and we wanted to acccess jtags by the ids of those nodes. This is used interchangably
    //with just calling $(x)[0] (which is quicker cause of 1 less method call..)
    
    if($.fn['element']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.element = function(){
        return $(this)[0];
    }
    
    $.fn.tagName = function() {
        return this.get(0).tagName.toLowerCase();
    }
    
    //you MUST use this to erase nodes! Anything else will bork the system, because 
    //a regular empty() call will not remove registered events on the node being emptied!
    //Reset is semantically closer to the intent anyway.
    if($.fn['reset']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.reset = function(){
        //so if you dont erase handlers - you will have problems reloading uses templates!
        var item = this[0];
        
        //reset registrations set here on top..
        if(item['_registeredAttributes'])
            item['_registeredAttributes'] = {};
            
        //and reset ALL registrations that have been paired with this jtag, and all sub jtags!
        if(item['jtag'])
            recursivelyRemoveAllJTagBoundRegistrations(item['jtag']);
                        
        //and remove all the contents in the jquery way.
        this.empty();
    }
    
    //INTENT: make it easy to remove registrations made previously when an item bound with jtag is reset()
    //SUMMARY, YOU MUST use the $(item).reset() method to remove items with jtag and sub-jtags, lest oddity occur.
    //good news is it looks much simpler when used, just use the .register method of the jtag associated with activity.
    
    //DETAIL: Since an optional bound object can be paired when making a registration
    //we can then call the _releaseRegistrations() method of the boundobject to release all
    //registration so bound. In this way, registrations that target some scope (jtag) can be deregistered
    //smoothly when it or a parent reset(), solving the problem of having an ever growing number of event
    //handlers assigned resulting in a slowdown as they pile up into the hundreds... but this method
    //of binding the registrations to jtags, and then removing registrations when those jtags or a parent
    //jtag reset(), is actually quite easy to use. Just self.jtag.register(obj, attr, func) in almost all
    //cases! :)
    var recursivelyRemoveAllJTagBoundRegistrations = function(jtag){
        //recurse so that the children remove their handlers first
        for(var i = 0; i < jtag.jchildren.length ; i ++)
            recursivelyRemoveAllJTagBoundRegistrations(jtag.jchildren[i]);
        //if the jtag is a bound object, release the registrations!
        if(jtag['_releaseRegistrations'])
            jtag._releaseRegistrations();
    }
    
    //If i am passed a dictionary, I presume it is parameters to a jtag invoked on this node.
    //If passed *no* query, i return the already existing jtag on that node.
    //passing data to an already defined jtag updates it
    if($.fn['jtag']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.jtag = function(data){
        var element = this[0];
        
        if(element === undefined){
            var msg = "item does not have an assoicated jtag (or is undefined) at "+debuggingId(this)+'\n'+dir(this);
            alert(msg); throw msg;
        }
            
        //if there is a jtag on this node return it - 
        //e.g. E.g. $('#MySoonToBeAJTagNodeId').jtag();
        if(element['jtag'])
            return element.jtag;
        
        //if they pass a dict to an uninitialized node make a new jtag 
        //on this node, using that info, e.g. $('#MySoonToBeAJTagNodeId').jtag({options})
        //it's not a widely used pattern at this time (writing on tags are, but writing pure
        //js jtags might be used for inheritance..)
        else{
            if(data === undefined){
                var msg = "Called .jtag() on a node that has not been paired with a JTag yet\n"+debuggingId(this[0]);
                alert(msg); throw msg;
            }                
                
            data.target = element;
            return new JTag(data);
        }
    }

    //handy method to unbind then bind again to an event insuring only one
    //handler is present.
    if($.fn['rebind']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.rebind = function(eventname, method){
        $(this).unbind(eventname)
        $(this).bind(eventname, method)
        return this;
    }
    
    //simply cause a div to scroll to the bottom given a selector.
    if($.fn['scrollToBottom']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.scrollToBottom = function(){
        $(this).animate(
            {scrollTop: $(this).prop("scrollHeight")}
        );
    }
    
    //simply cause a div to scroll to the bottom given a selector.
    if($.fn['scrollToTop']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.scrollToTop = function(){
        $(this).animate(
            {scrollTop:0}
        );
    }
    
    //given an html element (a "node"), find the first parent with an "obj" attribute.
    //in the JTag architecture, this will always be the template instance parent to 
    //the node passed as being where to start ("here").
    if($.fn['parentTemplate']) throw "$.fn['reverse'] already defined! (jtag.js trying to redefine it)";
    $.fn.parentTemplate = function(){
        var here = this[0];
        var body = $$('body');
        var node = $(here).parent();
        
        while(1){
            if(node[0] === undefined)
                return false;
                
            if($$(node)['obj'] !== undefined)
                return $$(node);
                
            node = node.parent();
        }
    }

    //this "Dereferences" a jquery object that points at one node, into that node. Useful!
    var $$ = function(selector){
        var output = new Array;
        
        $(selector).each(function(){
            output.push(this);
        });
        
        return (output.length == 1) ? output[0] : output;
    }
    
////////////////////////////////////////////////////////////////////////////////
// USEFUL UTILITIES
////////////////////////////////////////////////////////////////////////////////
    
    //thanks stackoverflow - this creates a uuid for identifying nodes!
    function uuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    //I am some cool shorthand for returning "obj", "array", "string", etc as needed.
    //I do not differentiate between different objs (as instanceof does) just different types.
    var gettype = function(obj){
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    
    //I will return a list of keys from an obj or obj
    var getkeys = function(dict){
        var keys = new Array;
        try{
            for(var o in dict)
                keys.push(o);
        }catch(err){
            return ["BAD KEY IN GETKEYS"];
        }   
            
        return keys;
    }
    
    //i will take a STRING of form x.y.z and show x, x.y, and x.y.z individually.
    var dirwalk = function(config){
        var target = config[0];
        var items = config[1].split('.');
        var targetname = ""+config[0];
        var output = "Dir walk of "+item+" through "+config[1]+"\n\n";
        
        for(var i = 0; i < items.length ; i ++){
            target = target[items[i]];
            targetname += '.'+items[i];
            output += targetname+':\n    '+target+'\n';
        }
        
        return output;
    }
    
    //INTENT: return a listing of all attribute on an object - debugging.
    //this has been enhanced to recurse one level deep, so that the attributes of the dir(x) object
    //are also listed. nice.
    var dir = function(obj, dontexpand){
        //make header
        var output = "";
        
        if(dontexpand === undefined){
            for(var key in obj)
                output += key+", ";
            output += "\n\n    FULL LISTING:\n\n";   
        }
        
        if(obj instanceof Array && obj.length == 0)
            output += "(previous is empty array)\n";
            
        else if(obj instanceof Array)
            for(var i = 0; i < obj.length ; i ++){
                var val = obj[i] == 'function' ? "[FUNCTION]" : obj[i];
                
                val = (gettype(val) == 'string' && val.length > 50) ? (val.substr(0, 50).replace('\n', '') + " [...]") : val;
                output += (dontexpand!==undefined ? "        " : "") + i + ') = ' + val + "\n";
            
                if(dontexpand === undefined)
                    if(obj[i] instanceof Array || obj[i] instanceof Object) 
                        output += dir(obj[i], true);
            }
          
        else if(obj instanceof Object && getkeys(obj).length == 0)
            output += "(previous is empty dictionary)\n";
          
        else if(obj instanceof Object)
            for(var key in obj){
                var val = gettype(obj[key]) == 'function' ? "[FUNCTION]" : obj[key];
                
                val = (gettype(val) == 'string' && val.length > 50) ? (val.substr(0, 50).replace('\n', '') + " [...]") : val;
                output += (dontexpand!==undefined ? "        " : "") + key + ' = ' + val + "\n";
                
                if(dontexpand === undefined || key == 'obj')
                    if(obj[key] instanceof Array || obj[key] instanceof Object || key == 'obj') 
                        output += dir(obj[key], true);
            }
        
        else
            output += "item of type: " + gettype(obj) + " obj is: "+obj;
            
        return output;
    }

    //INTENT: to do simple logic in jquery templates
    var iftest = function(what, t, f){
        return what ? t : f;
    }
    
    //INTENT: shorthand to copy values from one dict onto a second.
    var mergeObjFromSource_ToDest_ = function(source, dest){
        if(source !== undefined)
            for(var key in source)
                dest[key] = source[key];
        return dest;
    }
    
    //this just tests objects for value equality, stored on $ for convenience (why not?)
    var valuesAreEqual = function(a, b){
        for(p in a)
            if(typeof(b[p])=='undefined')
                return false;
        
        for(p in a) {
            if (a[p]) {
                switch(typeof(a[p])) {
                    case 'object':
                        if (!a[p].equals(b[p])) { return false; } break;
                    case 'function':
                        if (typeof(b[p])=='undefined' ||
                            (p != 'equals' && a[p].toString() != b[p].toString()))
                            return false;
                        break;
                    default:
                        if (a[p] != b[p]) { return false; }
                }
            }
            
            else
                if (b[p])
                    return false;
        }
        
        for(p in b)
            if(typeof(a[p])=='undefined')
                return false;
        
        return true;
    }
    
    function getTextFromFirstChild(el){
        var result;
        $(el).contents().each(function(){
            if(result = $.trim($(this).text()))
                return false;
        });
        return result;
    }
    
    //INTENT: return a name representing the passed object, checking for and 
    //choosing the best way as possible
    var debuggingId = function(buf){
        if(buf === undefined)
            return "UNDEFINED.";
        
        //if it's a string, then it's a selector still, deal with it.
        buf = $(buf);
        
            
        if(buf.attr('id')) 
            return 'ID: '+buf['id'];
            
        if(buf.attr('name')) 
            return 'NAME: '+buf['name'];
            
        if(buf[0] && buf[0]['jtag']){
            if(buf[0].jtag['template']) 
                return 'USING TEMPLATE: '+buf[0].jtag['template'];
        }
        
        //if nothing else, return 
        return "HTML: "+buf.html();
    };
        
    function encode_utf8( s ){
        return unescape(encodeURIComponent(s));
    }

    function decode_utf8( s ){
        return decodeURIComponent(escape(s));
    }
    
    //INTENT: add an item showing this network connection status from the network status container
    function _showStatusText(url){
        var networkstatus_div = $('#_JTAGNETWORKSTATUS');
        
        if(networkstatus_div.children().length == 0)
            networkstatus_div.addClass('JTagsFrameworkOverlay_on');
        
        networkstatus_div.append($("<span class='rounded relative'>Loading "+url+"</span>"));
        networkstatus_div.find('.rounded').corner().removeClass('rounded');
    }
    
    //INTENT: find and remove the item showing this network connection status from the network status container
    function _removeStatusText(url){
        var networkstatus_div = $('#_JTAGNETWORKSTATUS');
        $(networkstatus_div.find('*:contains('+url+')')[0]).remove();
        
        if(networkstatus_div.children().length == 0)
            networkstatus_div.removeClass('JTagsFrameworkOverlay_on');
    }
    
    //MY god.. the only way to get POST to work with JSON is to do it over and over, until it works! because
    //GET always works, GET is used when there are no query.
    var postJSONToURL_UsingObj_AndWhenDone_ = function(url, data, success, trydex, delay){
        //a previous total failure of the network means we should give up, until reload
        //if(Global['NetFailure'] === true){
        //    alert("The server may be down. Reload the application and try again after a short interval.");
        //    return;
        //}
            
        //ui stuff when starting request - only issue on top level requests from the user, not reloads when connenction not made.
        if(trydex === undefined)
            _showStatusText(url);
        
        var success = success !== undefined ? success : function(){};
        
        //if this is the first "try" (trydex = try index), set defaults
        if(trydex == undefined){
            trydex = 0;
            delay = 300;
            if(!(data instanceof Array))
                data = [data];
            data = {'objs':data};
        }
            
        //if too many tries, bale until page reloaded
        if(trydex > 8){
            //Global.NetFailure = true;
            alert("The server hosting "+url+" is not responding. We tried mutilple times. You may continue, but note your last action did not work. You may wish to reload.");
            return;
        }    
            
        //on complete, if in error, recursively reissue the request, until too many tries or success. HACK
        //to deal with requests spontaneously aborting.
        var completewrapper = function(xhr){
            
            _removeStatusText(url);
            
            //no response? bail.
            if(!xhr['responseText']){
                alert("there was no response from the server when contacting the url "+url+". Status code:"+xhr['statusCode'])
                return false;
            }
            
            //bad json parse? bail.
            try{
                var results = JSON.parse(xhr['responseText']);
            }catch(err){               
                alert("We got back:\n\n"+results+"\n\nError with parsing json: "+err);
                return false;
            }
            
            //what did they give us?
        
            //error?
            if(results['error']){
                alert(results['error']);
                return true;
            }

            //success!!
            success(results['objs']);
            
            //message? If so, display it after the logic for the return values
            //presuming that its much less then the time 
            if(results['msg'])
                alert(results['msg']);
            
            return true;
        };
            
        //okay THIS is very important! we are always sending lists - but we can't easily, arbitrarily, nest data
        //if we are limited to just query parameters alone. The solution is to make a "normal" entry (i.e. objs[0][somename] = content)
        //EXCEPT that content can be JSON'd - and will be expanded on the backend by the getjson() method. That method forms a "bridge"
        //between client and server that browsers can handle!
        var ready_to_send_data = {'objs':[]};
        for(var i = 0; i < data['objs'].length ; i ++){
            var entry = {};
            for(var key in data['objs'][i])
                entry[key] = JSON.stringify(data['objs'][i][key]);
            ready_to_send_data['objs'].push(entry);
        }
        
        //do th' durn thing. (because of the error above, i actually flailed for quite a while with unexplainable intermittent errors. No more!)
        $.ajax({
            url:encodeURI(url),
            type:'POST',
            data:ready_to_send_data,
            dataType:'json',
            async:false,
            complete:completewrapper,
            error:function(){
                _removeStatusText(url);
            }
        });
        
        return true;
    }
    
    //if given a method call it on an optional context - if anything else leave it alone!
    var changeString_ToMethodAndRunIn_ = function(item, context){
        return gettype(item) != 'function' ? 
            item :
            context !== undefined ? item.call(context) : item();
    }
    
//////////////////////////////////////////////////////////////////////////////
// assemble the list system:
//////////////////////////////////////////////////////////////////////////////

    //INTENT: global state of the list mechanism (all lists use these)
    
    //this holds global references for applications. why not keep it in one place? (answer: event binding - gotta store on object for that to work, not global namespace!)
    var Global = {};
    //this indicates whether or not JTags have neen 
    Global._JTagsLoading = false;
    
    //if a jtag is defined on a target with an id, place a reference to it 
    //here under that ID for easy access!
    var JTags = {};
    
    //holds all the template init functions so specified by the user of the jtag system
    var __init__ = {};
    var __loading__ = {};
    var __loaded__ = {};
    var __ready__ = {};
    var __after__ = {};
    
    //holds dictionaries that are default values for templates so specified by the user of the jtag system
    var __defaults__ = {};
    
    //this holds function definitons for the views (script id's) initilaiztion.
    var JTagMethodsFor = {};
    
    //ready methods that need to be fired after all is made.
    var _DeferredLoadingItemEvents = new Array;
    var _DeferredLoadedItemEvents = new Array;
    var _DeferredReadyItemEvents = new Array;
    var _DeferredAfterItemEvents = new Array;
    var _DeferredChangedItemEvents = new Array;
    
    var _DeferredLoadingListEvents = new Array;
    var _DeferredLoadedListEvents = new Array;
    var _DeferredReadyListEvents = new Array;
    var _DeferredAfterListEvents = new Array;
    var _DeferredChangedListEvents = new Array;
    
    //INTENT: this compiles and caches templates
    var _CompiledTemplatesCache = {};

    //INTENT: store compiled templates.
    function TemplatesCache(template_name){
        template_name = '#'+template_name;
        if(_CompiledTemplatesCache[template_name]===undefined)
            _CompiledTemplatesCache[template_name] = $(template_name).template();
        return _CompiledTemplatesCache[template_name];
    }
    
    var JTag = function(options){
        //the almighty self. by this means I communicate self-ness 
        //to function definitions that rescope "this"!
        var self = this;
        
        //if the target has an 'id' use it as the name stored in the JTags dict.
        
        self.children = new Array;        //all the items assocaited with the list. (with a 'uses' template that number is always 1)
        self.selected = [];               //a list of references to currently selected items.
        self.selection = false;           //a reference to the currently selected item if only 1 is selected.
        self.multiselect = true;          //a boolean indicating if multiselection is allowed.
        self.dynamic = true;              //don't apply reordering methods if a list is not dynamic. Rarely used, so far.
        self.autoinit = true;             //will self list load when created?
        self.direction = true;            //which directions are headers sorted?
        self.target = options.target;     //the node to use when appending new templates, etc.
        self.container = options.target;  //if given, the container will be scrolled to the bottom, not the target.
        self.jchildren = new Array;       //store the list of jtag children created inside of this jtag. mighty useful in ui event distribution
        self.jchild = {};                 //if a subjtag is named, store it here.
        self.query = {};                  //when a remote json source is used, what query string values to post?
        self.changed = true;              //a boolean used only in set/register events, when the jtag is changed
        self.uninitialized = true;        //a boolean indicating if this jtag has been loaded yet.
        self.treatResultAsSingleItem = false;           //a boolean indicating that the entire response will be put under one attr, 'obj'
        self.inherit = false;             //if true it's the name of another jtag in the JTags.dictionary
        self.virtual = false;             //if true this jtag will not init, and be placed in the JTag.dictionary for inheriting by others.
        self.filter = false;              //if a function that controls presence of nodes from the source of a template where if passed to this, should return true.
        self.jtag_anonymous_template = false;     //the compiled template as passed in in a tag after javascript, if present.
        
        //The 'templateparent' always refers to the item above this jtag's target that has been produced 
        //by the JTag system. Nothing fancy - the first parent with a '.obj' attribute is it!
        //this is most handy when a child jtag wishes to find a parent jtag.
        self.templateparent = $(this.target).parentTemplate();
        
        if(self.templateparent){
            self.templateparent.jtag.jchildren.push(self);  
            //also make it possible to find named children (i.e. this) from parent.
            var name = $(this.target).attr('name');        
            if(name) self.templateparent.jtag.jchild[name] = self;
        } 
        
        //if there is jtag_source_text, treat it like a text-dict-to-be-evald that merges with the options passed in 
        //from the actual options.
        if(options['jtag_source_text']){
            try{
                eval("self._source_function = function(self){return "+options['jtag_source_text']+'};');
                var jtag_source_text_evaluated = self._source_function(self);
            }catch(err){
                var msg = "            "+err+'\n\nThere was an error somewhere in the structural template with text containing:\n\n'+options['jtag_source_text'];
                alert(msg); throw msg;
            }
            
            //merege in the evaluated options to the acutal passed in options (sourcetext takes precedence)
            //and save that evaluation on ourselves for future reference.
            mergeObjFromSource_ToDest_(jtag_source_text_evaluated, options);
            self['jtag_source_text_evaluated'] = jtag_source_text_evaluated;
        }
        
        //NOTE: EVOLVING FEATURE Certain attrs from an inherited jtag need to be skipped, like 'templateparent'...
        //NOTE: that by copying these onto self, and not options, anything now in options whether from jtag_source_text
        //or not will override what we got from the inheritance, as desired!
        if(options['inherit']){
            restoreValues = {inherit:this['inherit'], target:this['target'], virtual:false};
            var jtag = JTags[options['inherit']];
            mergeObjFromSource_ToDest_(jtag, self);
            mergeObjFromSource_ToDest_(restoreValues, self);
        }
        
        //we copy from options onto self now so that the inheritance above is overridden.
        mergeObjFromSource_ToDest_(options, self);
        
        //--- varibles resolved at this point on.
        
        //assign the templateparent to the target, now that the target has been resolved (both ways, jquery and normal..?)
        $(self.target).templateparent = self.templateparent;
        $$(self.target).templateparent = self.templateparent;
            
        //save references to this jtag on the target. If the target has an ID, place the JTag in the JTags global dict.
        self.target_item = $$(self.target);
        var target_id = $(self.target).attr('id');
        
        self.target_item.jtag = self;
        if(target_id) JTags[target_id] = self;
        
        //INTENT: if we are virtual, we are only used for inheriting from others. dont' init!
        if(self['virtual']){
            $(self.target).remove();
            return;
        }
        
        //INTENT: if the filter changes, reevaluate items. as an event rather then method call, other things may react as well.
        self.register(self, 'filter', function(){
            self._evaluateFilter();
        });
        
        //INTENT: choose what type of jtag to make, structural type or list type, by changing what the reload() method points at!
        self.reload = (self['source'] || self['syncurl'] || self['autoinit'] instanceof Array) ? self.reloadAsList : self.reloadAsTemplate;
        
        //if autoinit is a two element list it is telling us to autoinit using the source from the evaluation of
        //the given context/attribute tuple immmediately, and whenever the pair is set()! So very useful and clear 
        //when data global to an application needs to be painted but stay in sync (as well as not needing to load a url repeatedly!)
        if(self['autoinit'] instanceof Array){
            self.register(self['autoinit'][0], function(){
                var val = self['autoinit'][0][[self['autoinit'][1]]];
                self.source = val === undefined ? [] : val;
                self.reload();
            });
        }
         
        //INTENT: Load the list or wait for a manual or event-based reload() call?
        //NOTE that .reload() has been assigned one of two methods depending on list of structural 
        //template to be invoked!
        if(self['autoinit'])
            self.reload();
            
        return this;
    }
    
    //INTENT: reload a template made once (via the FindJTagsRecursively method)
    //note that reloading also reevaluates the query given in the
    //inner text of the template, so that reloadng also refreshes.
    JTag.prototype.reloadAsTemplate = function(data){
        var self = this;
        
        //when we unload, unselect everything. necessary for many reasons, cohesion of UI, etc.
        if(self['selectable'] && self.selected)
            self.unselectAll();
        
        //and when we unload, start with new children...
        self.children = new Array;
        
        //if data is passed in, use it in place of our current data.
        if(data !== undefined){
            self.source = data;
            if(!(data instanceof Object))
                throw "reloading a structural template via .reload(x) requires that x be a dictionary, when reloading the template: "+self.template;
        }
            
        //else re-evaluate the text comprising our original source text and use that, which allows
        //variable references made in the text to be dynamic.
        else{
            if(self['jtag_source_text']){
                //if it's not the first load, recompute the source so as to get current values! (i.e. use the jtag_source_text_evaluated we made in init, so as not to compute the same thing twice!)
                try{self.source = this.uninitialized ? self['jtag_source_text_evaluated'] : self._source_function(self);}
                catch(err){
                    var msg = "There is an error in a function passed as source in template: "+self.template;
                    alert(msg); throw msg;
                } 
            }
        }
            
        //reset doesn't just erase the contents of the target - it releases any registers() associated too!
        $(self['target']).reset();
        var new_obj = mergeObjFromSource_ToDest_(__defaults__[self['template']], {});  
        mergeObjFromSource_ToDest_(self.source, new_obj);   
        
        try{
            if(self['template'])
                var new_item = $.tmpl(TemplatesCache(self['template']), new_obj).appendTo(self['target'])[0];
            else if(self['jtag_anonymous_template'])
                var new_item = $.tmpl(self['jtag_anonymous_template'], new_obj).appendTo(self['target'])[0];
            else
                throw "No template, or anonymous template, provided when reloading a template:"+self['template']+self['jtag_anonymous_template'];
        }catch(e){
            var msg = "error in template: "+e+' in '+self.template+"\n\n(not having a template defined is a common cause of this as well)";
            alert(msg); throw msg;
        }
        
        //first prepare the target, by passing the item and the data for the item.
        self._initTemplate($(new_item).parent()[0], new_obj);
        self._initList();  
    }
    
    //INTENT: reload the jtag, from a list sourced either locally or remotely
    //the reload method will call the server and repaint the results. This 
    //can be delayed by setting autoinit to false...
    JTag.prototype.reloadAsList = function(data){
        var self = this;
        
        self.children = new Array;
        
        //if we have a url to fetch (takes precedence over a source option)
        if(gettype(self['source']) == 'string'){
            var query = self['query'] ? self['query'] : {};
            
            //if we get data, use it as paramters to the url in 'source'
            if(data !== undefined){
                self.query = data;
                query = self.query;
            };
                
            //if what they give is a method, run it. This is useful when you want a value to exist
            //on first load, not on first parse [of the text inside of a tag]
            //and, if they reload, the query will be reevaulated that way as well.
            if(gettype(query) == 'function')
                query = query.call(self);
                
            if(!(query instanceof Array))
                query = [query];
            
            postJSONToURL_UsingObj_AndWhenDone_(self.source, query, function(objs){
                if(objs===undefined)
                    throw "RESPONSE HAS AN ERROR, when requesting url: "+self.source;

                self._json_source = objs;

                //if this flag is present, place the entire reposonse in a single attribute ('objs')
                //so that a template may access all of the requests' result, e.g. a list being flattened into one item.
                if(self['treatResultAsSingleItem'])
                    objs = [{'objs':objs}];

                self._createItemsFromObjs(objs);    
                self._initList();
                self._headerSetup();
                return true;
            });
            
            return true;
        }
        
        //if we are getting data locally, e.g through the source option
        else{   
            var source = self['source'] ? self.source : [];
            
            //if they pass in data to reload as an argument, use that instead of what we have
            if(data !== undefined){
                self['source'] = data;
                source = self['source'];
            }
                
            //if what they give is a method, run it. This is useful when you want a value to exist
            //on first load, not on first parse [of the text inside of a tag]
            if(gettype(source) == 'function')
                source = source.call(self);
            
            //if the new data is a single object change it to a list w/1 item
            if(!(source instanceof Array))
                source = [source];
                
            //finally use the source to create objects as indicated, init the list, and move on!
            self._json_source = source;
            self._createItemsFromObjs(source);
            self._initList();
            self._headerSetup();
        }   
    }
    
    //INTENT: give a child what it needs to be a part of a list
    //I will add things to a new list item so it conforms to the list pattern.
    JTag.prototype._initTemplate = function(item, obj, doNotAddToChildren){
        var self = this;
            
        if(obj === undefined)
            obj = {}
            
        //why assign to both item and $(item)[0]? I don't really know; it works this way.
        //I know it has something to do with passing either a html node, or a jquery wrapper,
        //each being a different thing. but suffice to say, this covers the bases.
        
        item.obj = obj;
        item.jtag = self;
        //i don't know why i have to do this twice like this, but i do!
        $(item)[0].jtag = self;
        $(item)[0].obj = obj;
        
        item._issueEvent = self._issueItemEvent;
        item.named = self.named;
        
        //add the item to the child list unlesss insert 
        if(doNotAddToChildren === undefined)
            self.children.push(item);
        
        //if the list is dynamic, add in the data methods
        if(self['dynamic'])
            JTagMethodsFor.data(item);
        
        //if the list is selectable, add in the selection methods
        if(self['selectable'])
            JTagMethodsFor.selecting(item);
            
        //every instance of every template is given it's own css entry automatically. I found myself including it with 
        //all the widgets anyway.
        $(item).addClass(self['template']);
        
        //copy over init methods from the environment onto the object, so the scope will be correct.
        var template = self['template'];
        item.__init__ = __init__[template] ? __init__[template] : false;
        item.__loading__ = __loading__[template] ? __loading__[template] : false;
        item.__loaded__ = __loaded__[template] ? __loaded__[template] : false;
        item.__ready__ = __ready__[template] ? __ready__[template] : false;
        item.__after__ = __after__[template] ? __after__[template] : false;
        
        //send an init event BEFORE we expand further potential templates contained within
        item._issueEvent('__init__');
        
        //after item init seq. (similar to _initList, for list level events, but this is for item!)
        if(item['__loading__'])
            _DeferredLoadingItemEvents.push(item);
        if(item['__loaded__'])
            _DeferredLoadedItemEvents.push(item);
        if(item['__ready__'])
            _DeferredReadyItemEvents.push(item);
        if(item['__after__'])
            _DeferredAfterItemEvents.push(item);
            
        //the real workhorse, here we allow any sub-jtags to have their 15 milliseconds of fame.
        FindJTagsRecursively(item, Global._JTagsLoading);
    }
    
    //INTENT: create all the items in the list! The Basic List Algorithm!    
    //I draw the all the content for a list given a set of objs.
    //NOTE I exist (and am not factored into a 1 create per item) for efficiency,
    //making the list without unneeded method nesting - and allowing jquery templates to also create
    //in bulk (which may be alot faster, depending on how they did it)
    JTag.prototype._createItemsFromObjs = function(objs){
        var self = this;
        
        //do what it takes to reset the jtag for redrawing
        if(this['selectable'] && this.selected.length)
            this.unselectAll();
            
        self.children = new Array;   
        $(self['target']).reset();
                        
        //make the new items - this will make one item for each obj in the array
        try{
            var new_objs = [];
            for(var i=0; i < objs.length; i++){
                var new_obj = mergeObjFromSource_ToDest_(__defaults__[self['template']], {i:i});
                new_objs.push(mergeObjFromSource_ToDest_(objs[i], new_obj));
            }
            
            //if a normal template
            if(self['template'])
                var new_items = $.tmpl(TemplatesCache(self['template']), new_objs).appendTo(self['target']);
                
            //if a jtag_anonymous_template provided
            else if(self['jtag_anonymous_template'])
                var new_items = $.tmpl(self['jtag_anonymous_template'], new_objs).appendTo(self['target']);
                
            //if neither - do nothing!
            else
                return;
            
            if(new_items.length != new_objs.length){
                var msg = "It seems that a list-type jtag's template has more then one top level node! That's not valid, at template: "+self['template']+self['jtag_anonymous_template'];
                alert(msg); throw msg;
            }
                
            for(var i = 0 ; i < new_items.length ; i ++)
                self._initTemplate(new_items[i], new_objs[i]);
            
        }
        
        catch(err){
            var msg = 'error in template ('+self['template']+' most likely): \n'+err+"\n\nnew_objs"+new_objs+'\ntemplate'+'\n'+self['template']+self['jtag_anonymous_template'];
            alert(msg); throw msg;
        }    
    }
    
    //INTENT: update items in a list more efficiently then erasing and redrawing the whole list.
    JTag.prototype._updateItemsUsingObjs = function(items, objs){
        var items_to_be_removed = [];
        var new_items = new Array;

        //the idea is that we return a new set of items to replace the old
        //where those that are deleted are not included, and erased afterwards.
        for(var i = 0 ; i < objs.length ; i ++){
            //if the object is false, merely pass the item on untouched
            if(objs[i] === false)
                new_items.push(items[i]);
                
            //if the return obj has keys, refresh the item with that obj
            else if(gettype(objs[i]) == 'object' && getkeys(objs[i]).length)
                new_items.push(items[i].refresh(objs[i]));
                
            //if the dict is empty delete the obj (after we've updated everything else, to be a little saner ui-wise).
            else
                items_to_be_removed.push(items[i]); 
        }
        
        //delete all objs that were empty in the return objs
        for(var i = 0 ; i < items_to_be_removed.length; i ++)
            items_to_be_removed[i].remove(); 
            
        return new_items;
    }
    
    //INTENT: do whatever is needed right after a list is created.
    JTag.prototype._initList = function(){
        var self = this;

        //if self already loaded once, don't do it again.
        ////if it's the builtin template we ignore all init - the replacement jtag will provide it!
        if(self['uninitialized'])
            self._issueEvent('__init__');
            
        _DeferredLoadingListEvents.push(self);
        _DeferredLoadedListEvents.push(self);
        _DeferredChangedListEvents.push(self); 
            
        if(self['uninitialized']){
            _DeferredReadyListEvents.push(self);
            _DeferredAfterListEvents.push(self);
        }       
        
        if(self['filter'])
            set(self, 'filter', self['filter']);
            
        var to_round = $(self.target).parent().find('.rounded').corner().removeClass('rounded');
        self['uninitialized'] = false;
    }
    
    //this just wraps the normal register that makes passing the fourth argument (an object to bind 
    //registrations to) implicitly, using this jtag as the boundobject.
    //the inclusion of the bound object, and the association of that object with the jtag and register,
    //was part of solving a very difficult problem of removing event handlers when assocoiated nodes,
    //possibly above the node with the registrations, were deleted. the solution is that when 
    //a node associated with a jtag is reset(), not only do the registrations of the node go away,
    //but all the children jtags (already computed in .jchildren!) are recursively visited, and each 
    //removes the handlers they have created by having the obj, attr, and method stored when the registration 
    //was made. When reset() occurs, all set/register events attached to all jtags beneath the reset() call 
    //are unlinked! Too Cool, huh? Took me a full day to solve it after seeing unexplained linear slowdowns on reload().
    JTag.prototype.register = function(obj, attr, method, context){
        register(obj, attr, method, context, this);
    }
    
    JTag.prototype.registerOnce = function(obj, attr, method, context){
        registerOnce(obj, attr, method, context, this);
    }
    
    //register, and also send an event out, if obj[attr] is not undefined.
    JTag.prototype.registerAndRunIfTrue = function(obj, attr, method){
        register(obj, attr, method, undefined, this);
        if(obj[attr])
            method(obj, attr, obj[attr]);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    //INTENT: The following method is called as needed to fire the associated event
    //on the associated thing at the correct time. They both call a method (if present)
    //and fire an event...
        
    //INTENT: A List Initialization Stage. this is what causes __init__ to fire on a list. 
    //the same as for an item except for what is passed to the __init__(x), etc method...
    //the target_item for a list, the item for an item.
    JTag.prototype._issueEvent = function(eventname){     
        if(this[eventname])
            this[eventname].call(this, this.target_item);
        set(this, eventname, this[eventname]);
    }                                             
                                                  
    //INTENT: This will be assigned to an item as _issueEvent, the same as the JTag, so that events can be issued 
    //on an item directly. JTags don't ever call this in this context but always in the context of that lucky item 
    //that receives this method via _initTemplate.
    JTag.prototype._issueItemEvent = function(eventname){
        if(this[eventname])
            this[eventname].call(this, this);
        set(this, eventname, this[eventname]);
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    //INTENT: SORTING:
    //if the list has been given a header, we use it to initiate sorting.
    //This works by passing the template templated node-container for the header in the first 
    //argument, and a relative selector from that container to the cells for each column. 
    //When each cell is  clicked, it will use the given "name" attribute of the cell to 
    //finally choose what field to sort by, using the default value as the visible title of the row.
    //All in all a tidy system... but In the systsem a table header is ALWAYS the same object as is
    //printed in the table, except with the human-readable column names in place of the values.
    JTag.prototype._headerSetup = function(){
        var self = this;
        
        if(self['header'])       
            $($(self['header'][0])).find($(self['header'][1])).each(function(){ 
                var key_to_sort_by = $(this).attr('name');
                
                if(__defaults__[self['template']])
                    $(this).empty().text(__defaults__[self['template']][key_to_sort_by]);

                $(this).bind('click', function(){
                    self.sortBy(key_to_sort_by);
                });
            }); 
    }
    
    //NOTE: Following are some public jtag methods that help out:
    
    JTag.prototype.named = function(name, jtag){
        var target = this instanceof JTag ? this.target : this.jtag.target;
        return $(target).named(name);
    }
    
    //INTENT: find the index of a child in the list
    JTag.prototype.indexOf = function(item){
        return this.children.indexOf(item);
    }
    
    //INTENT: return a list of dictionaries stored in this jtag
    JTag.prototype.childObjects = function(){
        var data = [];
        for(var i = 0; i < this.children.length; i ++)
            data.push(this.children[i].obj);
        return data;
    }
    
    //the items passed in will all acquire a __delete__ attribute in their .obj dict,
    //which, if honored by the backend, will cause the item to be deleted on sync.
    JTag.prototype.markItemsForDelete = function(items){
        for(var i = 0 ; i < items.length ; i ++)
            items[i].obj['__delete__'] = true;
        return items;
    }
    
    //Loop through the children, hiding any that don't match the filter criteria. (all nodes are always inited, just hidden on no-match)
    //this is bound to the 'filter' attribute. setting that on this jtag (to none or to a function meant to evaluate) causes this run.
    JTag.prototype._evaluateFilter = function(){
        var self = this;
        
        //if filter is an empty string or false or undefined, accept all.
        if(!self['filter'])
            self.filter = function(obj){return true};
        
        //cycle through children, marking things that don't pass the filter as hidden or vice versa.    
        for(var i = 0; i < self.children.length ; i ++){
            if(!self.filter(self.children[i].obj)){
                if(self.children[i].selected) 
                    self.children[i].unselect();
                $(self.children[i]).addClass('hidden');
            }else{
                $(self.children[i]).removeClass('hidden');        
            }
        }       
    }
    
//////////////////////////////////////////////////////////////////////////////
//Behaviors that are applied in layers to the list to accenutate it;
//these will be put in seperate files shortly.
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
//mixin methods that manage, save/send, reorganize, etc items in a JTag.
//////////////////////////////////////////////////////////////////////////////
    
    //INTENT: add a new child to a list
    //add a new obj to the list. If no url is given, create an obj using the initial_values
    //if a url IS given, then send the initial_values to the server and use the results to make 
    //the new obj. That is why there are two patterns in the add method.
    //note a cool side effect of sending to the server first is having the DB id of a new obj when it's made.
    JTag.prototype.add = function(initial_values, url){
        var self = this;
        var new_item;
        
        if(initial_values===undefined)
            initial_values = {}
        
        //NOTE: if a url is not defined on the jtag, then do not use syncurl for adding. adding is meant to be local in this case, 
        //only sync operations will use the syncurl in this case! it makes sense, in practice!
        if(!url && self['syncurl']) url = this['syncurl'];
        
        //if a URL has been passed, send the initial value to the server and
        //use the result for the added obj
        if(url != undefined){
            var query = initial_values ? [initial_values] : [{}];
            
            postJSONToURL_UsingObj_AndWhenDone_(url, query, function(result){
                //always expect a list from the server
                var obj = result[0];
                var new_obj = mergeObjFromSource_ToDest_(__defaults__[self['template']], {i:self.children.length});
                mergeObjFromSource_ToDest_(obj, new_obj);
                    
                //make the new obj usin the obj given
                try{
                    if(self['template'])
                        var new_item = $.tmpl(TemplatesCache(self['template']), new_obj).appendTo(self['target'])[0];
                    else if(self['jtag_anonymous_template'])
                        var new_item = $.tmpl(self['jtag_anonymous_template'], new_obj).appendTo(self['target'])[0];
                }catch(e){
                    throw "error in __template__: "+e+' in '+self.template+"\n\n(not having a template defined can cause this too))";
                }
                
                self._initTemplate(new_item, new_obj);
                
                //after adding something to the bottom, show the bottom of the list 
                //if(self['selectable']){
                //    self.children[self.children.length-1].setSelection();
                //    $(self['container']).scrollToBottom();
                //}
                              
                self._issueEvent('__changed__');      
            });
        }
        
        //if they do NOT give a url, then we just add to the list, which was
        //the original pattern.. 
        else{    
            //apply defaults to object!
            var new_obj = {i:self.children.length};
            mergeObjFromSource_ToDest_(__defaults__[self['template']], new_obj);
            mergeObjFromSource_ToDest_(initial_values, new_obj);
                
            try{
                if(self['template'])
                    var new_item = $.tmpl(TemplatesCache(self['template']), new_obj).appendTo(self['target'])[0];
                else if(self['jtag_anonymous_template'])
                    var new_item = $.tmpl(self['jtag_anonymous_template'], new_obj).appendTo(self['target'])[0];
            }catch(e){
                throw "error in __template__: "+e+' in '+self.template+"\n\n(not having a template defined can cause this too))";
            }
            
            self._initTemplate(new_item, new_obj);
            
            //after adding something to the bottom, show the bottom of the list 
            //if(this['selectable']){
            //    this.children[this.children.length-1].setSelection();
            //    $(this['container']).scrollToBottom();
            //}
            
            self._issueEvent('__changed__');
        }  
    }
    
    JTag.prototype.remove = function(selected){
        selected = !(selected instanceof Array) ? [selected] : selected;
        
        $(selected).each(function(){
            this.remove();
        });
            
        this._issueEvent('__changed__');
    }
        
    //INTENT: send all the items in a list to a url and update from the results.
    //syncAll() called on a list cacreate the whole list to be sent and repainted efficiently
    //(from an algorithm standpoint).
    JTag.prototype.syncAll = function(url){    
        var self = this;
        if(!url) url = this['syncurl'];
        this.unselectAll();
        
        //send the list of objs in the list to the server and apply the
        //results to the items, updating, deleting, or skipping as the servers response indicates.
        
        postJSONToURL_UsingObj_AndWhenDone_(url, self.childObjects(), function(objs){
            self._updateItemsUsingObjs(self.children, objs);
            self._issueEvent('__changed__');
        });
    }
    
    //INTENT: send the given items to a server, updating those items from the response.
    //NOTE: I enable the basic jtag protocol: an empty dict is erased (everything is 
    //presumed to have an id or one data item), a false entry means no change, skip 
    //redrawing that item, and any other data is used to refresh item, which is how new items
    //get their id's by the way - on their first sync!
    JTag.prototype.sync = function(items, url){    
        var self = this;
        url = url == undefined ? self['syncurl'] : url;
        url = url == undefined ? self['source'] : url;
        
        //send the list of objs in the list to the server and apply the
        //results to the items, updating, deleting, or skipping as the servers response indicates.
        //(if the server returns an empty list, for example, nothing happens)
        
        var items_to_send = []
        for(var i = 0; i < items.length ; i ++)
            items_to_send.push(items[i].obj);
        
        postJSONToURL_UsingObj_AndWhenDone_(url, items_to_send, function(objs){
            self._updateItemsUsingObjs(items, objs);
            self._issueEvent('__changed__');
        });
    }
    
    //INTENT: given a key name, repaint the list with the itens sorted by that key.
    JTag.prototype.sortBy = function(key, direction){
        if(this.selected)
            this.unselectAll();
        
        var sortedFields = new Array;
        
        if(direction)
            this._sort_direction = direction;
        
        for(var i = 0; i < this.children.length; i ++)
            sortedFields.push( [this.children[i].obj[key], this.children[i].obj] );
            
        sortedFields.sort();
        
        //if "true" sort most to least, false least to most.
        if(!this._sort_direction)
            sortedFields.reverse();
            
        //strip out the objects in the sorted array (index 1) to reload the list with 
        var newObjs = new Array;
        for(var i = 0; i < sortedFields.length; i ++)
            newObjs.push(sortedFields[i][1]);
        
        //this is what actually re-lays out the list.
        this._createItemsFromObjs(newObjs);
        
        //do the opposite in the next call (toggle)
        this._sort_direction = !this._sort_direction;
    }
    
    //INTENT: contains methods that will be assigned to an item to manipulate itself in the list
    //a method that takes an item and assigns methods to it.
    JTagMethodsFor.data = function(item){
        
        var jtag = item.jtag;
        
        //INTENT: stores the last state of an item so it can be rewound if needed.
        item.undo = function(){
            var buf = item.obj;
            set(item, 'obj', item._undoObj);
            item._undoObj = buf;
        }
        
        //INTENT: I will just set the obj on an item - I wont refresh it.
        item.setObj = function(obj){
            item._undoObj = {};
            mergeObjFromSource_ToDest_(item.obj, item._undoObj);
            mergeObjFromSource_ToDest_(item.obj, obj);
            set(item, 'obj', item.obj);
        }
        
        //INTENT: I insert a new item using an obj, before the given item.
        //PLEASE NOTE this is overloaded. It is used both for inserting AND refreshing!
        item.insert = function(obj){
            var jtag = item.jtag;
            //if no object given, use an empty one.
            obj = obj === undefined ? {} : obj;  
            
            //if there was a selection, save what it was before deselecting all.
            var were_selected = jtag['selected'];
            jtag.unselectAll();
                    
            //apply defaults to object!
            var idx = jtag.children.indexOf(item);
            var new_obj = {i:jtag.children.indexOf(item)};       
            mergeObjFromSource_ToDest_(__defaults__[jtag['template']], new_obj);
            mergeObjFromSource_ToDest_(item.obj, new_obj);
            
            if(self['template'])
                var new_item = $.tmpl(TemplatesCache(item.jtag['template']), new_obj).insertBefore(item)[0];
            else if(self['jtag_anonymous_template'])
                var new_item = $.tmpl(item.jtag['jtag_anonymous_template'].template(), new_obj).insertBefore(item)[0];
            
            jtag._initTemplate(new_item, new_obj, true); //true means don't add to .children when preparing             
            
            //rebuild child list. apparently insert ain't workin?
            jtag.children = [];
            var children = $(jtag.target).children();
            for(var i = 0; i < children.length ; i ++)
                jtag.children.push(children[i]);
            
            jtag._issueEvent('__changed__');
            return new_item;
        }

        //INTENT: I will sync the obj paired to an item - and I will recreate the template with the new
        //value, "refreshing" it.
        item.refresh = function(usingObj, refresh_items_in_place_by_object_key_equalling_name){
            var jtag = item.jtag;
            usingObj = usingObj ? usingObj : {};
            item.setObj(usingObj);
            
            //as the variable name implies, if this is true we wil NOT erase and redraw the item to refresh; we'll
            //use each key of the source object as a named node who's value (or checked state, or inner text) should be
            //set using that value.
            if(refresh_items_in_place_by_object_key_equalling_name){
                for(var key in item.obj){
                    var thing_to_set = $(item).find('[name='+key+']');
                    if(thing_to_set[0] !== undefined)
                        if(thing_to_set[0].tagName == 'input')
                            if(thing_to_set[0].type == 'checkbox')  
                                thing_to_set.prop('checked', item.obj[key]);
                            else
                                thing_to_set.val(item.obj[key]);
                        else
                            thing_to_set.text(item.obj[key]);
                }
                return item;
            }
            
            //this method of updating destroys then re-adds the item in the same spot, resetting selection on the item if 
            //it was previously selected.
            else{
                //if there was a selection, save what it was before deselecting all.
                var was_selected = item.selected;
                var was_selection = jtag['selection'] == item;
                item.unselect();

                //apply defaults to object!
                var idx = jtag.children.indexOf(item);
                var new_obj = {i:jtag.children.indexOf(item)};       
                mergeObjFromSource_ToDest_(__defaults__[jtag['template']], new_obj);
                mergeObjFromSource_ToDest_(item.obj, new_obj);
                
                if(item.jtag['template'])
                    var new_item = $.tmpl(TemplatesCache(item.jtag['template']), new_obj).insertBefore(item)[0];
                else if(item.jtag['jtag_anonymous_template'])
                    var new_item = $.tmpl(item.jtag['jtag_anonymous_template'].template(), new_obj).insertBefore(item)[0];
                
                jtag._initTemplate(new_item, new_obj, true); //true means don't add to .children when preparing 
                //jtag.children.insert(new_item, idx);
                item._removeItemFromSelected();
                item._remove();

                //rebuild child list. apparently insert ain't workin?
                jtag.children = [];
                var children = $(jtag.target).children();
                for(var i = 0; i < children.length ; i ++)
                    jtag.children.push(children[i]);
                    
                if(was_selected);
                    new_item.select();
                    
                return new_item;
            }            
        }
        
        //INTENT: empty obj then the obj will be deleted; this is how the server can delete things.
        item.sync = function(url){
            url = url == undefined ? jtag['syncurl'] : url;
            url = url == undefined ? jtag['source'] : url;

            //send obj to server (as a list with one item); 
            //if the entry is blank (no keys) remove it delete it, false skip, else refresh
            
            postJSONToURL_UsingObj_AndWhenDone_(url, [item.obj], function(objs){
                if(objs[0] !== false){
                    getkeys(objs[0]).length == 0 ? 
                        item._remove() :
                        item.refresh(objs[0]);
                    item.jtag._issueEvent('__changed__');
                }
            });
        }
        
        //INTENT: delete from the list *without* selection bells and whistles.
        item._remove = function(){
            var idx = jtag.children.indexOf(item);
            jtag.children.remove(idx);
            $(item).remove();
            jtag._issueEvent('__changed__');
        }
        
        //INTENT: normal delete with bells and whistles
        item.remove = function(){
            if(item['selected'])
                item._removeItemFromSelected();
                
            var idx = jtag.indexOf(item);
            jtag.children.remove(idx);
            $(item).remove();
            
            //set the selection 
            if(jtag['selectable']){
                if(idx > 0)
                    jtag.children[idx-1].setSelection();

                else if(idx == 0 && jtag.children.length)
                    jtag.children[0].setSelection();

                else
                    jtag.unselectAll();
            }
            
            if(jtag['selectable'])
                item._selectionEventIfOneShowing();
            
            jtag._issueEvent('__changed__');
        }
    }

//////////////////////////////////////////////////////////////////////////////
//mixin methods that manage selection
//////////////////////////////////////////////////////////////////////////////

    //INTENT: This will unselect all items. 
    //NOTE that unselecting an item removes
    //it from the .selected array, so we don't want to call unselect()
    //in the loop, or we'll alter the loop we're looping in!
    JTag.prototype.unselectAll = function(){         
        if(this['__unselected__'])
            for(var i = 0; i < this.selected.length ; i ++)
                this['__unselected__'](this.selected[i]);
        
        var obj;
        while((obj = this.selected.pop()))
            obj._toggleSelect(false);
    }
    
    JTag.prototype.selectAll = function(){         
        for(var i = 0; i < this.children.length; i ++){
            this.children[i]._toggleSelect(true);
            this.children[i]._addItemToSelected();
        }
        
        if(this['__selected__'])
            for(var i = 0 ; i < this.selected.length ; i ++)
                this['__selected__'](this.selected[i]);
    }

    //INTENT: methods to add on an item to let it manage selection
    JTagMethodsFor.selecting = function(item){        
        item.selected = false;
            
        //basic hover selection, disabled if selectable[0] is false
        if(item.jtag.selectable[0])
            $(item).hover(
                function(){(!item.selected) ? $(item).addClass(item.jtag['selectable'][0]) : false;}, 
                function(){$(item).removeClass(item.jtag['selectable'][0]);} 
            );
        
        //INTENT: select the item, fire the selection event
        item.select = function(){
            if(!this.selected)
                this._addItemToSelected();
                
            if(this.jtag['__selected__'])
                this.jtag['__selected__'](this);
            
            this._toggleSelect(true);
        }
        
        //INTENT: unselect the item, fire the selection event (on nothing of course)
        item.unselect = function(){
            if(this.jtag['__unselected__'])
                this.jtag['__unselected__'](this);
            
            if(this.selected)
                this._removeItemFromSelected();
                
            this._toggleSelect(false);
        }
        
        //INTENT: if selected, unselect, vice versa
        item.toggleSelect = function(){
            this.selected ? this.unselect() : this.select();
        }
        
        //INTENT: cause only one element to be selected
        item.setSelection = function(){
            this.jtag.unselectAll();
            this.select();
        }
        
        //INTENT: this selects an item, but does so without firing a selection event. i.e. NO set() calls
        item.selectWithoutUpdating = function(){
            this._addItemToSelected();
            this.selected = true;
            
            if(this.jtag.selected.length == 1){
                this.jtag.selectionindex = this.jtag.indexOf(this.jtag.selected[0]);
                this.jtag.selection = this.jtag.selected[0];
            }else{
                this.jtag.selectionindex = -1;
                this.jtag.selection = false;
            }
            
            $(this).addClass(this.jtag['selectable'][1]);
        }
        
        //INTENT: add item to the selected collection data-wise, not ui
        item._addItemToSelected = function(){
            this.jtag.selected.push(this);
        }
    
        //INTENT: remove an item to the selected collection data-wise, not ui
        item._removeItemFromSelected = function(){
            var idx = this.jtag.selected.indexOf(this);
            this.jtag.selected.remove(idx);
        }
        
        //INTENT: grapgically toggle the state of selection (pass true or false or none to toggle), along
        //with evaluating selection status as things are selected/unselected.
        item._toggleSelect = function(to){
            to === undefined ?
                this.selected = !this.selected: 
                this.selected = to;
            
            this.selected ? 
                set(this, 'selected', true) :
                set(this, 'unselected', true); 
                
            (this.jtag.selectable[1] && this.selected) ?
                $(this).addClass(this.jtag['selectable'][1]):
                $(this).removeClass(this.jtag['selectable'][1]);
                
            this._selectionEventIfOneShowing();
        }   
        
        //evaluate list of selected and make item selection if one becomes selected.
        //issue unselection on the reverse condition, two getting selected.
        item._selectionEventIfOneShowing = function(){            
            if(this.jtag.selected.length == 1){
                set(this.jtag, "selectionindex", this.jtag.indexOf(this.jtag.selected[0]));
                set(this.jtag, "selection", this.jtag.selected[0]);
                    
                if(this.jtag['__selection__'])
                    this.jtag['__selection__'](this.jtag.selected[0]);
                    
                set(this.jtag, '__selection__', this.jtag['__selection__']);
            }
            
            else if(this.jtag['selection']){
                var current_selection = this.jtag['selection'];
                
                set(this.jtag, "selectionindex", -1);
                this.jtag.selection = false;
                set(this.jtag, "unselection", current_selection);
                
                if(this.jtag['__unselection__'])
                    this.jtag['__unselection__'](current_selection);
                set(this.jtag, '__unselection__', this.jtag['__unselection__']);  
            }
        };
    
        //this enables select on click. Probably test the key detection boolean here 
        //to chose setSelection() or select(), etc..
        $(item).click(
            //if alt is pressed, multiselect it. otherwise select 
            //just it - unless it's already selected!
            function(){
                var self = this;
                if(isAltPressed && self.jtag.multiselect) 
                    self.toggleSelect()
                    
                else if(!self.selected)
                    self.setSelection();
                    
                return false;
            }
        );
        
        //if a double click is received, interpret it as desire to setSelection, as well
        //as run double click handler
        $(item).dblclick(function(){
            this.setSelection();
            if(this.jtag['__dblclick__'])
                this.jtag['__dblclick__'](item);
            set(this.jtag, '__dblclick__', this.jtag['__dblclick__']);
            return false;
        });
    }
    
    //////////////////////////////////////////////////////////////////////////////
    //cause a method to be called on click
    //////////////////////////////////////////////////////////////////////////////

    //INTENT: cause a function to be called when an item is clicked
    JTagMethodsFor.callingMethodOnClick = function(item, func){
        $(item).click(
            function(){ func(item); }
        );
    }
    
////////////////////////////////////////////////////////////////////////////////
// A foundationally useful UI class included for utility sake.
////////////////////////////////////////////////////////////////////////////////

    //INTENT: allow many <div>'s in a container to be controlled such that
    //only one is displayed at a time.
    
    //Create a UI for showing just 1 out of N layers.
    //...and you can also pass a selector pointing at a <div><span1>...<span N></div> structure
    //each of those spans in /that/ container will become clickable, the Nth span for the Nth pane. 

    var PaneUI = function(selector){
        var self = this;
    
        var container = $(selector)[0];
        container.panes = [];
        container.tabs = [];
        container.shown = false;
        container.selectedtab = false;
        
        var show = function(what){
            var idx = container.panes.indexOf(what);
            container.panes[idx].show();
        };
        
        var showFunction = function(showtab){
            //hide anything shown
            $(container).children().each(
                function(){
                    if(this.shown){
                        $(this).addClass('invisible');
                        $(this).fadeTo(0, 0);
                        set(this, 'shown', false); 
                    }
                }
            );
            
            //if they specificed to show(a)tab, then show that tab)
            if(showtab){
                container.tabs[container.panes.indexOf(this)].show();
                return;
            }
                
            //show the one we want
            $(this).removeClass('invisible');
            $(this).fadeTo(0, 1);     
            
            //set the item to show as shown
            set(this, 'shown', true);
            //set the item shown on this instance
            set(container, 'shown', this);       
        };
        
        var makeTabs = function(selector, highlight_selector){
            $(selector).children().each(function(i, child){
                container.tabs.push(child);
                
                if(i == 0){
                    $(child).addClass(highlight_selector);
                    set(container, 'selectedtab', child);
                }
                
                child.show = function(){
                    $(container.selectedtab).removeClass(highlight_selector);
                    $(child).addClass(highlight_selector);
                    set(container, 'selectedtab', child);
                    container.panes[i].show();
                }
                
                $(child).rebind('click',function(){
                    if(container.selectedtab != child)
                        child.show();
                });
            });
        };
        
        //advertise methods on us AND the container for use elsewhere.
        container.makeTabs = makeTabs;
        self.makeTabs = makeTabs
        container.show = show;
        self.show = show;
        
        $(container).addClass('relative');
    
        //prepare each div in the container to be a pane.
        $(container).children().each(
            function(){
                this.shown = false;
                this.show = showFunction;
                $(this).fadeTo(0, 0);
                $(this).addClass('invisible');
                $(this).addClass('absolute');
                container.panes.push(this);
            }
        );
    
        //show the first item in the pane
        container.panes[0].show();
    }
    
    //INTENT: make it easier to measure and change css pixel values
    var returnCSSWidthOfElementAsInt = function(element){
        var amount_text = $(element).css('width');
        return parseInt(amount_text.substr(0, amount_text.length-2));
    }

////////////////////////////////////////////////////////////////////////////////
// PAGE READY INITIALIZATION i.e. RUN UNINITED REPLICATORS, ROUND CORNERS, ETC.
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// PAGE READY INITIALIZATION i.e. RUN UNINITED REPLICATORS, ROUND CORNERS, ETC.
////////////////////////////////////////////////////////////////////////////////

    //yep, this is really it, the beginning and event loop of the jtag system. It associates one tag 
    //with one JTag such that the text contents of the tag become evaluated as configuration values, 
    //specified by the person writing a document using jtags. done :-)    
    
    //NOTE: Order is VERY important here. This parituclar way visits nodes and makes things the righr way.
    //change with care! 
    var FindJTagsRecursively = function(target, isChild){            
        //mark that a loading cycle (a recursive call starting from some initial call) is beginning.
        if(isChild !== true)
            set(Global, '_JTagsLoading', true);
            
        //start off our processing with all of the child nodes of the target node to process.
        var all_items = $.makeArray($(target).children());
        
        //INTENT: a non-recurisve search algorithm for all top-most jtag nodes, such that only the nodes
        //above an /underlying/ jtag are modified for text variable replacement (i.e. "[=x=]" becomes "{{= x}}"), 
        //and identifying children that need to be processed further (by FindJTagsRecursively, which IS, of course, recursive. 
        //It is felt that using a recursive algorithm to find the nodes to process, since it visits all nodes under a target
        //item and possibly the body, is not appopriate.. oppositely the operation for processing JTags, FindJTagsRecursively, 
        //happens only a fraction of the time in a document, and so is tolerable. It is possible that the FindJTagsRecursively 
        //method will be flattened at some point, but it is far easier to conceive of recursively - and tests do not indicate a 
        //lack of speed, in any case.)
        
        var jtags_to_expand = [];
        var item;
        while(all_items.length){
            //take off the top, looking for jtags... the key here is that by poping here and pushing below - this is depth first
            items = all_items;
            while((item = items.pop())){
                //if we find one
                if($(item).hasClass('jtag')){
                    var jtag_source_text = "";
                    var jtag_anonymous_template_nodes = [];

                    //accumulate text - for options - and nodes - for support of the anonymous template interior to the tag
                    $(item).contents().each(function(){
                        if(this.nodeType == 3)
                            jtag_source_text += $(this).text();
                        else if(this.nodeType == 1)
                            jtag_anonymous_template_nodes.push(this);
                    });

                    //get the jtag_source_text before emptying. Empty so the jtag tag "source text" goes away first!
                    var jtag_source_text = "{"+jtag_source_text+"}"; 
                    //if we use < or > in our code, cause we're in a tag, it's bad news. But turn the entities back to them for use!
                    jtag_source_text = jtag_source_text.replace("&lt;", "<").replace("&gt;", ">");
                    
                    //recurse down the tree. For each node that is NOT under a "jtag" class, replace [=x=]
                    //with {{= x}}, both in the text of the nodes, and in the attributes. 
                    //because we DON'T process anything under the first instance of a jtag, this allows
                    //for recursive identifcation of values to be replaced, regardless of how its nested in anonymous methods!
                    //Note that {{= }} should be used anywhere you want a <script> based template to change values, and 
                    //Always [==] in the body of anonymous templates!
                    if(jtag_anonymous_template_nodes.length){
                        var jtag_anonymous_template_text = "";
                        
                        var recursivelyReplaceAnonymousTextVariablesWithNormalOnesOnElemsNotUnderJTags = function(elem, onlytoptext){
                            for(var i = 0; i < elem.attributes.length ; i ++)
                                elem.attributes[i].nodeValue = elem.attributes[i].nodeValue.replace(/\[\=/g, '{{= ').replace(/\=\]/g, '}}');
                            
                            $(elem).contents().each(function(){
                                if(this.nodeType == 3)
                                    this.nodeValue = this.nodeValue.replace(/\[\=/g, '{{= ').replace(/\=\]/g, '}}');
                                    
                                //note that we don't search into jtags... but we DO search into tags that say they have 
                                //no text of their own they wish to replace! that's what the useParentsText class is saying, here.
                                else if(onlytoptext === undefined && this.nodeType == 1 && !$(this).hasClass('jtag'))
                                    recursivelyReplaceAnonymousTextVariablesWithNormalOnesOnElemsNotUnderJTags(this, true);     
                            });
                        }
                        
                        //for each jtag_anonymous_template_node found, replace text!
                        for(var i = 0; i < jtag_anonymous_template_nodes.length ; i ++){
                            recursivelyReplaceAnonymousTextVariablesWithNormalOnesOnElemsNotUnderJTags(jtag_anonymous_template_nodes[i]);
                            jtag_anonymous_template_text += $("<div></div>").append(jtag_anonymous_template_nodes[i]).html().trim();
                        }
                        
                        //if there is jtag_anonymous_template_text, use it to create a template
                        if(jtag_anonymous_template_text.trim())
                            var jtag_anonymous_template = $("<div>"+jtag_anonymous_template_text+'</div>').template();                        
                        //or indicate there is no jtag_anonymous_template ()
                        else
                            var jtag_anonymous_template = false;
                    }else{
                        jtag_anonymous_template = false;
                    }
                    
                    $(item).empty().removeClass('jtag');
                    jtags_to_expand.push([item, jtag_source_text, jtag_anonymous_template]); //we push here.. but reverse below - so it's evaled in the order we found them.
                }
                
                var children = $(item).children();
                for(var i = 0; i < children.length ; i ++)
                    all_items.push(children[i]);
            }
        }
        
        //now that we've found the jtags to process (at this level of recursion), actually create them!
        //THIS will, if the jtag being made finds it, create yet more jtags beneath it.
        while((thing = jtags_to_expand.pop()))
            new JTag({target:thing[0], jtag_source_text:thing[1], jtag_anonymous_template:thing[2]});
        
        if(isChild !== true){
            //for each jtag we found (and parsed, for its inner templates, etc), process it
            //this ensures that each "layer" (as the dom gets deeper) of jtags gets made depth-first.
            
            //mark that a loading cycle (a recursive call starting from some initial call) has finished.
            set(Global, '_JTagsLoading', false);
            
            //run the accumulated initialization stages, interleaved for all items then list in each stage. order is important!
            var thing;
            
            //Oh ho! the problem is, you see, that any of the methods below can again run FindJTagsRecursively
            //(and when that happens, it's being marked as child method to have it's inits deferred, since setting 
            //_JTagsLoading to false happens after this call.
            //To make sure that ALL methods so deferred are run, we have to loop over these _Deferred* data structures
            //running them until all are empty. At that point, the "steady state" has been achived, we have deferred all
            //method making till all JTags have been made, and things run in a smooth order enabling reliable init order for
            //complex app development.
            while(_DeferredLoadingItemEvents.length || 
                  _DeferredLoadingListEvents.length || 
                  _DeferredLoadedItemEvents.length || 
                  _DeferredLoadedListEvents.length ||
                  _DeferredReadyItemEvents.length || 
                  _DeferredReadyListEvents.length || 
                  _DeferredChangedItemEvents.length || 
                  _DeferredChangedListEvents.length ||
                  _DeferredAfterItemEvents.length || 
                  _DeferredAfterListEvents.length){
                      
                //the loading event happens everytime a template or list is reloaded, incl. the first time
                while((thing = _DeferredLoadingItemEvents.shift()))     thing._issueEvent('__loading__');
                while((thing = _DeferredLoadingListEvents.shift()))     thing._issueEvent('__loading__');
                
                //the loading event happens everytime a template or list is reloaded, after the loading event, incl. the first time,
                while((thing = _DeferredLoadedItemEvents.shift()))    thing._issueEvent('__loaded__');
                while((thing = _DeferredLoadedListEvents.shift()))    thing._issueEvent('__loaded__');
                
                //the ready event runs only on the first load of a template or list, indicating that all lists have loaded for the first time
                while((thing = _DeferredReadyItemEvents.shift()))     thing._issueEvent('__ready__');
                while((thing = _DeferredReadyListEvents.shift()))     thing._issueEvent('__ready__');
                
                //the changed event runs both on init and every time an item or list 
                while((thing = _DeferredChangedItemEvents.shift()))   thing._issueEvent('__changed__');
                while((thing = _DeferredChangedListEvents.shift()))   thing._issueEvent('__changed__');
                
                while((thing = _DeferredAfterItemEvents.shift()))     thing._issueEvent('__after__');
                while((thing = _DeferredAfterListEvents.shift()))     thing._issueEvent('__after__');
            }
            
            //round things - i like being able to do this by css, and javascript, you see...
            var to_round = $(target).parent().find('.rounded').corner().removeClass('rounded');
        }
    }

    //and finally (whew!) the lights dim, the audience hushes, and the show goes on:
    $(document).ready(function(){
        //setup some overlaid divs to respond to ajax errors, normal stuff like that.
        $('body').append("<div id='_JTAGNETWORKSTATUS' class='JTagsFrameworkOverlay'></div>");
        //start the template expand cascade by expanding from the body on down, recursively. The magic!
        FindJTagsRecursively($('body'));
    });
    
    
    
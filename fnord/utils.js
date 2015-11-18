/* Extentions that give localStorage and sessionStorage object-aware pickling mechanisms.
    from https://github.com/daniells/DOM-Storage-Pickles */
(function(){
    var proto = Object.getPrototypeOf(localStorage);
    /* Getting and setting data into storage. Other methods are built on these */
    proto['set'] = function(key,item){ /* pickle an obj, array, regex, or function */
        if(item.constructor == RegExp || item.constructor == Function || item.constructor == Number) item = item.toString();
        else try{item = JSON.stringify(item);} catch(e){} /* no catch nessecary. if not regex num or func, and stringify fails, it's a string. */
        localStorage.setItem(key, item);
    };
    proto['get'] = function(key){  /* unpickle an obj, array, regex, or function */
        var item = localStorage.getItem(key);
        if(item == null) throw('No data stored on the key "' + key + '"');
        else if(item && RegExp(/^\/.*\/\D{0,4}/gi).test(item)){/*is it a RegExp?*/
            var match = item.match(new RegExp('^/(.*?)/([gimy]*)$')); 
            item = new RegExp(match[1], match[2]);
        }
        else if(item && RegExp(/^function\s\(.*\}$/gi).test(item))/*is it a Function?*/
            item = eval( '(' + item + ')' ); /* function srting needs to be encapsulated in JS lambda context */
        else try{ item = JSON.parse(item); } catch(e){} /* unpickles arrays, objects, numbers.  if it falls through all that's left are strings */
        return item; 
    };
    /* Array accessor methods */
    proto['len'] = function(key){ /* get length of the array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array) return stored.length;
        else return false;
    };
    proto['item'] = function(key, index){ /* get an item at index of the stored array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array)
            return stored[index];
        else return false;
        return true;
    };
    proto['indexOf'] = function(){ /* return the index of an item in a stored array */
        var stored = localStorage.get(arguments[0]);
        if(stored.constructor == Array){
            if(arguments.length == 2)
                return stored.indexOf(arguments[1]);
            else if(arguments.length == 3)
                 return stored.indexOf(arguments[1],arguments[2]);
            else throw("wrong number of arguments for Storage.indexOf()");
        } else return false;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['push'] = function(key,item){ /* push an item to the array, return length of array */
        var stored = localStorage.get(key);
        var retval = false;
        if(stored.constructor == Array){
            retval = stored.push(item);
            localStorage.set(key, stored );
        } return retval;
    };
    proto['pop'] = function(key){ /* pop an item from the array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.pop();
            localStorage.set(key, stored);
            return item;
        } else return false;
    };
    proto['shift'] = function(key,item){ /* push an item to the array, return length of array */
        var stored = localStorage.get(key);
        var retval = false;
        if(stored.constructor == Array){
            retval = stored.shift(item);
            localStorage.set(key, stored );
        } return retval;
    };
    proto['unshift'] = function(key){ /* pop an item from the array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.unshift();
            localStorage.set(key, stored);
            return item;
        } else return false;
    };     
    proto['reverse'] = function(key){ /* reverse the array, save, and return it*/
        var stored = localStorage.get(key);
        if(stored.constructor == Array){
            stored = stored.reverse();
            localStorage.set(key, stored);
            return stored;
        }
        else return false;
    };
    proto['concat'] = function(key, array){ /* concat an array onto the stored array */
        var stored = localStorage.get(key);
        var retval = false;        
        if(stored.constructor == Array) retval = stored.concat(array);
        return retval;
    };
    proto['slice'] = function(){ /* Removes the first element from an array and returns that element */
        var stored = localStorage.get(arguments[0]);
        var slice = false;
        if(stored.constructor == Array){
            if(arguments.length == 2) slice = stored.slice(arguments[1]);
            else if(arguments.length == 3) slice = stored.slice(arguments[1],arguments[2]);
            else throw("Wrong number of arguments for localStorage.slice()");
        } return slice;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['keys'] = function(key){ /* return a list of keys from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object) return Object.keys(stored);
        else return false;
    };
    proto['getValue'] = function(key,objkey){ /* return the value of objkey on the object stored at key*/
        var stored = localStorage.get(key);
        if(stored.constructor == Object) return stored[objkey];
        else return false;
    };
    proto['setValue'] = function(key,objkey,value){ /* return a list of keys from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object){
            stored[objkey] = value;
            localStorage.set(key, stored);
        } else return false;
        return true;
    };
    proto['rmValue'] = function(key,objkey){ /* delete a value from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object){
            delete stored[objkey];
            localStorage.set(key, stored);
        } else return false;
        return true;
    };
    /*  All the same accessor methods for sessionStorage too */
    proto = Object.getPrototypeOf(sessionStorage);
    /* Getting and setting data into storage. Other methods are built on these */
    proto['set'] = function(key,item){ /* pickle an obj, array, regex, or function */
        if(item.constructor == RegExp || item.constructor == Function) item = item.toString();
        else try{ item = JSON.stringify(item);} catch(e){}
        sessionStorage.setItem(key, item);
    };
    proto['get'] = function(key){  /* unpickle an obj, array, regex, or function */
        var item = sessionStorage.getItem(key);
        if(item == null) throw('No data stored on the key "' + key + '"');
        else if(item && RegExp(/^\/.*\/\D{0,4}/gi).test(item)){/*is it a RegExp?*/
            var match = item.match(new RegExp('^/(.*?)/([gimy]*)$')); 
            item = new RegExp(match[1], match[2]);
        }
        else if(item && RegExp(/^function\s\(.*\}$/gi).test(item))/*is it a Function?*/
            item = eval( '(' + item + ')' ); /* function srting needs to be encapsulated in JS lambda context */
        else try{ item = JSON.parse(item); } catch(e){} /* unpickles arrays, objects, numbers.  if it falls through all that's left are strings */
        return item;
    };
    /* Array accessor methods */
    proto['len'] = function(key){ /* get length of the array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array) return stored.length;
        else return false;
    };
    proto['item'] = function(key,index){ /* get an item at index of the stored array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array) return stored[index];
        else return false;
        return true;
    };
    proto['indexOf'] = function(){ /* return the index of an item in a stored array */
        var stored = sessionStorage.get(arguments[0]);
        if(stored.constructor == Array){
            if(arguments.length == 2) return stored.indexOf(arguments[1]);
            else if(arguments.length == 3) return stored.indexOf(arguments[1],arguments[2]);
            else throw("wrong number of arguments for sessionStorage.indexOf()");
        } else return false;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['push'] = function(key,item){ /* push an item to the array, return length of array */
        var stored = sessionStorage.get(key);
        var retval = false;
        if(stored.constructor == Array){
            retval = stored.push(item);
            sessionStorage.set(key, stored );
        } return retval;
    };
    proto['pop'] = function(key){ /* pop an item from the array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.pop();
            sessionStorage.set(key, stored);
            return item;
        } else return false;
    };
    proto['shift'] = function(key,item){ /* push an item to the array, return length of array */
        var stored = sessionStorage.get(key);
        var retval = false;
        if(stored.constructor == Array){
            retval = stored.shift(item);
            sessionStorage.set(key, stored);
        } return retval;
    };
    proto['unshift'] = function(key){ /* pop an item from the array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.unshift();
            sessionStorage.set(key, stored);
            return item;
        } else return false;
    };    
    proto['reverse'] = function(key){ /* reverse the array, save, and return it*/
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array){
            stored = stored.reverse();
            sessionStorage.set(key, stored);
            return stored;
        }
        else return false;
    };
    proto['concat'] = function(key, array){ /* concat an array onto the stored array */
        var stored = sessionStorage.get(key);
        var retval = false;        
        if(stored.constructor == Array) retval = stored.concat(array);
        return retval;
    };
    proto['slice'] = function(){ /* Removes the first element from an array and returns that element */
        var stored = sessionStorage.get(arguments[0]);
        var slice = false;
        if(stored.constructor == Array){
            if(arguments.length == 2) slice = stored.slice(arguments[1]);
            else if(arguments.length == 3) slice = stored.slice(arguments[1],arguments[2]);
            else throw("Wrong number of arguments for sessionStorage.slice()");
        } return slice;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['keys'] = function(key){ /* return a list of keys from a stored object */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object) return Object.keys(stored);
        else return false;
    };
    proto['getValue'] = function(key,objkey){ /* return the value of objkey on the object stored at key*/
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object) return stored[objkey];
        else return false;
    };
    proto['setValue'] = function(key, objkey, value){ /* return a list of keys from a stored object */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object){
            stored[objkey] = value;
            sessionStorage.set(key, stored);
        } else return false;
        return true;
    };
    proto['rmValue'] = function(key, objkey){ /* delete a value from a stored object */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object){
            delete stored[objkey];
            sessionStorage.set(key, stored);
        } else return false;
        return true;
    };
})();

/* make an API for storage/retrieval of texts in localstorage  */
(function(){
    var key = "usertexts";
    var proto = Object.getPrototypeOf(localStorage);
    proto.textsGet = function(){ /*  */
        return localStorage.get(key);
    };
    proto.textsPush = function(item){  /*  */
        localStorage.push(key, item);
    };
    proto.textsConcat = function(items){  /*  */
        if(items.prototype == Array){
            localStorage.concat(items);
            return true;
        } else return false;
    };
    proto.textsLength = function(){localStorage.length(key);};  /*  */
    proto.textsItem   = function(index){   /*  */
        if(index.constructor == Number) return localStorage.item(key, index);
        else return false;
    };
})();
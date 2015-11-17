/* Extentions that give localStorage and sessionStorage object-aware pickling mechanisms.
   Supports objects, arrays, regexps, and functions.
   
   This uses text analysis, so if you're storing the text of a rexep or function to 
   use as text simply use localStorage.getItem(key) as you normally would. 
   
    supported methods include:
        // pickling methods
        localStorage.get(key, item)  //  unpickles and returns the stored item as the correct datatype
        localStorage.set(key, item)  //  pickles an array, object, regex, or function
        // array accessor methods
        localStorage.concat(key, array)  //  returns a concatted array from stored array: does not modify stored
        localStorage.indexOf(key, searchElement[, fromIndex])  //  returns the index of element in the array stored on key
        localStorage.item(key, index)  //  if key refers to an array, returns the item at index
        localStorage.len(key)  //  if key refers to an array, returns its length property
        localStorage.push(key, item)  //  pushes item onto the stored array
        localStorage.pop(key)  //  pops first item from the stored array
        localStorage.reverse(key)  //  reverses the array, saves, and returns it 
        localStorage.slice(key, fromIndex[, toIndex]) // returns a slice of the array
        // object accessor methods
        localStorage.getValue(key, objkey) //  returns the value of objkey on the object at storekey
        localStorage.keys(key)  //  if item stored at key is an object, returns a list of its keys
        localStorage.rmValue(key, objkey)  //  sets value on objkey on the object stored at key
        localStorage.setValue(key, objkey, value)  //  sets value on objkey on the object stored at key

   If you use an accessor function on a stored object of the wrong datatype, the method will return false.
   
   i.e. if foo is not an array
        localStorage.length('foo'); 
    will return false.
*/

(function(){
    var proto = Object.getPrototypeOf(localStorage);
    /* Getting and setting data into storage. Other methods are built on these */
    proto['set'] = function(key,item){ /* pickle an obj, array, regex, or function */
        if(item.constructor == RegExp || item.constructor == Function) 
            item = item.toString();
        else try{ item = JSON.stringify(item);} catch(e){}
        localStorage.setItem(key, item);
    };
    proto['get'] = function(key){  /* unpickle an obj, array, regex, or function */
        var item = localStorage.getItem(key);
        if(item && RegExp(/^\/.*\/\D{0,4}/gi).test(item))/*is it a RegExp?*/
            item = new RexExp(item);
        if(item && RegExp(/^function\s\(.*\}$/gi).test(item))/*is it a Function?*/
            item = eval(item);
        else try{ item = JSON.parse(item); } catch(e){}
        return item;
    };
    /* Array accessor methods */
    proto['len'] = function(key){ /* get length of the array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array)
            return stored.length;
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
        }
        return retval;
    };
    proto['pop'] = function(key){ /* pop an item from the array */
        var stored = localStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.pop();
            localStorage.set(key, stored);
            return item;
        }
        else return false;
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
        if(stored.constructor == Array){
            retval = stored.concat(array)
        }
        return retval;
    };
    proto['slice'] = function(){ /* Removes the first element from an array and returns that element */
        var stored = localStorage.get(arguments[0]);
        if(stored.constructor == Array){
            var slice = false;
            if(arguments.length == 2) slice = stored.slice(arguments[1]);
            else if(arguments.length == 3) slice = stored.slice(arguments[1],arguments[2]);
            else throw("Wrong number of arguments for localStorage.slice()");
            return slice;
        }
        else return false;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['keys'] = function(key){ /* return a list of keys from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object)
            return Object.keys(stored);
        else return false;
    };
    proto['getValue'] = function(key,objkey){ /* return the value of objkey on the object stored at key*/
        var stored = localStorage.get(key);
        if(stored.constructor == Object)
            return stored[objkey];
        else return false;
    };
    proto['setValue'] = function(key,objkey,value){ /* return a list of keys from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object){
            stored[objkey] = value;
            localStorage.set(key, stored);
        }
        else return false;
        return true;
    };
    proto['rmValue'] = function(key,objkey){ /* delete a value from a stored object */
        var stored = localStorage.get(key);
        if(stored.constructor == Object){
            delete stored[objkey];
            localStorage.set(key, stored);
        }
        else return false;
        return true;
    };
    proto = Object.getPrototypeOf(sessionStorage);
    /* Getting and setting data into storage. Other methods are built on these */
    proto['set'] = function(key,item){ /* pickle an obj, array, regex, or function */
        if(item.constructor == RegExp || item.constructor == Function) 
            item = item.toString();
        else try{ item = JSON.stringify(item);} catch(e){}
        sessionStorage.setItem(key, item);
    };
    proto['get'] = function(key){  /* unpickle an obj, array, regex, or function */
        var item = sessionStorage.getItem(key);
        if(item && RegExp(/^\/.*\/\D{0,4}/gi).test(item))/*is it a RegExp?*/
            item = new RexExp(item);
        if(item && RegExp(/^function\s\(.*\}$/gi).test(item))/*is it a Function?*/
            item = eval(item);
        else try{ item = JSON.parse(item); } catch(e){}
        return item;
    };
    /* Array accessor methods */
    proto['len'] = function(key){ /* get length of the array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array)
            return stored.length;
        else return false;
    };
    proto['item'] = function(key,index){ /* get an item at index of the stored array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array)
            return stored[index];
        else return false;
        return true;
    };
    proto['indexOf'] = function(){ /* return the index of an item in a stored array */
        var stored = sessionStorage.get(arguments[0]);
        if(stored.constructor == Array){
            if(arguments.length == 2)
                return stored.indexOf(arguments[1]);
            else if(arguments.length == 3)
                 return stored.indexOf(arguments[1],arguments[2]);
            else throw("wrong number of arguments for Storage.indexOf()");
        } else return false;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['push'] = function(key, item){ /* push an item to the array, return length of array */
        var stored = sessionStorage.get(key);
        var retval = false;
        if(stored.constructor == Array){
            retval = stored.push(item);
            sessionStorage.set(key, stored );
        }
        return retval;
    };
    proto['pop'] = function(key){ /* pop an item from the array */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Array){
            var item = stored.pop();
            sessionStorage.set(key, stored );
            return item;
        }
        else return false;
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
        if(stored.constructor == Array){
            retval = stored.concat(array)
        }
        return retval;
    };
    proto['slice'] = function(){ /* Removes the first element from an array and returns that element */
        var stored = sessionStorage.get(arguments[0]);
        if(stored.constructor == Array){
            var slice = false;
            if(arguments.length == 2) slice = stored.slice(arguments[1]);
            else if(arguments.length == 3) slice = stored.slice(arguments[1],arguments[2]);
            else throw("Wrong number of arguments for sessionStorage.slice()");
            return slice;
        }
        else return false;
    };
    /* an API for storage/retrieval of items in an array in obj  */
    proto['keys'] = function(key){ /* return a list of keys from a stored object */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object)
            return Object.keys(stored);
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
        }
        else return false;
        return true;
    };
    proto['rmValue'] = function(key, objkey){ /* delete a value from a stored object */
        var stored = sessionStorage.get(key);
        if(stored.constructor == Object){
            delete stored[objkey];
            sessionStorage.set(key, stored);
        }
        else return false;
        return true;
    };
})();

/* make an API for storage/retrieval of texts in localstorage  */
(function(){
    var key = "usertexts";
    var proto = Object.getPrototypeOf(localStorage);
    proto.textsGet = function(){
        return localStorage.get(key);
    };
    proto.textsPush   = function(item){
        localStorage.set(key,localStorage.get(key).push(item));
    };
    proto.textsConcat  = function(items){
        if(items.prototype == Array){
            localStorage.set(localStorage.get(key).concat(items));
            return true;
        } else return false;
    };
    proto.textsLength = function(){localStorage.get(key).length;};
    proto.textsItem   = function(index){
        if(index.constructor == Number){
            return localStorage.get(key)[index];
        } else return false;
    };
})();
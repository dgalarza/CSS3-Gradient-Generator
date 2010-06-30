/**
* Raptor JetPacks - Because raptors need to fly too!
*
* Raptor HTTP
* Provides automatic queueing of ajax requests
*
* @author Damian Galarza (galarza.d@gmail.com)
*/

// Silently create raptor namespace
if(typeof raptor === 'undefined') {
	var raptor = {};
}

raptor.jetpack = (function () {
	
	var xhr = null;
	
	// Hold our status here (are we currently sending any requests already?)
	var inProgress = false;
	
	// Store the current request that's being sent out
	var currentRequest = null;
	
	// Hold our queue
	var requestQueue = new Array();
	
	// Hold a timeout
	var queueTimeout = null;
	
	var cache = {};
	
	/**
	* Create a jetpack request object which we can popuplate
	* for queueing requests
	*
	* @param {Object} Configuration
	*
	* uri : Request URI
	* method (Optional) : GET|POST (Defaults to get)
	* data (Optional) : Object or array of data to send with the request
	* errorHandler (Optional) : Callback for errors
	* preFire (Optional) : Function to run before running AJAX request
	* success (Optional) : Callback for successful transmission
	* cache (Optional) : Cache GET requests, defaults to true
	* async (Optional) : {Bool}
	* json {Optional} : {Bool} Should we parse the data as JSON
	*  
	*/
	var jetpackRequest = function (cfg) {
		
		// Set the URI for our ajax request; this is required
		try {
			if(cfg.uri) {
				this.uri = cfg.uri;
			}
			else {
				throw 'No URI Specified for the AJAX Request';
				return;
			}
		}
		catch(ex) {};
		
		this.method = cfg.method || 'GET';
		
		// If we're given some data to send; prepare it
		if(cfg.data) {
			this.data = jetpack.prepareQueryString(cfg.data);
		} else {
			this.data = '';
		}
		
		// Set up method specific values
		if(this.method === 'GET') {
			this.uri += '?' + this.data;
			
			this.cache = cfg.cache !== false;
			
		//	if(cfg.cache !== false) this.cache = true;			
		}		
		else {									
			this.cache = cfg.cache || false;
		}
		
		this.errorHandler = cfg.errorHandler || null;
		this.preFire = cfg.preFire || null;
		this.success = cfg.success || null;
		this.async = cfg.async || true;
		this.json = cfg.json || false;
		this.contentType = cfg.contentType || 'application/x-www-form-urlencoded';
		
		/**
		* Now that we have our configuration set up, we can send this now; or push it to the queue
		*/
		if(!inProgress) {
			inProgress = true;
			
			currentRequest = this;
			jetpack.send(this);
		}
		else {
			requestQueue.push(this);
		}
		
	};
	
	var jetpack = {
			
		/**
		* Internal method for creating an XHR object
		*/
		_createXHR : function () {
			if(window.XMLHttpRequest) {
				xhr = new XMLHttpRequest;
			}
			else if(window.ActiveXObject) {
				var _xhr, axo, ex, objects, success = false;
				objects = ['Microsoft', 'Msxml2', 'Msxml3'];
				
				for(var i=0; i<objects.length; i++) {
					axo = objects[i] + '.XMLHTTP';
					
					try {
						_xhr = new ActiveXObject(axo);
						xhr = _xhr;
						success = true;
					}
					
					catch(ex) {};
				}
				
				if(!success) {
					throw 'Unable to create XHR object.';
					return;
				}
			}
			else {
				throw "XMLHttp is not supported.";
				return;
			}
			
			xhr.onreadystatechange = jetpack._onreadystatechange;
		},
		
		/**
		* Internal method for handling XHR ready state change
		*/
		_onreadystatechange : function () {
			if(xhr.readyState == 4) {
				// Finished request		
				if(xhr.status === 200) {
					if(currentRequest.success) {
						// Execute user provided callback for successful transmission
						var response = xhr.responseXML || xhr.responseText;																		
							
						// Handle a 'receiveAs' parameter, converting the data received as needed
						if(currentRequest.json) {							
							if(xhr.responseXML) response = parsers.xml(response);
							else response = parsers.json.read(response);					
						}
						
						// Cache the response if we are supposed to
						if(currentRequest.cache) cache[currentRequest.uri] = response;	
											
						currentRequest.success(response);
					}
					
					jetpack.finishRequest();
				}
				// Error
				else {
					if(currentRequest.errorHandler) {
						// Execute user provided callback for error
						currentRequest.errorHandler();
					}
					
					jetpack.finishRequest();
				}
			}
		},
		
		/**
		* Takes data  and generates a query string to send in our
		* Ajax request
		*
		* @param {Object}
		*/
		prepareQueryString : function (data) {
			var qString = '', i=0;
			for(var name in data) {								
				
				if(i>0) qString += '&'
				
				qString += name + '=' + data[name];
				
				i++;
			}
			
			return qString;
		},
		
		/**
		* Send out a request with the provided
		* Jetpack Request object
		*
		* @param {Object} Jetpack Request
		*/
		send : function (jetpackRequest) {
			jetpack._createXHR();

			xhr.open(jetpackRequest.method, jetpackRequest.uri, jetpackRequest.async);
			xhr.setRequestHeader('Content-Type', jetpackRequest.contentType);

			// Run the user specified throbber function
			if(jetpackRequest.preFire) {
				jetpackRequest.preFire(xhr);
			}
			
			var cachedResponse;
			
			console.log(jetpackRequest.cache);
			
			// Check if cache is set to true and a cache exists for this URI
			if( jetpackRequest.cache && (cachedResponse = cache[jetpackRequest.uri]) ) {
				if(jetpackRequest.success) {
					jetpackRequest.success(cachedResponse);
					jetpack.finishRequest();
				}
			} 
			// Otherwise we should go ahead and send the request
			else {
				if(jetpackRequest.method === 'POST') {
					data = jetpackRequest.data;
				}
				else {
					data = '';
				}										
				
				xhr.send(data);
			}
														
		},
		
		
		/**
		* Finish up the request
		*/
		finishRequest : function () {
			// Reset the current Request
			currentRequest = null;
			
			//If we have another request queued up, fire it
			if(requestQueue.length > 0) {
				currentRequest = requestQueue[0];
				requestQueue = requestQueue.slice(1);
				
				// Force a delay before executing the next request in queue
				setTimeout(function() { jetpack.send(currentRequest); }, 500);
			}
			else {
				// Reset the in progress flag if we're done
				inProgress = false;
			}
		}
	};
	
	// XML Parser Module
	var xmlParser = {
		
			/**
			* Start a parse of an xml doc
			*
			* @param {Object} XML Doc Object
			*/
			read : function(xmlDoc) {		
				// Find the root of the XML file	
				var root = xmlDoc.childNodes[0];
				return xmlParser.nodeParse(root);
			},

			/**
			* Takes a node and parses it recursively
			*
			* @param {Element} Node
			*/
			nodeParse : function(node) {

				var jsonNode = {};
				var simpleNode = true;

				// Check to see if there are any attributes we need to parse for the node
				if(node.attributes.length > 0) {
					simpleNode = false;

					var attributes = node.attributes,
						length = attributes.length,
						_thisAttr;

					for(var i=0; i<length; i++) {
						_thisAttr = attributes[i];

						jsonNode[_thisAttr.nodeName] = _thisAttr.nodeValue;
					}				
				}

				// Check to see if it has child nodes to parse
				if(node.childNodes.length > 1) {			
					var length = node.childNodes.length,
						_thisNode;

					// Loop through child nodes
					var _thisTagName;
						blackList = new Array();

					for(var i=0; i<length; i++) {																		
						_thisNode = node.childNodes[i],
						_thisTagName = _thisNode.tagName;

						if(_thisTagName !== undefined) {	

							// If this tagName was already processed skip this loop iteration
							if(blackList.indexOf(_thisTagName) !== -1) {
								continue;
							}
							// Check to see if this tagName is an array and populate the array for the json object
							if(xmlParser.isArray(_thisTagName, node)) {
								jsonNode[_thisTagName] = xmlParser.childArrParse(_thisTagName, node);
								blackList.push(_thisTagName);
							}
							// Otherwise, just populate it normally
							else {
								jsonNode[_thisTagName] = xmlParser.nodeParse(_thisNode);
							}
						}

					}
				}
				// If length was not > 1 we may have text content to parse
				else if(node.childNodes.length === 1) {

					if(simpleNode) {
						jsonNode = node.childNodes[0].textContent;
					}
					else {
						jsonNode['$t'] = node.childNodes[0].textContent;
					}

				}

				return jsonNode;
			},

			/**
			* Send a tag name and parent to parse
			* all of the children of a specified type
			*
			* @param {String} Tag Name
			* @param {Object} Parent
			*/
			childArrParse : function(tagName, parent) {
				var children = parent.getElementsByTagName(tagName);
				var arr = new Array();

				var length = children.length,
					_thisChild;

				for(var i=0; i<length; i++) {
					_thisChild = children[i];
					arr.push(xmlParser.nodeParse(_thisChild));
				}

				return arr;
			},

			/**
			* Check to see if there are multiple nodes with the same name in
			* parent
			*
			* @param {String} Tag Name
			* @param {Object} Parent node
			*/
			isArray : function(tagName, parent) {
				return parent.getElementsByTagName(tagName).length > 1;
			}
	};
	
	/**
	* JSON Parser module for non-xml data
	*
	* Attempts to use a browser's native JSON parsing abilities
	* if it exists, otherwise degrades down to use of new Function()
	* 
	* TODO: JSON Stringify
	*
	*/
	var jsonParser = {
		
		read : function (data) {
			if(JSON && JSON.parse) { return JSON.parse(data); }
			else return new Function( 'return ' + data )();
		},
		
		stringify : function () {}
		
	};
	
	// Registry of parsers
	var parsers = {
		'xml' : xmlParser.read,
		'json' : jsonParser
	};
	
	return {
		
		/**
		* Enage the jetpack!
		* Send out a request
		* 
		* @param {Object} Configuration for the request 
		* See jetpackRequest
		*/
		engage : function (cfg) {
			var _request = new jetpackRequest(cfg);
		},
		
		// Make parsers publicly available
		parseXML : parsers.xml,		
		parseJSON : parsers.json
	};
		
})();
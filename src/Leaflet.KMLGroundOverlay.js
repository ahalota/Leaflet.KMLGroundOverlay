(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.KMLGroundOverlay = factory(L);
    }
}(function (L) {
	
	//implement your plugin
    var KMLGroundOverlay = L.FeatureGroup.extend({
    	
    	options: {
    		minLod: 150,
    		maxLod: 2048,
    		opacity: 1,
    		adjust: false,
    		numLevels: 99, //impossibly high for my uses
    		isBack: false,
    		//minFileSize
    		//minZoom
    		//maxZoom
    		//numLevels
    		//unloadInvisibleTiles -- set via minFileSize, not needed
    		//fileType
    	},   	
    	
        initialize: function (url, options) { // (String, LatLngBounds, Object)
        	this._url = url.replace(/\/+$/, '');
        	L.Util.setOptions(this, options)
        	this._anchors = this._getAnchors(this._url+"/0/0/0.kml");   
        	this._levelAtZoom = {}; //So we don't have to repeat work
        	this._curLevel = -1; //Default? maybe not needed here.
        	this._fileType = this._getFileType();
        	this.numLevels = this.getNumLevels();
        	
        	        	        	
        	L.FeatureGroup.prototype.initialize.call(this,Array.apply(null, Array(this.numLevels)).map(function () { return L.featureGroup();}));
        },
        
        onAdd: function (map) {
        	this._map = map;
        	this._drawLevel();
        	map.on('zoomend', this._drawLevel, this);
        	return this;
        },
        
        onRemove: function (map) {
        	map.off('zoomend', this._drawLevel, this);
        	if (this._curLevel != -1){
    			L.FeatureGroup.prototype.onRemove.call(this.getLayers()[this._curLevel], map);
        	}
        	this._curLevel = -1;
        	this._map = null;
    	},
        
        
        setOpacity: function(opacity) {
        	this.options.opacity = parseFloat(opacity);
        	
        	if (this._curLevel != -1){
        		this.getLayers()[this._curLevel].eachLayer(function(layer){
        			layer.setOpacity(opacity);
        		});
        		this.getLayers()[this._curLevel].opacity = opacity;
        	}
        	
        	return this;
        },
        
        getOpacity: function(opacity){
        	return this.options.opacity;
        },
        
        getBounds: function(){
        	return L.bounds(this._anchors);
        }
        
        getLevel: function(lev){
        	return this.getLayers()[lev];
        },
        
        bringToBack: function(){
        	L.FeatureGroup.prototype.bringToBack.call(this,map);
        	this.options.isBack = true;
        	return this;
        },
        
        bringToFront: function(){
        	L.FeatureGroup.prototype.bringToFront.call(this,map);
        	this.options.isBack = false;
        	return this;
        },
        
        _getFileType: function(){
        	var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        	
        	if (this.options.fileType) {
        		try{
        			request.open('GET', this._url+"/0/0/0."+this.options.fileType,false);
        			request.send();
        			if (request.status !== 404)
        				return this.options.fileType;
        		} catch (e){
        			console.log("Could not find user-defined file type " + this.options.fileType + ". Searching for jpg/png instead.")
        		}
        	}
        	
        	try{
        		request.open('GET', this._url+"/0/0/0.jpg", false);
        		request.send(); 
        		if (request.status !== 404)
        			return "jpg";
        	}
        	catch (e) {
        		//do nothing
        	}
        	
        	try{
        		request.open('GET', this._url+"/0/0/0.png", false);
	        	request.send(); 
	        	if (request.status !== 404)
	        		return "png";
        	} catch (e) {
        		//do nothing
        	}	

       		console.log("Could not determine file type.");
       		return "ERROR";
        },
        
        _drawLevel: function(){
        	var newLevel = this._getLevelAtZoom(map);
        	
        	if (newLevel != this._curLevel){
        		if (newLevel !== -1){
        			if (this.getLayers()[newLevel].getLayers().length == 0){
        				var newLevelArray = this._buildLevel(newLevel);
        				for (var i = 0 ; i < newLevelArray.length; i++){
        					this.getLayers()[newLevel].addLayer(newLevelArray[i]);
        				}
        			}

        			L.FeatureGroup.prototype.onAdd.call(this.getLayers()[newLevel], map);
        			if (this.options.isBack){
        				this.getLayers()[newLevel].bringToBack();
        			}
        			
        			if (this.getLayers()[newLevel].opacity != this.options.opacity){
        				var opacity = this.options.opacity;
        				this.getLayers()[newLevel].eachLayer(function(layer){ 
       						layer.setOpacity(opacity);
        				});
        				this.getLayers()[newLevel].opacity = this.options.opacity;
        			}
        			
        		}
        		
        		if (this._curLevel != -1){
        			L.FeatureGroup.prototype.onRemove.call(this.getLayers()[this._curLevel], map);
        		}
        	}
        	
        	this._curLevel = newLevel;
        },
        
        _getLevelAtZoom: function(map){
        	var curZoom = map.getZoom();
        	
        	if (typeof (this._levelAtZoom[curZoom]) !== 'undefined'){
        		return this._levelAtZoom[curZoom];
        	} else if (typeof (this.options.minZoom) !== 'undefined' && curZoom < this.options.minZoom){
        		this._levelAtZoom[curZoom] = -1;
        		return -1;
        	} else {
	        	var zoomLevel = 0;
	        	var squarePix;
	        	var maxAnchors = this._getTileAnchors(this.numLevels-1);
	        	var maxDivisions = maxAnchors.sw_nw.length-1;
	        	for (var i = maxDivisions; i >= 1; i/=2){
	        		/*squarePix = ( map.latLngToContainerPoint(maxAnchors.sw_nw[0]).y -
	        					  map.latLngToContainerPoint(maxAnchors.sw_nw[i]).y ) *
	        					( map.latLngToContainerPoint(maxAnchors.sw_se[i]).x -
	        					  map.latLngToContainerPoint(maxAnchors.sw_se[0]).x );*/
	        		
	        		oneSide = ( map.latLngToContainerPoint(maxAnchors.sw_nw[0]).y -
	  					  map.latLngToContainerPoint(maxAnchors.sw_nw[i]).y );
	        		
	               //console.log("i: "	 + i + " squarePix: " + squarePix + " sp2: " + sp2 + " ySide: " + os);
	               if (oneSide > this.options.minLod){
	            	   zoomLevel++;
	               } else {
	            	   this._levelAtZoom[curZoom] = zoomLevel;
	            	   	return zoomLevel;
	               }
	        	}      
        	}
        	this._levelAtZoom[curZoom] = zoomLevel-1; //should not hit this?
        	return this._levelAtZoom[curZoom];
        },
        
        _buildLevel: function(level){       	      		
    		var newLevel = [];
   			var numRows, numCols;
   			numRows = numCols = Math.pow(2,level);
   			var curImg, curAnchor, nwLat, nwLon, swLat, swLon, neLat, neLon, seLat, seLon;
   			var anchorPoints = this._getTileAnchors(level);
   			
   			var xyAdjust = this.options.adjust ? this._getPixelAdjustments(map) : {"lat": 0, "lng" : 0};
   			
   			for (var curRow = 0; curRow < numRows; curRow++){
   				
   				for (var curCol = 0; curCol < numCols; curCol++){
   					
   					if (this.options.minFileSize && this._getImgSize(level,curCol,curRow) < this.options.minFileSize) 
   						continue; // don't add "empty" images if minFileSize given
   					
   					var curImg = this._getImg(level,curCol,curRow);
	   					
   					nwLat = anchorPoints.sw_nw[curRow+1][0] * (1 - (curCol/numCols)) + anchorPoints.se_ne[curRow+1][0] * (curCol/numCols) + xyAdjust.lat;
   					nwLon = anchorPoints.sw_nw[curRow+1][1] * (1 - (curCol/numCols)) + anchorPoints.se_ne[curRow+1][1] * (curCol/numCols);
   					
   					neLat = anchorPoints.sw_nw[curRow+1][0] * (1 - ((curCol+1)/numCols)) + anchorPoints.se_ne[curRow+1][0] * ((curCol+1)/numCols) + xyAdjust.lat;
   					neLon = anchorPoints.sw_nw[curRow+1][1] * (1 - ((curCol+1)/numCols)) + anchorPoints.se_ne[curRow+1][1] * ((curCol+1)/numCols) + xyAdjust.lng;
   					
   					seLat = anchorPoints.sw_nw[curRow][0] * (1 - ((curCol+1)/numCols)) + anchorPoints.se_ne[curRow][0] * ((curCol+1)/numCols);
   					seLon = anchorPoints.sw_nw[curRow][1] * (1 - ((curCol+1)/numCols)) + anchorPoints.se_ne[curRow][1] * ((curCol+1)/numCols) +xyAdjust.lng;
   					
   					swLat = anchorPoints.sw_nw[curRow][0] * (1 - (curCol/numCols)) + anchorPoints.se_ne[curRow][0] * (curCol/numCols);
   					swLon = anchorPoints.sw_nw[curRow][1] * (1 - (curCol/numCols)) + anchorPoints.se_ne[curRow][1] * (curCol/numCols);
   					
   					curAnchor = [[nwLat,nwLon],[neLat,neLon],[seLat,seLon],[swLat,swLon]];
   					newLevel.push(L.imageTransform(curImg,curAnchor, this.options));
   					
   				}
   			}	
    		return newLevel; 
        },
        
        //0.5px at current zoom level translated to lat/lon coordinates to create tiny overlap to remove anti-aliasing gap between tiles.
        //Creates a slight overlap now that's noticeable when opacity is lowered, but better than a constant gap?
        _getPixelAdjustments: function(map){
        	var start = map.containerPointToLatLng([1,1]);
          	var end = map.containerPointToLatLng([1.5,1.5]);
        	
        	console.log("dif: " + (end.lat-start.lat) + " " + (end.lng-start.lng));
        	return {"lat": Math.abs(end.lat-start.lat), "lng": Math.abs(end.lng-start.lng)};
        },
        
        //TODO: hide error message for file not found on past-last level
        getNumLevels: function(){
        	if (typeof this.numLevels !== 'undefined') {
        		return this.numLevels;
        	} 
        	
        	var numLevels = 0;
        	var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        	
        	while(xhr.status != 404 && numLevels < this.options.numLevels){
        		var url = this._url+"/"+(numLevels)+"/0/0."+this._fileType;
        		xhr.onerror = function() { /*do nothing*/};
            	xhr.open('HEAD', url, false);
            	xhr.send();        		
        		if (xhr.status === 200){ numLevels++; }
        	}
        	
        	return numLevels;
        },
        
        _getAnchors: function(url){
        	var xhr = new XMLHttpRequest();
       	
       		xhr.onerror = function() { console.log("Error while getting XML.");	}

       		xhr.open("GET", url, false);
       		xhr.send();
        		
       		var coordString = xhr.responseXML.getElementsByTagName("coordinates")[0].innerHTML;
       		coordString = coordString.replace(/(\r\n|\n|\r)/gm,",");
       		var coords = coordString.split(",");
       		var nwLat = parseFloat(coords[11]);
       		var nwLon = parseFloat(coords[10]);
       		var neLat = parseFloat(coords[8]);
       		var neLon = parseFloat(coords[7]);
       		var seLat = parseFloat(coords[5]);
       		var seLon = parseFloat(coords[4]);
       		var swLat = parseFloat(coords[2]);
       		var swLon = parseFloat(coords[1]);
			
			return [[nwLat,nwLon],[neLat,neLon],[seLat,seLon],[swLat,swLon]];
        },
        
        _getImg : function(level, col,row){
        	return this._url+"/"+level+"/"+col+"/"+row+"."+this._fileType;
        },
                
        _getImgSize(level,col,row) {
        	var url = this._url+"/"+level+"/"+col+"/"+row+"."+this._fileType;
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", url, false); 
            xhr.send();
            return parseInt(xhr.getResponseHeader("Content-Length"))
        },
        
        //(0,0) in bottom left corner of img
        _getTileAnchors : function(level){
        	var dims = Math.pow(2,level);
        	var sw_nw_parts = [];
        	var sw_se_parts = [];
        	var nw_ne_parts = [];
        	var se_ne_parts = [];
        	for (var i = 0; i <= dims; i++){
        		var ratio = i/dims;
        		var newLat, newLon;
        		
        		newLat = this._anchors[3][0] * (1-ratio) + this._anchors[0][0] * ratio;
        		newLon = this._anchors[3][1] * (1-ratio) + this._anchors[0][1] * ratio;
        		sw_nw_parts.push([newLat,newLon]);
        		
        		newLat = this._anchors[3][0] * (1-ratio) + this._anchors[2][0] * ratio;
        		newLon = this._anchors[3][1] * (1-ratio) + this._anchors[2][1] * ratio;
        		sw_se_parts.push([newLat,newLon]);
        		
        		newLat = this._anchors[0][0] * (1-ratio) + this._anchors[1][0] * ratio;
        		newLon = this._anchors[0][1] * (1-ratio) + this._anchors[1][1] * ratio;
        		nw_ne_parts.push([newLat,newLon]);
        		
        		newLat = this._anchors[2][0] * (1-ratio) + this._anchors[1][0] * ratio;
        		newLon = this._anchors[2][1] * (1-ratio) + this._anchors[1][1] * ratio;
        		se_ne_parts.push([newLat,newLon]);
        	}
        	        	
        	return {sw_nw: sw_nw_parts,
        			sw_se: sw_se_parts,
        			nw_ne: nw_ne_parts,
        			se_ne: se_ne_parts};
        }
    });
    
    // return your plugin when you are done
    return KMLGroundOverlay;
}, window));
/*
    Usage: $('.js-tri').triangles();

    Markup:
        <div class="trianglewrapper">
            <canvas id="canvas0" class="triangles js-tri"/>
        </div>
        The canvas element must have an id and it must be unique.
        The element .trianglewrapper must either have a width and height set or one must be automatically enforced by putting an image inside it. The plugin will convert the canvas to be absolutely positioned over whatever is in the parent and size it to match the parent.
        In the example provided the canvas has been styled with a background image of a 'grid' to match the outputted triangles, but this is not required by the plugin.

    Options:
		triangleWidth: number, width of the outputted triangles.
		triangleHeight: number, height of the outputted triangles. Both width and height default to 28 and do not scale. Note that width and height do not have to be equal.
		colour: string representing an rgb colour value for the outputted triangles, defaults to blue, '38,60,73'
		surrogate: classname of an element that is positioned on top of the canvas but should still allow interaction with the canvas. Should be in the form '.class'
*/
(function (window,$) {
	var Plugin = function(elem,options){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options
	}

	Plugin.prototype = {
		init: function(){
			var thisobj = this;
			this.settings = $.extend({
				triangleWidth: 28,
				triangleHeight: 28,
				colour: '38,60,73',
				surrogate: '',
			}, this.defaults, this.options);

            this.canvas;
            this.cxt;
            this.trianglestore = [];
            this.loop;
            this.plusx;
            this.plusy;
            
            this.startx = 'unset';
            this.starty = 'unset';

            this.triangles = {
                general: {
                    //set up function, starts it off
                    initialise: function(){
                        thisobj.canvas = document.getElementById(thisobj.$elem.attr('id'));
                        thisobj.triangles.general.initCanvasSize();
                        thisobj.triangles.general.initCanvas();
                        thisobj.triangles.draw.drawLoop();
                    },
                    initCanvasSize: function(){
                        //store offset position of this canvas
                        var offset = thisobj.$elem.offset();
                        thisobj.plusx = offset.left;
                        thisobj.plusy = offset.top;
                        //make canvas the same size as its parent
                        var parentel = thisobj.$elem.parent();
                        thisobj.canvas.width = parentel.width();
                        thisobj.canvas.height = parentel.height();
                        
                        if(thisobj.startx == 'unset'){
                            thisobj.startx = thisobj.$elem.width() / 2;
                            thisobj.starty = thisobj.$elem.height() / 2;
                        }
                    },
                    //initialise the canvas and return the canvas context
                    initCanvas: function(){
                        if(thisobj.canvas.getContext){
                            thisobj.cxt = thisobj.canvas.getContext('2d');
                        }
                        else {
                            thisobj.canvas.html("Your browser does not support canvas. Sorry.");
                        }
                    },
                    clearCanvas: function(){
                        thisobj.cxt.clearRect(0, 0, thisobj.canvas.width, thisobj.canvas.height);//clear the canvas
                        var w = thisobj.canvas.width;
                        thisobj.canvas.width = 1;
                        thisobj.canvas.width = w;
                    }
                },
                draw: {
                    callDraw: function(e){
                        //draw the triangle under the mouse
                        thisobj.triangles.draw.createTriangles(e.pageX - thisobj.plusx,e.pageY - thisobj.plusy,1);
                        //also draw a slightly random one beneath it
                        thisobj.triangles.draw.createTriangles(e.pageX - thisobj.plusx + (thisobj.settings.triangleWidth / 2),e.pageY - thisobj.plusy + (thisobj.settings.triangleWidth / 2), 0.5);
                    },
                    //create a triangle based on the current mouse position
                    createTriangles: function(x,y,opacity){
                        var triw = thisobj.settings.triangleWidth;
                        var trih = thisobj.settings.triangleHeight;
            
                        //reset x y to 'grid'
                        var nx = Math.floor(x / triw);
                        nx = nx * triw;
                        var ny = Math.floor(y / trih);
                        ny = ny * trih;
            
                        var mx = x - nx;
                        var my = y - ny;
            
                        var ntri; //our new triangle
                        var ntri2; //accompanying faded triangle
                        //work out which 'half' of the square the cursor is in
                        if((mx + my) < ((triw + trih) / 2)){ //top left triangle
                            ntri = [[nx,ny],[nx + triw,ny],[nx,ny + trih],opacity];
                        }
                        else { //bottom right triangle
                            ntri = [[nx + triw,ny + trih],[nx + triw,ny],[nx,ny + trih],opacity];
                        }
                        if(thisobj.triangles.draw.checkIfExists(ntri)){
                            thisobj.trianglestore.push(ntri);
                        }
                    },
                    //given some points, draw a triangle
                    drawTriangle: function(p1,p2,p3,opacity){
                        thisobj.cxt.fillStyle="rgba(" + thisobj.settings.colour + "," + opacity + ")";
                        thisobj.cxt.beginPath();
                        thisobj.cxt.moveTo(p1[0],p1[1]);
                        thisobj.cxt.lineTo(p2[0],p2[1]);
                        thisobj.cxt.lineTo(p3[0],p3[1]);
                        thisobj.cxt.closePath();
                        thisobj.cxt.fill();
                    },
                    //timed loop, draws all the triangles
                    drawLoop: function(){
                        thisobj.triangles.general.clearCanvas();
                        for(var i = 0; i < thisobj.trianglestore.length; i++){
                            var curr = thisobj.trianglestore[i];

                            //if it's less than 0 opacity, we don't draw it, so delete it
                            //weirdly on some mobile devices 0 opacity is draw as black, so we use the 0.1 cutoff rather than 0
                            if(thisobj.trianglestore[i][3] < 0.1){
                                thisobj.trianglestore.splice(i, 1)
                            }
                            else {
                                thisobj.triangles.draw.drawTriangle(curr[0],curr[1],curr[2],curr[3]);
                                if(thisobj.trianglestore[i][3] == 1){
                                    thisobj.trianglestore[i][3] = 0.6 + 0.1;
                                }
                                thisobj.trianglestore[i][3] -= 0.1; //thisobj.settings.fadeSpeed
                            }
                        }
                        thisobj.loop = setTimeout(thisobj.triangles.draw.drawLoop,60); //repeat
                    },
                    //compare the proposed triangle with the others in existence to make sure it's not already there
                    checkIfExists: function(item){
                        for(var z = 0; z < thisobj.trianglestore.length; z++){
                            if(thisobj.trianglestore[z].equals(item)){
                                return false;
                            }
                        }
                        return true;
                    }
                },
                mobile: {
                    //detect motion on mobile devices
                    addListeners: function(){
                        //http://stackoverflow.com/questions/4378435/how-to-access-accelerometer-gyroscope-data-from-javascript/4378439#4378439
                        if (window.DeviceOrientationEvent) {
                            window.addEventListener("deviceorientation",function(){
                                thisobj.triangles.mobile.tilt([event.beta, event.gamma]);
                            },true);
                        } else if (window.DeviceMotionEvent) {
                            window.addEventListener('devicemotion',function(){
                                thisobj.triangles.mobile.tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
                            },true);
                        } else {
                            window.addEventListener("MozOrientation",function(){
                                thisobj.triangles.mobile.tilt([orientation.x * 50, orientation.y * 50]);
                            },true);
                        }
                    },
                    //if on mobile draw some triangles based on the orientation of the device
                    tilt: function(movement){
                        var movex = movement[0];
                        var movey = movement[1];

                        //need to adjust mobile movement based on device orientation, is either 0, 90, 180, or brilliantly, -90
                        //by default -90 works with this code
                        switch(window.orientation){
                            case 0:
                                movex = -movement[1];
                                movey = movement[0];
                                break;
                            case 90: //opposite of -90, the default
                                movex = -movex;
                                movey = -movey;
                                break;
                            case 180:
                                movex = movement[1];
                                movey = -movement[0];
                                break;
                        }
                        var drawit = 0;
                        var xtol = 0.6;
                        var ytol = 0.6;

                        //only draw triangle if device is not level
                        if(movex > xtol || movex < -xtol){
                            thisobj.startx = Math.min(thisobj.$elem.width() - thisobj.settings.triangleWidth, Math.max(thisobj.startx - movex, 0));
                            drawit = 1;
                        }
                        if(movey > ytol || movey < -ytol){
                            thisobj.starty = Math.max(0, Math.min(thisobj.starty + movey, thisobj.$elem.height() - thisobj.settings.triangleHeight));
                            drawit = 1;
                        }
                        //$('#messages').html(movement[0] + "<br/>" + movement[1] + "<br/>" + thisobj.startx + " (" + thisobj.$elem.width() + ")<br/>" + thisobj.starty + " (" + thisobj.$elem.height() + ")" + "<br/>" + window.orientation);
                        if(drawit){
                            thisobj.triangles.draw.createTriangles(thisobj.startx,thisobj.starty,1);
                            thisobj.triangles.draw.createTriangles(thisobj.startx + (thisobj.settings.triangleWidth / 2),thisobj.starty + (thisobj.settings.triangleWidth / 2), 0.5); //also draw a slightly random one beneath it
                        }
                    }
                }
            };
            
            //http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
            Array.prototype.equals = function(array) {
                // if the other array is a falsy value, return
                if (!array)
                    return false;
                // compare lengths - can save a lot of time
                if (this.length != array.length)
                    return false;
                for (var i = 0, l=this.length; i < l; i++) {
                    // Check if we have nested arrays
                    if (this[i] instanceof Array && array[i] instanceof Array) {
                        // recurse into the nested arrays
                        if (!this[i].equals(array[i]))
                            return false;
                    }
                    else if (this[i] != array[i]) {
                        // Warning - two different object instances will never be equal: {x:20} != {x:20}
                        return false;
                    }
                }
                return true;
            }               

            thisobj.triangles.general.initialise();
            if('ontouchstart' in document.documentElement){
                thisobj.triangles.mobile.addListeners();
            }

            $(window).on('resize',function(){
                thisobj.triangles.general.initCanvasSize();
            });

            this.$elem.mousemove(function(e) {
                thisobj.triangles.draw.callDraw(e);
            });
            $(thisobj.settings.surrogate).mousemove(function(e){
                console.log('surrogate');
                thisobj.triangles.draw.callDraw(e);
            });
            
		},
	}
	$.fn.triangles = function(options){
		return this.each(function(){
			new Plugin(this,options).init();
		});
	}
	window.Plugin = Plugin;
})(window,jQuery);
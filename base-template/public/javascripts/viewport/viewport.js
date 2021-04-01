

console.log('Viewport.js')

var Viewport = function() {

	return new Viewport.init()

}


Viewport.prototype = {

	changeView: function() {

	}

}

Viewport.init = function() {

	//set properties and run initialization functions
	this.camera = null
	this.scene = null


}

Viewport.init.prototype = Viewport.prototype


const viewport = Viewport()


viewport.changeView()


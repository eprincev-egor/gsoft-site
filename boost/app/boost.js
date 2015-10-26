	
	
	var fs = require("fs");
	
	this.run = function() {
		
		var html = this.path + "/index.html";
		html = fs.readFileSync(html).toString();
		
		fs.writeFileSync(
			this.__entity__ + ".html", 
			this.replaceWords(html)
		);
		
		var js = this.path + "/App.js";
		js = fs.readFileSync(js).toString();
		
		fs.writeFileSync(
			"js/classes/" + this.__Entity__ + "App.js",
			this.replaceWords(js)
		);
		
		
		var css = this.path + "/style.css";
		css = fs.readFileSync(css).toString();
		
		fs.writeFileSync(
			"css/" + this.__Entity__ + ".css",
			this.replaceWords(css)
		);
		
		console.log("success");
	}
	
var hogan = require('hogan.js');
var fs = require('fs');
var _ = require('underscore');


(function (expressHogan) {
	expressHogan.compile = function(source, options) {
		if (typeof source == 'string') {
			return function(options) {
				options.locals = options.locals || {};
				options.partials = options.partials || {};

				if (options.body) {
					options.locals.body = options.body;
				}
				if (options.app && options.app.dynamicViewHelpers) {
					for (var i in options.app.dynamicViewHelpers) {
						options.locals[i] = options[i];
					}
				}
				if(options.app && options.app._locals) {
					for(var j in options.app._locals) {
						options.locals[j] = options[j];
					}
				}
				if(options.app && options.app.settings) {
					options.locals.settings = options.app.settings;
				}
				if(options.filename) {
					options.locals.filename = options.filename;
				}

				var template = hogan.compile(source);

				for (var k in options.partials) {
					if (typeof options.partials[k].r == 'function') continue;
					options.partials[k] = hogan.compile(options.partials[k]);
				}

				return template.render(options.locals, options.partials);
			};
		} else {
			return source;
		}
	};
	expressHogan.preparePartials = function(root, partials, func) {
		var sources = {};
		var ready = _.after(partials.length, func);
		for (var i in partials) {
			(function(i) {
				fs.readFile(root + '/' + partials[i] + '.html', function(err, data) {
					if (err) {
						console.log(err);
						return;
					}
					sources[partials[i]] = data.toString('utf8');
					ready(sources);
				});
			})(i);
		}
	};
})(typeof exports !== 'undefined' ? exports : expressHogan);

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bump_Stop = function () {
	function Bump_Stop() {
		_classCallCheck(this, Bump_Stop);
	}

	_createClass(Bump_Stop, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_bump_stop";

			this.setup();

			if (this.settings && pb.data("route").name == "thread") {
				$(this.ready.bind(this));
			}
		}
	}, {
		key: "ready",
		value: function ready() {
			var message = this.limit_message();

			if (message && message.message) {
				var title = message.title || "Old Topic";
				var $container = $("<div class='container'></div>");
				var $title = $("<div class='title-bar'><h2>" + title + "</h2></div>");
				var $content = $("<div class='content pad-all'>" + message.message + "</div>");

				var title_css = {};
				var content_css = {};

				if (message.title_bar_bg_colour.length) {
					title_css["background-color"] = "#" + message.title_bar_bg_colour;
				}

				if (message.title_bar_bg_image.length) {
					title_css["background-image"] = "url('" + message.title_bar_bg_image + "')";
				}

				if (message.title_bar_text_colour.length) {
					$title.find("h2").css("color", "#" + message.title_bar_text_colour);
				}

				if (message.content_text_colour.length) {
					content_css["color"] = "#" + message.content_text_colour;
				}

				if (message.content_bg_colour.length) {
					content_css["background-color"] = "#" + message.content_bg_colour;
				}

				if (message.content_bg_image.length) {
					content_css["background-image"] = "url('" + message.content_bg_image + "')";
				}

				if (message.content_border_colour.length) {
					content_css["border-color"] = "#" + message.content_border_colour;
				}

				$title.css(title_css);
				$content.css(content_css);

				$container.append($title).append($content);

				$("#content").before($container);
			}
		}
	}, {
		key: "limit_message",
		value: function limit_message() {
			var one_day = 86400000;
			var now = +new Date();
			var last_post = pb.data("page").thread.last_post_time * 1000;
			var diff = Math.abs(now - last_post);
			var message = {};
			var lowest = Number.MAX_SAFE_INTEGER;

			for (var i = 0, l = this.settings.limits.length; i < l; ++i) {
				var limit = this.settings.limits[i];

				if (this.limit_board(limit.boards)) {
					var exempted = this.member_exempted(limit.exempted_members);
					var show_for_exempted = limit.show_for_exempted == "" ? true : !!parseInt(limit.show_for_exempted, 10);
					var show_for_guests = limit.show_for_guests == "" ? true : !!parseInt(limit.show_for_guests, 10);

					console.log(exempted, show_for_exempted, show_for_guests);

					if (exempted && !show_for_exempted || !pb.data("user").is_logged_in && !show_for_guests) {
						continue;
					}

					if (parseInt(limit.disable_replies, 10) == 1 && !exempted) {
						this.disable_replies();
					}

					var days_cut_off = parseInt(limit.days, 10) || 0;
					var days_since_last_post = Math.round(diff / one_day);

					if (days_since_last_post >= days_cut_off && days_cut_off < lowest) {
						lowest = days_cut_off;
						message = limit;
					}
				}
			}

			return message;
		}
	}, {
		key: "member_exempted",
		value: function member_exempted(members) {
			return $.inArrayLoose(pb.data("user").id, members) > -1;
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.settings = plugin.settings;
			}
		}
	}, {
		key: "disable_replies",
		value: function disable_replies() {
			$(".reply-button, .quote-button, .edit-button, .quick-reply").hide();
		}
	}, {
		key: "limit_board",
		value: function limit_board(boards) {
			if (!boards.length) {
				return true;
			}

			var board_id = parseInt(pb.data("page").board.id, 10);

			return $.inArrayLoose(board_id, boards) > -1;
		}
	}]);

	return Bump_Stop;
}();


Bump_Stop.init();
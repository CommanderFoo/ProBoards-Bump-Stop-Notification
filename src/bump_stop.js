class Bump_Stop {

	static init(){
		this.PLUGIN_ID = "pd_bump_stop";

		this.setup();

		if(this.settings && pb.data("route").name == "thread"){
			$(this.ready.bind(this));
		}
	}

	static ready(){
		let message = this.limit_message();

		if(message && message.message){
			let title = message.title || "Old Topic";
			let $container = $("<div class='container'></div>");
			let $title = $("<div class='title-bar'><h2>" + title + "</h2></div>");
			let $content = $("<div class='content pad-all'>" + message.message + "</div>");

			let title_css = {};
			let content_css = {};

			if(message.title_bar_bg_colour.length){
				title_css["background-color"] = "#" + message.title_bar_bg_colour;
			}

			if(message.title_bar_bg_image.length){
				title_css["background-image"] = "url('" + message.title_bar_bg_image + "')";
			}

			if(message.title_bar_text_colour.length){
				$title.find("h2").css("color", "#" + message.title_bar_text_colour);
			}

			if(message.content_text_colour.length){
				content_css["color"] = "#" + message.content_text_colour;
			}

			if(message.content_bg_colour.length){
				content_css["background-color"] = "#" + message.content_bg_colour;
			}

			if(message.content_bg_image.length){
				content_css["background-image"] = "url('" + message.content_bg_image + "')";
			}

			if(message.content_border_colour.length){
				content_css["border-color"] = "#" + message.content_border_colour;
			}

			$title.css(title_css);
			$content.css(content_css);

			$container.append($title).append($content);

			$("#content").before($container);
		}
	}

	static limit_message(){
		let one_day = 86400000;
		let now = + new Date();
		let last_post = pb.data("page").thread.last_post_time * 1000;
		let diff = Math.abs(now - last_post);
		let message = {};
		let lowest = Number.MAX_SAFE_INTEGER;

		for(let i = 0, l = this.settings.limits.length; i < l; ++ i){
			let limit = this.settings.limits[i];

			if(this.limit_board(limit.boards)){
				let exempted = this.member_exempted(limit.exempted_members);
				let show_for_exempted = (limit.show_for_exempted == "")? true : !! parseInt(limit.show_for_exempted, 10);
				let show_for_guests = (limit.show_for_guests == "")? true : !! parseInt(limit.show_for_guests, 10);

				console.log(exempted, show_for_exempted, show_for_guests);

				if((exempted && !show_for_exempted) || (!pb.data("user").is_logged_in && !show_for_guests)){
					continue;
				}

				if(parseInt(limit.disable_replies, 10) == 1 && !exempted){
					this.disable_replies();
				}

				let days_cut_off = parseInt(limit.days, 10) || 0;
				let days_since_last_post = Math.round(diff / one_day);

				if(days_since_last_post >= days_cut_off && days_cut_off < lowest){
					lowest = days_cut_off;
					message = limit;
				}
			}
		}

		return message;
	}

	static member_exempted(members){
		return ($.inArrayLoose(pb.data("user").id, members) > -1);
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.settings = plugin.settings;
		}
	}

	static disable_replies(){
		$(".reply-button, .quote-button, .edit-button, .quick-reply").hide();
	}

	static limit_board(boards){
		if(!boards.length){
			return true;
		}

		let board_id = parseInt(pb.data("page").board.id, 10);

		return ($.inArrayLoose(board_id, boards) > -1);
	}

}
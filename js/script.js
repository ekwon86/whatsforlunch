var current_location;
var options = {
    enableHighAccuracy: true,
    maximumAge: 0
};
var coordinates = {};

function success (pos) {
    //set accessible variable to to the coordinates of the position object returned from the geolocation
    var crd = pos.coords;
    // console.log("Latitude: " + crd.latitude);
    // console.log("Longiude: " + crd.longitude);
    // console.log("Within: " + crd.accuracy + "meters");
    //set the global variable coordinate's key/value pairs
    coordinates.latitude = crd.latitude;
    coordinates.longitude = crd.longitude;
    return crd;
}

function error(err) {
    console.warn("Error(" + err.code + "):" + err.message);
}

function click_circle() {
    $('.circle').on('click', function() {
        $(".landing-heading").hide();
        $("#disclaimer").hide();
        foursquare_call(coordinates);
        var $this = $(this);
        $this.css('z-index', 2).removeClass('expanded').css('z-index', 1);
        $this.animate(
            {expansion: 10 },
            {
                step: function(now) {
                    $(this).css('-webkit-transform','scale('+now+')');
                },
                complete:function() {
                    window.location.href = "#results";
                    $("body").css('background-color', '#ffaa00 ');
                }
            }, 300).addClass('expanded');
    });
}

function foursquare_call(crd){
    $.ajax({
        dataType: "JSON",
        url: "https://api.foursquare.com/v2/venues/explore?client_id=BJ55LPF34FXTMHV4VOW0L0VMAUV4MYG2VK3JC33ELWU2KOXZ&client_secret=KNMJ3JKCNBI4AUWZNHPLZBQZSMEQTURPQW0EGS4AKOO2TM3X&v=20130815&ll=33.8121,-117.9190&venuePhotos=1&query=lunch",
        method: "GET",
        data: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radius: 50000,
            user_id: 555,
            search_option: {
                option: "random",
                category: "sushi"
            }
        },
        success: function (response){
            fourSquareReturn(response);
            console.log(response.response);
        },
        error: function(response){
            console.log(response);
        }
    })
}

function fourSquareReturn(response){
    var restauraunts = [];
    var fourSquareResponse = response.response.groups[0].items;
    for(var x = 0; x < fourSquareResponse.length; x++){
        var fourSquareObj = {};
        if (response.response.groups[0].items[x].venue.photos.count >= 1){
            fourSquareObj.name = response.response.groups[0].items[x].venue.name;
            fourSquareObj.distance = response.response.groups[0].items[x].venue.location.distance;
            fourSquareObj.photo = response.response.groups[0].items[x].venue.photos.groups[0].items[0].prefix + "300x200"+ response.response.groups[0].items[x].venue.photos.groups[0].items[0].suffix;
            fourSquareObj.hours = response.response.groups[0].items[x].venue.hours.status;
            fourSquareObj.category_1 = response.response.groups[0].items[x].venue.categories[0].name;
            fourSquareObj.tips = response.response.groups[0].items[x].tips[0].text;
            fourSquareObj.user_first_name = response.response.groups[0].items[x].tips[0].user.firstName;
            fourSquareObj.user_last_name = response.response.groups[0].items[x].tips[0].user.lastName;
            // if(fourSquareResponse[x].venue.hasOwnProperty('price')){
            //     fourSquareObj.price = response.response.groups[0].items[x].price.message;
            // }
            // else {
            //     fourSquareObj.price = "Unknown";
            // }
            fourSquareObj.checkins = response.response.groups[0].items[x].venue.stats.checkinsCount;
            fourSquareObj.website =  response.response.groups[0].items[x].venue.url;
            fourSquareObj.popularity = response.response.groups[0].items[x].summary;
            fourSquareObj.phone = response.response.groups[0].items[x].venue.contact.formattedPhone;
            fourSquareObj.venueid = response.response.groups[0].items[x].venue.id;
            fourSquareObj.street =  response.response.groups[0].items[x].venue.location.address;
            fourSquareObj.city = response.response.groups[0].items[x].venue.location.city;
            fourSquareObj.state =   response.response.groups[0].items[x].venue.location.state;
            fourSquareObj.zip = response.response.groups[0].items[x].venue.location.postalCode;
            fourSquareObj.lat = response.response.groups[0].items[x].venue.location.lat;
            fourSquareObj.lng = response.response.groups[0].items[x].venue.location.lng;
            fourSquareObj.rating = response.response.groups[0].items[x].venue.rating;
            restauraunts.push(fourSquareObj);
        }
    }
    results_to_DOM(restauraunts);
}

function distance_sort(array) {
    var swapped ;
    do {
        swapped = false;
        for (var i=0;i<array.length-1; i++) {
            if (array[i].distance > array[i+1].distance) {
                var temp = array[i];
                array[i] = array[i + 1];
                array[i + 1] = temp;
                swapped = true;
            }
        }
    }
    while (swapped)
    price_replacement(array);
    return array;
}

function price_replacement(array) {
    for (var i=0;i<array.length; i++){
        switch(array[i].price.toLocaleLowerCase()){
            case "cheap":
                array[i].price = "$";
                break;
            case "moderate":
                array[i].price = "$$";
                break;
            case "expensive":
                array[i].price = "$$$";
                break;
            case "very expensive":
                array[i].price = "$$$$";
                break;
            case "not found":
                array[i].price = "Not Found";
                break;
        }
    }///end of for loop
    price_sort(array);
    return array;
}
function price_sort(array) {
    var swapped ;
    do {
        swapped = false;
        for (var i=0;i<array.length-1; i++) {
            if(array[i].price.message == "not found"){
                array.splice(array[i],1);
            }
            else{
                if (array[i].price.message > array[i+1].price.message) {
                    var temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    swapped = true;
                }
            }
        }
    }while (swapped)
    results_to_DOM(array);
    return array;
}

function results_to_DOM (array) {
    var card_array = [];
    var top_position = 0;
    var z_index = 10;
    var window_height = $('body').height();

    for(var i = 0; i<25; i++){
        var div = $("<div>").addClass("result-card").css("background","white");
        var img = $("<div>").addClass("result-image").css({
            background: "url(" + array[i].photo + ")",
            'background-size': 'cover',
            'background-repeat': 'no-repeat',
            'background-position': 'center center'
        });
        var addressDiv = $("<div>").addClass("address-text-holder container-fluid");
        /** ADDRESS CONTAINER**/
        var name = $("<h3>").text(array[i].name);
        var street = $('<p>').text(array[i].street);
        var city_state_zip = $('<p>').text(array[i].city + ", " + array[i].state + " " + array[i].zip);
        var phone = $('<p>').text(array[i].phone);
        /** RATING **/
        var rating_container = $('<div>').addClass("info-container col-xs-3");
        var i_rating = $("<i>").addClass("fa fa-star");
        var rating = $("<p>").text(array[i].rating);
        /** DISTANCE **/
        var distance_container = $('<div>').addClass("info-container col-xs-3");
        var i_distance = $("<i>").addClass("fa fa-car");
        var distance = $("<p>").text(convert_to_miles(array[i].distance) + " mi.");
        /** PRICING **/
        var price_container = $("<div>").addClass("info-container col-xs-3");
        var i_price = $("<i>").addClass("fa fa-usd");
        var price = $("<p>").text(array[i].price);
        /** HOURS **/
        var i_hours_container = $('<div>').addClass("info-container hours col-xs-3");
        var i_hours = $("<i>").addClass("fa fa-clock-o");
        var i_hours_tag = $("<p>").text(array[i].hours).addClass("info-content hours");
        /** URL **/
        var i_url_container = $('<div>').addClass("info-container col-xs-3");
        var i_url = $("<i>").addClass("fa fa-globe");
        var i_url_tag = $("<p>").text("Web");
        var url_container = $('<div>').addClass("info-container col-xs-9");
        var url = $("<a />", {
            addClass: "info-content",
            text: array[i].website,
            href: array[i].website,
        });
        // var url = $("<a>").attr("href", '"' + array[i].website + '"').addClass("info-content");
        /** POPULARITY **/
        var i_popularity_container = $('<div>').addClass("info-container col-xs-3");
        var i_popularity = $("<i>").addClass("fa fa-foursquare");
        var i_popularity_tag = $("<p>").text("Check-Ins");
        var popularity_container = $('<div>').addClass("info-container col-xs-9");
        var popularity = $("<p>").text(array[i].checkins + " Foursquare user" +" check-ins and counting!").addClass("info-content");
        /** TIPS **/
        var i_tips_container = $('<div>').addClass("info-container col-xs-3");
        var i_tips = $("<i>").addClass("fa fa-thumbs-o-up");
        var i_tips_tag = $("<p>").text("Tip");
        var tips_container = $('<div>').addClass("info-container tips col-xs-9");
        var tips = $("<p>").text("'" + array[i].tips + "'" + " - " + array[i].user_first_name + " " + array[i].user_last_name).addClass("info-content");
        /** CATEGORIES **/
        var i_category_container = $('<div>').addClass("info-container col-xs-3");
        var i_category = $("<i>").addClass("fa fa-tags");
        var i_category_tag= $("<p>").text("Category");
        var category_container = $('<div>').addClass("info-container col-xs-9");
        var category = $("<p>").text(array[i].category_1).addClass("info-content categories");
        /** ETA **/
        // var eta_container = $("<div>").addClass("col-xs-3 info-container");
        // var i_eta = $("<i>").addClass("fa fa-dot-circle-o");
        // var eta = $("<p>");
        /** MORE INFO **/
        var moreInfoDiv = $("<div>").addClass("more-info-holder container-fluid");
        var btn_div = $("<div>").addClass("col-xs 12 button-holder");
        var i_left = $("<i>").addClass("fa fa-arrow-left");
        var i_right = $("<i>").addClass("fa fa-arrow-right");
        var prev_div = $("<div>").addClass("col-xs-4");
        var next_div = $("<div>").addClass("col-xs-4");
        var nav_div = $("<div>").addClass("col-xs-4");
        var nav_text = $("<p>").text("Let's Go!");
        var next_btn = $("<div>").addClass("next-button").attr("data-position",i);
        var prev_btn = $("<div>").addClass("prev-button").attr("data-position",i);
        var nav_button = $("<div>").addClass("navigation-button");

        //closure for the next button to call the next_card function for moving to the next card
        next_btn.on("click", function (){
            next_card(this , 1);
        });
        //closure for the prev button to call the prev_card function for moving back to the previous card
        prev_btn.on("click", function (){
            prev_card(this , 1);
        });


        //closure for making the navigation button link to the maps application
        (function(){
            var inner_i = i;
            nav_button.on("click", function(){
                window.open("https://www.google.com/maps/dir/"+ 'Current+Location/' + array[inner_i].name + ",+" + array[inner_i].street + "+" + array[inner_i].city);
            });
        })();

        //appending various elements to their parent elements
        i_hours_container.append(i_hours,i_hours_tag);
        i_url_container.append(i_url, i_url_tag);
        url_container.append(url);
        i_tips_container.append(i_tips, i_tips_tag);
        tips_container.append(tips);
        i_popularity_container.append(i_popularity, i_popularity_tag);
        popularity_container.append(popularity);
        i_category_container.append(i_category, i_category_tag);
        category_container.append(category);
        distance_container.append(i_distance, distance);
        rating_container.append(i_rating, rating);
        price_container.append(i_price, price);
        prev_btn.append(i_left);
        next_btn.append(i_right);
        nav_button.append(nav_text);
        prev_div.append(prev_btn);
        next_div.append(next_btn);
        nav_div.append(nav_button);
        btn_div.append(prev_div, nav_div, next_div);
        addressDiv.append(street, city_state_zip, phone);
        moreInfoDiv.append(rating_container, distance_container, price_container, i_hours_container, i_category_container, category_container, i_tips_container, tips_container, i_popularity_container, popularity_container, i_url_container, url_container);

        div.append (name, img, addressDiv, moreInfoDiv, btn_div);


        $("#results-page").append(div.attr("id","card" + i).css({
            top: 90 + top_position + window_height + "px",
            'z-index': "+"+z_index
        }));

        // adding swipe on each result-card div
        $(div).on('swipe', function (e) {
            console.log('swipe triggered on', this);
        }).swipeend(function (e, touch) {
            var this_card = this;
            var card_id = $(this_card).attr("id");
            console.log("swipe ended", touch.direction, touch.xAmount, this);
            if (touch.direction == "left" && touch.xAmount > 100){ // this defines a minimum swipe distance
                prev_card(this_card, card_id, 1);
            } else if (touch.direction == "right" && touch.xAmount > 100){
                next_card(this_card, card_id, 1);
            }
        });

        top_position += 15;
        z_index -= 1;
        card_array.push("card"+i);
    }
    stack_up(card_array,window_height);
}


function convert_to_miles(meters) {
    return (meters * 0.000621371192).toFixed(2);
}

function stack_up (array, height) {
    var delay = 500;
    for(var i=0; i<array.length; i++){
        var target_card = $("#" + array[i]);
        var current_position = target_card.position().top;
        target_card.delay(delay).animate({top: (height - current_position) * -1 + "px"},500);
        delay+=300;
    }
}


function next_card (element , direction) {
    //The current index of cards is found via an attribute that was appended to the button during it's creation
    var card = $(element).attr("data-position");
    //Conditional for determing if there are no more cards in the stack
    if (parseInt(card) !== 9){
        //Parent is set to the id value of the button's parent card
        var parent = $("#card"+card);
        //current_position is set to the current position of the parent's top px value
        var current_position = parent.position().top;
        //next_child_position is set to the px value of the next card in the stack
        //variable currently unused. Plan to be used for optimizations later on.
        var next_child_position = $("#card" + (parseInt(card) + 1)).position().top;
        //distance is set to 0. This will be distance each card must move up in the stack when one card is moved
        var distance = 0;
        //current_width is set to the parent card's width px value
        var current_width = parent.width();
        //parent card animates of the screen by taking its width value and multiplying it by 2 with an animation speed pf 300 miliseconds
        parent.animate({left: current_width * 2 + "px"},400, function(){
            parent.hide();
        });
        //card is then incremented
        card = parseInt(card) + 1;
        //length is set to ten for the amount of cards in the stack
        var length = 10;
        //for loop for iterating throught each card in the stack
        for(var i = card; i<=length; i++){
            //child is set to the card
            var child = $("#card" + i);
            //the card will animate from its current position + the distance at a speed of 500 miliseconds
            child.animate({top: (current_position + distance) + "px"},500);
            //distnace is incremented so each card moves further up the stack
            distance += 25;
        }
    }
    //if the stack is equal to 9, then exit the function
    else {
        return;
    }
}
//function for moving the card back into the viewable window
function prev_card (element , direction) {
    //The current index of cards is found via an attribute that was appended to the button during it's creation
    var card = $(element).attr("data-position");
    //condition for determining if the top of the stack has been reached
    if (parseInt(card) !== 0){
        //Conditional for determining if there are no more cards in the stack
        var parent = $("#card"+card);
        //prev_child_position is set to the jQuery selector for the previous card in the stack
        var prev_card = $("#card" + (parseInt(card) - 1));
        //card_width is set to the prev_card's width
        var card_width = prev_card.width();
        //current_position is set to the position of the of current card in view(parent of the button)
        //This will return the position object of the card which contains the top and left key / value pairs
        var current_position = parent.position();
        //distance is set to 25. This is the distance each card will have to move down the stack
        var distance = 25;
        //prev_card animates to the current card in view's left position value plus the card out view's width (this is divided by two to overcome the transform translate CSS property for each card).
        prev_card.show().animate({left: current_position.left + (card_width/2) + "px"},400);
        //card is set to the number value of the button's data-position value
        card = parseInt(card);
        //length is set to the number of cards in the stack
        var length = 10;
        //for loop to iterate through the stack of cards
        for(var i = card; i<=length; i++){
            //child is set to the jQuery selector of the card
            var child = $("#card" + i);
            //the child animates down the the stack by taking the top px value of the card in view's position plus the distance
            child.animate({top: (current_position.top) + distance + "px"},500);
            //distance is incremented so each subsequent card moves further down the stack
            distance += 25;
        }
    }
    //if the current card is 0 then it has the reached the top of the stack and exits the function
    else {
        return;
    }
}

$(document).ready(function(){
    navigator.geolocation.getCurrentPosition(success,error, options);
});

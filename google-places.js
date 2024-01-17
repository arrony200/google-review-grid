/* https://github.com/peledies/google-places */
(function($) {

    var namespace = 'googlePlaces';

    $.googlePlaces = function(element, options) {

        var defaults = {
              placeId: 'ChIJ0wRVVyGxXEYRsq6c2s6Jwe0' // placeId provided by google api documentation
            , render: ['reviews']
            , min_rating: 1
            , max_rows:20
            , map_plug_id: 'map-plug'
            , rotateTime: false
            , shorten_names: true
            ,showProfilePicture:true
        };

        var plugin = this;

        plugin.settings = {}

        var $element = $(element),
             element = element;

        plugin.init = function() {
          plugin.settings = $.extend({}, defaults, options);
          plugin.settings.schema = $.extend({}, defaults.schema, options.schema);
          $element.html("<div id='" + plugin.settings.map_plug_id + "'></div>"); // create a plug for google to load data into
          initialize_place(function(place){
            plugin.place_data = place;

            // Trigger event before render
            $element.trigger('beforeRender.' + namespace);

            if(plugin.settings.render.indexOf('rating') > -1){
              renderRating(plugin.place_data.rating);
            }
            // render specified sections
            if(plugin.settings.render.indexOf('reviews') > -1){

            // console.log(plugin.settings.max_rows);

             console.log(plugin);

              renderReviews(plugin.place_data.reviews);
              if(!!plugin.settings.rotateTime) {
                  initRotation();
              }
            }
   

      
            if(plugin.settings.render.indexOf('hours') > -1){
              renderHours(
                  capture_element(plugin.settings.hours.displayElement)
                , plugin.place_data.opening_hours
              );
            }

            // render schema markup
            addSchemaMarkup(
                capture_element(plugin.settings.schema.displayElement)
              , plugin.place_data
            );

            // Trigger event after render
            $element.trigger('afterRender.' + namespace);

          });
        }

        var capture_element = function(element){
          if(element instanceof jQuery){
            return element;
          }else if(typeof element == 'string'){
            try{
              var ele = $(element);
              if( ele.length ){
                return ele;
              }else{
                throw 'Element [' + element + '] couldnt be found in the DOM. Skipping '+element+' markup generation.';
              }
            }catch(e){
              console.warn(e);
            }
          }
        }

        var initialize_place = function(c){
          var map = new google.maps.Map(document.getElementById(plugin.settings.map_plug_id));

          var request = {
            placeId: plugin.settings.placeId
          };

          var service = new google.maps.places.PlacesService(map);

          service.getDetails(request, function(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              c(place);
            }
          });
        }

        var sort_by_date = function(ray) {
          ray.sort(function(a, b){
            var keyA = new Date(a.time),
            keyB = new Date(b.time);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
          });
          return ray;
        }

        var filter_minimum_rating = function(reviews){
          for (var i = reviews.length -1; i >= 0; i--) {
            if(reviews[i].rating < plugin.settings.min_rating){
              reviews.splice(i,1);
            }
          }
          return reviews;
        }

        var renderRating = function(rating){
            var html = "";
            var star = renderAverageStars(rating);
            html = "<div class='average-rating'><h4>"+star+"</h4></div>";
            $element.append(html);
        }

        var shorten_name = function(name) {
          if (name.split(" ").length > 1) {
            var xname = "";
            xname = name.split(" ");
            return xname[0] + " " + xname[1][0] + ".";
          }
        }
       

        var google_logo = '<div class="google-logo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 85 36" class="injected-svg" data-src="https://static.elfsight.com/icons/app-all-in-one-reviews-logos-google-logo-multicolor.svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g clip-path="url(#a-2)"><path fill="#4285F4" d="M20.778 13.43h-9.862v2.927h6.994c-.345 4.104-3.76 5.854-6.982 5.854-4.123 0-7.72-3.244-7.72-7.791 0-4.43 3.429-7.841 7.73-7.841 3.317 0 5.272 2.115 5.272 2.115l2.049-2.122s-2.63-2.928-7.427-2.928C4.725 3.644 0 8.8 0 14.367c0 5.457 4.445 10.777 10.988 10.777 5.756 0 9.969-3.942 9.969-9.772 0-1.23-.179-1.941-.179-1.941Z"></path><path fill="#EA4335" d="M28.857 11.312c-4.047 0-6.947 3.163-6.947 6.853 0 3.744 2.813 6.966 6.994 6.966 3.786 0 6.887-2.893 6.887-6.886 0-4.576-3.607-6.933-6.934-6.933Zm.04 2.714c1.99 0 3.876 1.609 3.876 4.201 0 2.538-1.878 4.192-3.885 4.192-2.205 0-3.945-1.766-3.945-4.212 0-2.394 1.718-4.181 3.954-4.181Z"></path><path fill="#FBBC05" d="M43.965 11.312c-4.046 0-6.946 3.163-6.946 6.853 0 3.744 2.813 6.966 6.994 6.966 3.785 0 6.886-2.893 6.886-6.886 0-4.576-3.607-6.933-6.934-6.933Zm.04 2.714c1.99 0 3.876 1.609 3.876 4.201 0 2.538-1.877 4.192-3.885 4.192-2.205 0-3.945-1.766-3.945-4.212 0-2.394 1.718-4.181 3.955-4.181Z"></path><path fill="#4285F4" d="M58.783 11.319c-3.714 0-6.634 3.253-6.634 6.904 0 4.16 3.385 6.918 6.57 6.918 1.97 0 3.017-.782 3.79-1.68v1.363c0 2.384-1.448 3.812-3.633 3.812-2.11 0-3.169-1.57-3.537-2.46l-2.656 1.11c.943 1.992 2.839 4.07 6.215 4.07 3.693 0 6.508-2.327 6.508-7.205V11.734h-2.897v1.17c-.89-.96-2.109-1.585-3.726-1.585Zm.269 2.709c1.821 0 3.69 1.554 3.69 4.21 0 2.699-1.865 4.187-3.73 4.187-1.98 0-3.823-1.608-3.823-4.161 0-2.653 1.914-4.236 3.863-4.236Z"></path><path fill="#EA4335" d="M78.288 11.302c-3.504 0-6.446 2.788-6.446 6.901 0 4.353 3.28 6.934 6.782 6.934 2.924 0 4.718-1.6 5.789-3.032l-2.389-1.59c-.62.962-1.656 1.902-3.385 1.902-1.943 0-2.836-1.063-3.39-2.094l9.266-3.845-.48-1.126c-.896-2.207-2.984-4.05-5.747-4.05Zm.12 2.658c1.263 0 2.171.671 2.557 1.476l-6.187 2.586c-.267-2.002 1.63-4.062 3.63-4.062Z"></path><path fill="#34A853" d="M67.425 24.727h3.044V4.359h-3.044v20.368Z"></path></g><defs><clipPath id="a-2"><path fill="#fff" d="M0 0h84.515v36H0z"></path></clipPath></defs></svg></div>';

        var arrow = '<span class="review-arrow"><svg viewBox="0 0 19 13" xmlns="http://www.w3.org/2000/svg" class="Balloon__StyledReviewCardTail-sc-1d6y62j-0 goSDwL es-review-card-tail" _fill="rgba(17, 17, 17, 0.05)" style="left: 28px;"><path d="M0.965704 0.000125914H10.3736L19 5.15272e-05C19 5.15272e-05 16.2331 5.15665 10.3736 8.99489C6.68171 11.4132 3.12703 12.3741 1.00222 12.7541C0.488597 12.8459 0.227225 12.1436 0.617463 11.7973C2.03909 10.5355 3.88298 8.3072 3.88294 5.23718C3.88287 9.44134e-05 0.965704 0.000125914 0.965704 0.000125914Z"></path></svg><span>';

        var renderReviews = function(reviews){
        //  reviews = sort_by_date(reviews);
       //   reviews = filter_minimum_rating(reviews);
          var html = "";      

          var row_count = (plugin.settings.max_rows > 0)? plugin.settings.max_rows - 1 : reviews.length - 1;

          // make sure the row_count is not greater than available records
          row_count = (row_count > reviews.length-1) ? reviews.length -1 : row_count;

          for (var i = row_count; i >= 0; i--) {

            var stars = renderStars(reviews[i].rating);
            var date = reviews[i].relative_time_description;
            if(plugin.settings.shorten_names == true) {
              var name = shorten_name(reviews[i].author_name);
            } else {
              var name = reviews[i].author_name + '</span><span class="review-sep"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" class="ReviewVerifiedBadge__StyledVerifiedBadge-sc-1l8zk7l-0 jqBsSb es-review-verified-badge-icon"><path fill="#197BFF" d="M6.757.236a.35.35 0 0 1 .486 0l1.106 1.07a.35.35 0 0 0 .329.089l1.493-.375a.35.35 0 0 1 .422.244l.422 1.48a.35.35 0 0 0 .24.24l1.481.423a.35.35 0 0 1 .244.422l-.375 1.493a.35.35 0 0 0 .088.329l1.071 1.106a.35.35 0 0 1 0 .486l-1.07 1.106a.35.35 0 0 0-.089.329l.375 1.493a.35.35 0 0 1-.244.422l-1.48.422a.35.35 0 0 0-.24.24l-.423 1.481a.35.35 0 0 1-.422.244l-1.493-.375a.35.35 0 0 0-.329.088l-1.106 1.071a.35.35 0 0 1-.486 0l-1.106-1.07a.35.35 0 0 0-.329-.089l-1.493.375a.35.35 0 0 1-.422-.244l-.422-1.48a.35.35 0 0 0-.24-.24l-1.481-.423a.35.35 0 0 1-.244-.422l.375-1.493a.35.35 0 0 0-.088-.329L.236 7.243a.35.35 0 0 1 0-.486l1.07-1.106a.35.35 0 0 0 .089-.329L1.02 3.829a.35.35 0 0 1 .244-.422l1.48-.422a.35.35 0 0 0 .24-.24l.423-1.481a.35.35 0 0 1 .422-.244l1.493.375a.35.35 0 0 0 .329-.088L6.757.236Z"></path><path fill="#fff" fill-rule="evenodd" d="M9.065 4.85a.644.644 0 0 1 .899 0 .615.615 0 0 1 .053.823l-.053.059L6.48 9.15a.645.645 0 0 1-.84.052l-.06-.052-1.66-1.527a.616.616 0 0 1 0-.882.645.645 0 0 1 .84-.052l.06.052 1.21 1.086 3.034-2.978Z" clip-rule="evenodd"></path></svg></span>';
            };
            html = html+"<div class='review-item'><div class='review-content-top'>"+stars+"<p class='review-text'>"+reviews[i].text+"</p>"+google_logo+arrow+"</div><div class='review-content-bottom'><div class='auth-img'><img src='"+reviews[i].profile_photo_url+"'/></div><div class='review-meta'><span class='review-author'>"+name+"<span class='review-date'>"+date+"</span></div></div></div>"
          };
          $element.append(html);
        }


        var renderHours = function(element, data){
          if(element instanceof jQuery){
            var html = "<ul>";
            data.weekday_text.forEach(function(day){
              html += "<li>"+day+"</li>";
            });
            html += "</ul>";
            element.append(html);
          }
        }




        var initRotation = function() {
            var $reviewEls = $element.children('.review-item');
            var currentIdx = $reviewEls.length > 0 ? 0 : false;
            $reviewEls.hide();
            if(currentIdx !== false) {
                $($reviewEls[currentIdx]).show();
                setInterval(function(){
                    if(++currentIdx >= $reviewEls.length) {
                        currentIdx = 0;
                    }
                    $reviewEls.hide();
                    $($reviewEls[currentIdx]).fadeIn('slow');
                }, plugin.settings.rotateTime);
            }
        }

        var renderStars = function(rating){
          var stars = "<div class='review-stars'><ul>";

          // fill in gold stars
          for (var i = 0; i < rating; i++) {
            stars = stars+"<li><i class='star'></i></li>";
          };

          // fill in empty stars
          if(rating < 5){
            for (var i = 0; i < (5 - rating); i++) {
              stars = stars+"<li><i class='star inactive'></i></li>";
            };
          }
          stars = stars+"</ul></div>";
          return stars;
        }

        var renderAverageStars = function(rating){
            var stars = "<div class='review-stars'><ul><li><i>"+rating+"&nbsp;</i></li>";
            var activeStars = parseInt(rating);
            var inactiveStars = 5 - activeStars;
            var width = (rating - activeStars) * 100 + '%';

            // fill in gold stars
            for (var i = 0; i < activeStars; i++) {
              stars += "<li><i class='star'></i></li>";
            };

            // fill in empty stars
            if(inactiveStars > 0){
              for (var i = 0; i < inactiveStars; i++) {
                  if (i === 0) {
                      stars += "<li style='position: relative;'><i class='star inactive'></i><i class='star' style='position: absolute;top: 0;left: 0;overflow: hidden;width: "+width+"'></i></li>";
                  } else {
                      stars += "<li><i class='star inactive'></i></li>";
                  }
              };
            }
            stars += "</ul></div>";
            return stars;
        }

        var addSchemaMarkup = function(element, placeData) {

          if(element instanceof jQuery){
            var schema = plugin.settings.schema;
            var schemaMarkup = '<span itemscope="" itemtype="http://schema.org/' + schema.type + '">';

            if(schema.image !== null) {
              schemaMarkup += generateSchemaItemMarkup('image', schema.image);
            } else {
              console.warn('Image is required for some schema types. Visit https://search.google.com/structured-data/testing-tool to test your schema output.');
            }

            if(schema.priceRange !== null) {
              schemaMarkup += generateSchemaItemMarkup('priceRange', schema.priceRange);
            }

            schemaMarkup += generateSchemaItemMarkup('url', location.origin);
            schemaMarkup += generateSchemaItemMarkup('telephone', plugin.place_data.formatted_phone_number );
            schemaMarkup += generateSchemaAddressMarkup();
            schemaMarkup += generateSchemaRatingMarkup(placeData, schema);
            schemaMarkup += '</span>';

            element.append(schemaMarkup);
          }
        }

        var generateSchemaAddressMarkup = function() {
          var $address = $('<div />', {
              itemprop: "address"
            , itemscope: ''
            , itemtype: "http://schema.org/PostalAddress"
          }).css('display', 'none');
          $address.append(plugin.place_data.adr_address);
          $address.children('.street-address').attr('itemprop', 'streetAddress');
          $address.children('.locality').attr('itemprop', 'addressLocality');
          $address.children('.region').attr('itemprop', 'addressRegion');
          $address.children('.postal-code').attr('itemprop', 'postalCode');
          $address.children('.country-name').attr('itemprop', 'addressCountry');
          return $address[0].outerHTML;
        }

        var generateSchemaRatingMarkup = function(placeData, schema) {
          var reviews = placeData.reviews;
          var lastIndex = reviews.length - 1;
          var reviewPointTotal = 0;

          for (var i = lastIndex; i >= 0; i--) {
            reviewPointTotal += reviews[i].rating;
          };

          var averageReview = reviewPointTotal / ( reviews.length );

          return schema.beforeText + ' <span itemprop="name">' + placeData.name + '</span> '
          +  '<span itemprop="aggregateRating" itemscope="" itemtype="http://schema.org/AggregateRating">'
          +    '<span itemprop="ratingValue">' + averageReview.toFixed(2) + '</span>/<span itemprop="bestRating">5</span> '
          +  schema.middleText + ' <span itemprop="ratingCount">' + reviews.length + '</span> '
          +  schema.afterText
          +  '</span>'
        }

        var generateSchemaItemMarkup = function(name, value) {
          return '<meta itemprop="' + name + '" content="' + value + '">'
        }

        plugin.init();

    }

    $.fn.googlePlaces = function(options) {

        return this.each(function() {
          
            if (undefined == $(this).data(namespace)) {
                var plugin = new $.googlePlaces(this, options);
                $(this).data(namespace, plugin);
            }
        });

    }

})(jQuery);

//Parallax Init
skrollr.init({
    smoothScrolling: false,
    mobileDeceleration: 0.004,
    forceHeight: false,
    mobileCheck: function () {
        return false;
    }
});

//Scroll Init
$('.page-scroll').on('click', function (e) {
    e.preventDefault();
    var $anchor = $(this);
    var id = $anchor[0].hash;
    $('html, body').stop().animate({ scrollTop: $(id).offset().top }, 1500, 'easeInOutExpo');
});

//Load and Play Video
function vidplay() {
    var video = document.getElementById("beyondadmin-video");
    var videobg = document.getElementById("video-bg");
    videobg.style.display = 'none';
    $(".video-wrapper").css('display', 'block');
    if (video.paused) {
        video.src = 'assets/video/video.mp4';
        video.play();
    } else {
        video.pause();
    }
}

//Map Init
$(document).ready(function () {

    var markerMap = new GMaps({
        el: '#map',
        lat: -12.053333,
        lng: -77.028333,
        zoomControl: false,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        draggable: false
    });
    markerMap.addMarker({
        lat: -12.053333,
        lng: -77.028333,
        title: 'Lima',
        details: {
            database_id: 42,
            author: 'HPNeo'
        },
        click: function (e) {
            if (console.log)
                console.log(e);
        },
        mouseover: function (e) {
            if (console.log)
                console.log(e);
        }
    });
    var styles = [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "saturation": 36
                },
                {
                    "color": "#000000"
                },
                {
                    "lightness": 40
                }
            ]
        },
        {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#000000"
                },
                {
                    "lightness": 16
                }
            ]
        },
        {
            "featureType": "all",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 20
                }
            ]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 17
                },
                {
                    "weight": 1.2
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 20
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 21
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 17
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 29
                },
                {
                    "weight": 0.2
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 18
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 16
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 19
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#000000"
                },
                {
                    "lightness": 17
                }
            ]
        }
    ];

    markerMap.addStyle({
        styledMapName: "Styled Map",
        styles: styles,
        mapTypeId: "map_style"
    });

    markerMap.setStyle("map_style");
});
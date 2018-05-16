'use strict';

var room_1 = null
var room_2 = null
var room_3 = null

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var get_ratio = function get_ratio(values, axis) {
  var ratio = [];
  var divisor = axis == 'x' ? 1425 : 790;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var value = _step.value;

      ratio.push(value / divisor);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return ratio;
};

var coordinate_init = function coordinate_init(x_coordinates, y_coordinates) {
  var x_ratio = get_ratio(x_coordinates, 'x');
  var y_ratio = get_ratio(y_coordinates, 'y');
  return { x: x_ratio, y: y_ratio };
};

var set_point_values = function set_point_values(selector, x_ratio, y_ratio) {
  var image_width = document.querySelector('#room1_bg').width;
  var x_values = x_ratio.map(function (val, idx) {
    return val * image_width;
  });
  var image_height = document.querySelector('#room1_bg').height;
  var y_values = y_ratio.map(function (val, idx) {
    return val * image_height;
  });

  var area_coordinates = '';
  for (var i = 0; i < x_ratio.length; i++) {
    if (i == 0) {
      area_coordinates += x_values[i] + ',' + y_values[i];
    } else {
      area_coordinates += ',' + x_values[i] + ',' + y_values[i];
    }
  }
  document.querySelector(selector).setAttribute('coords', area_coordinates);
};

var toggle_explore = function toggle_explore() {
  document.querySelector('#explore-menu').classList.toggle('open');
};

var Room = function () {
  function Room(config) {
    _classCallCheck(this, Room);

    this.config = config;
    this.ClickMap = new Map();
    this.map_object = document.querySelector('[name="' + config.name + '"]');
    this.map_image_id = this.config.map_image_id;
    this.root = document.querySelector('#' + this.config.wrapper_id);

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = this.config.areas[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var area = _step2.value;

        var area_coordinates = coordinate_init(area.x_points, area.y_points);
        this.ClickMap.set('#' + area.name, { x: area_coordinates.x, y: area_coordinates.y });
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    this._set_transition_mask();
    this._attachListeners();
    this._set_parallax();
    this.transition_1_offset = document.querySelector('#trans_1').offsetTop;
    this.room_1_height = document.querySelector('#sala').clientHeight;
    this.transition_2_offset = document.querySelector('#trans_2').offsetTop;
  }

  _createClass(Room, [{
    key: '_set_transition_mask',
    value: function _set_transition_mask() {
      var trans_mask = this.root.querySelector('.transition_view');
      var image = document.querySelector('#' + this.map_image_id);
      var ratio = image.naturalHeight / image.naturalWidth;
      var height = window.innerWidth * ratio;

      //trans_mask.style.height = `${height}px`
      if (trans_mask) {
        trans_mask.style.width = '100%';
      }
      //trans_mask.style.top = `${image.y}px`
    }
  }, {
    key: '_get_threshold_list',
    value: function _get_threshold_list() {
      var numSteps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;

      var thresholds = [];

      for (var i = 1.0; i <= numSteps; i++) {
        var ratio = i / numSteps;
        thresholds.push(ratio);
      }
      return thresholds.slice(5);
    }
  }, {
    key: '_set_parallax',
    value: function _set_parallax() {
      var _this = this;

      window.addEventListener('scroll', function () {
        var trans_1_transform = window.pageYOffset / 1.65 / _this.transition_1_offset;
        document.querySelector('#trans_1').querySelector('.girl').style.transform = 'translateY(' + (trans_1_transform * 100 - 55) + '%)';

        var room_1_delta = window.pageYOffset - _this.room_1_height;
        var trans_2_transform = room_1_delta * 1.35 / _this.transition_2_offset;
        document.querySelector('#trans_2').querySelector('.girl').style.transform = 'translateY(' + (trans_2_transform * 100 - 85) + '%)';
      });
    }
  }, {
    key: 'scrollIt',
    value: function scrollIt(destination) {
      var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
      var easing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'linear';
      var callback = arguments[3];

      var easings = {
        linear: function linear(t) {
          return t;
        },
        easeInQuad: function easeInQuad(t) {
          return t * t;
        },
        easeOutQuad: function easeOutQuad(t) {
          return t * (2 - t);
        },
        easeInOutQuad: function easeInOutQuad(t) {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        easeInCubic: function easeInCubic(t) {
          return t * t * t;
        },
        easeOutCubic: function easeOutCubic(t) {
          return --t * t * t + 1;
        },
        easeInOutCubic: function easeInOutCubic(t) {
          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        easeInQuart: function easeInQuart(t) {
          return t * t * t * t;
        },
        easeOutQuart: function easeOutQuart(t) {
          return 1 - --t * t * t * t;
        },
        easeInOutQuart: function easeInOutQuart(t) {
          return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        },
        easeInQuint: function easeInQuint(t) {
          return t * t * t * t * t;
        },
        easeOutQuint: function easeOutQuint(t) {
          return 1 + --t * t * t * t * t;
        },
        easeInOutQuint: function easeInOutQuint(t) {
          return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
        }
      };

      var start = window.pageYOffset;
      var startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

      var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
      var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
      var destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
      var destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);

      if ('requestAnimationFrame' in window === false) {
        window.scroll(0, destinationOffsetToScroll);
        if (callback) {
          callback();
        }
        return;
      }

      function scroll() {
        var now = 'now' in window.performance ? performance.now() : new Date().getTime();
        var time = Math.min(1, (now - startTime) / duration);
        var timeFunction = easings[easing](time);
        window.scroll(0, Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start));

        if (window.pageYOffset === destinationOffsetToScroll) {
          if (callback) {
            callback();
          }
          return;
        }

        requestAnimationFrame(scroll);
      }

      scroll();
    }
  }, {
    key: 'go_to_next_room',
    value: function go_to_next_room() {
      var root_selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#' + this.config.wrapper_id;
      var transition_selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '' + this.config.transition_element;
      var next_room = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '' + this.config.next_room;
      var reverse = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var root = document.querySelector(root_selector);
      var image = root.querySelector('img');
      var next_room_element = document.querySelector(next_room);
      var transition = root.querySelector(transition_selector);

      this.scrollIt(next_room_element, 4000, 'easeInQuad', function () {
        console.log('Next Room');
      });
    }
  }, {
    key: '_attachTransitionListeners',
    value: function _attachTransitionListeners(trigger_selector) {
      var _this2 = this;

      var trigger = document.querySelector(trigger_selector);
      console.log(trigger);
      trigger.addEventListener('click', function (evt) {
        evt.preventDefault();
        _this2.go_to_next_room();
      });
    }
  }, {
    key: 'custom_transition_listener',
    value: function custom_transition_listener(trigger_selector, next_room_params) {
      var _this3 = this;

      var trigger = document.querySelector(trigger_selector);
      trigger.addEventListener('click', function (evt) {
        evt.preventDefault();
        _this3.go_to_next_room(next_room_params.root_selector, next_room_params.transition_selector, next_room_params.next_room);
      });
    }
  }, {
    key: '_attachListeners',
    value: function _attachListeners() {
      var areas = this.root.querySelectorAll('area');
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = areas[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var area = _step3.value;

          tippy(area, {
            followCursor: true,
            appendTo: this.map_object,
            placement: 'top-center',
            distance: 10
          });
          if (!area.classList.contains('trigger')) {
            area.addEventListener('click', function (evt) {
              evt.preventDefault();
              this.parentNode.querySelector('#' + evt.target.getAttribute('name') + '_overlay').classList.add('hide');
              window.modal.modal_open(evt.target.getAttribute('name') + '_overlay');
            });
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (this.config.has_transition) {
        this._attachTransitionListeners(this.config.transition_trigger);
      }
    }
  }, {
    key: 'resize_clickables',
    value: function resize_clickables() {
      var overlays = this.root.querySelectorAll('.overlay');
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = overlays[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var overlay = _step4.value;

          //overlay.style.top = (this.root.querySelector(`#${this.map_image_id}`).y+1)+'px'
          this.root.querySelector('#' + this.map_image_id).style.height = this.root.height + 'px';
          overlay.style.height = this.root.height + 'px';
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.config.areas[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var area = _step5.value;

          var id = '#' + area.name;
          set_point_values(id, this.ClickMap.get(id).x, this.ClickMap.get(id).y);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: 'set_as_unviewable',
    value: function set_as_unviewable() {
      this.root.classList.remove('viewable');
    }
  }, {
    key: 'set_as_viewable',
    value: function set_as_viewable() {
      this.root.classList.add('viewable');
    }
  }]);

  return Room;
}();

var Modal = function () {
  function Modal() {
    var _this4 = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Modal);

    this.config = config;
    this.modal_content = '';
    this.modal = this._init_modal();
    this.is_open = false;
    this.default_modal = {};
    this.open_modal = '';

    for (var _modal in this.config) {
      if ('default_modal' in this.config[_modal] && this.config[_modal].default_modal) {
        this.default_modal = _modal;
      }
    }

    document.body.appendChild(this.modal);

    this.modal.addEventListener('click', function (evt) {
      _this4.modal_close(evt);
    });
    document.addEventListener('keyup', function (evt) {
      _this4.modal_close(evt, 'key');
    });
  }

  _createClass(Modal, [{
    key: '_init_modal',
    value: function _init_modal() {
      var _this5 = this;

      var modal_wrapper = document.createElement('div');
      modal_wrapper.classList.add('modal_wrapper');

      var modal = document.createElement('div');
      modal.classList.add('modal_body');

      var modal_close = document.createElement('button');
      modal_close.classList.add('modal_close');
      modal_close.innerHTML = '<i class="fas fa-times"></i>';
      modal_close.addEventListener('click', function (evt) {
        _this5.is_open = !_this5.is_open;
        _this5.modal.classList.toggle('modal_open');
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = document.querySelectorAll('.overlay')[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var overlay = _step6.value;

            overlay.classList.remove('hide');
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      });

      modal_wrapper.appendChild(modal_close);

      modal_wrapper.appendChild(modal);
      return modal_wrapper;
    }
  }, {
    key: 'modal_open',
    value: function modal_open(id) {
      var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var content = '';
      if (skip) {
        content = document.querySelector('#' + id).dataset.content;
      } else {
        content = 'config';
      }
      if (content === 'config') {
        this.modal.firstChild.nextElementSibling.innerHTML = this.config[id].message;
        this.is_open = true;
        this.modal.classList.toggle('modal_open');
      } else if (content == 'gallery') {
        blueimp.Gallery(this.config[id].links, {
          index: 0,
          indicatorContainer: 'ol',
          activeIndicatorClass: 'active',
          thumbnailProperty: 'thumbnail',
          thumbnailIndicators: true,
          slideClass: 'slide ' + this.config[id].slideClasses.join(' ')
        });
      } else {
        this.modal.firstChild.nextElementSibling.innerHTML = content;
        this.is_open = true;
        this.modal.classList.toggle('modal_open');
      }
      this.open_modal = id;
    }
  }, {
    key: 'modal_close',
    value: function modal_close(evt, handler) {
      switch (handler) {
        case 'key':
          if (evt.keyCode == 27 && this.is_open) {
            this.is_open = !this.is_open;
            this.modal.classList.toggle('modal_open');
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = document.querySelectorAll('.overlay')[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var overlay = _step7.value;

                overlay.classList.remove('hide');
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }

            if (this.open_modal == 'size_modal') {
              this.open_welcome_modal();
            } else {
              this.open_modal = '';
            }
          }
          break;
        default:
          if (evt.target === this.modal) {
            this.is_open = !this.is_open;
            this.modal.classList.toggle('modal_open');
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
              for (var _iterator8 = document.querySelectorAll('.overlay')[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var _overlay = _step8.value;

                _overlay.classList.remove('hide');
              }
            } catch (err) {
              _didIteratorError8 = true;
              _iteratorError8 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                  _iterator8.return();
                }
              } finally {
                if (_didIteratorError8) {
                  throw _iteratorError8;
                }
              }
            }

            if (this.open_modal == 'size_modal') {
              this.open_welcome_modal();
            } else {
              this.open_modal = '';
            }
          }
      }
    }
  }, {
    key: 'modal_note',
    value: function modal_note() {
      this.modal.firstChild.nextElementSibling.innerHTML = '\n    <h2 class="text-center">This site works best in landscape</h2>\n    <p>Please rotate your phone for the best experience.</p>\n    ';
      this.is_open = true;
      this.open_modal = 'size_modal';
      this.modal.classList.toggle('modal_open');
    }
  }, {
    key: 'open_welcome_modal',
    value: function open_welcome_modal() {
      this.modal.firstChild.nextElementSibling.innerHTML = this.config[this.default_modal].message;
      this.is_open = true;
      this.modal.classList.toggle('modal_open');
      this.open_modal = this.default_modal;
    }
  }]);

  return Modal;
}();

document.addEventListener('DOMContentLoaded', function () {
  window.modal = new Modal({
    subscribe: {
      message: '<div id="subscribe-modal-open"><p class="text-center" style="margin-bottom: 1em;">Subscribe to our mailing list to receive the latest updates!</p>\n\n      <div id="mc_embed_signup">\n      <form action="https://tipsytales.us12.list-manage.com/subscribe/post?u=b8558e5be5ed389ffecd8b0a9&amp;id=f3f9fd75e2" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>\n          <div id="mc_embed_signup_scroll">\n\n      <div class="mc-field-group">\n        <input type="email" value="" name="EMAIL" placeholder="Email Address" class="required email" id="mce-EMAIL">\n      </div>\n        <div id="mce-responses" class="clear">\n          <div class="response" id="mce-error-response" style="display:none"></div>\n          <div class="response" id="mce-success-response" style="display:none"></div>\n        </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->\n          <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_b8558e5be5ed389ffecd8b0a9_f3f9fd75e2" tabindex="-1" value=""></div>\n          <div class="clear" style="margin-left: calc(50% - 68px)"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>\n          </div>\n      </form>\n      </div></div>'
    },
    shelf_overlay: {
      message: '<div id="welcome-modal-open">\n        <h1>Welcome!</h1>\n        <p>Lola isn\'t home right now. We hear she\'s a bit busy entertaining other guests. Feel free to roam around her home to learn about us and the world we\'ve uncovered for you. We promise that you\'ll find a few surprises.</p>\n        <p class="text-center" style="margin-bottom: 1em;">Be sure to leave your email so we can let you know when she\'s ready to entertain you!</p>\n\n        <div id="mc_embed_signup">\n        <form action="https://tipsytales.us12.list-manage.com/subscribe/post?u=b8558e5be5ed389ffecd8b0a9&amp;id=f3f9fd75e2" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>\n            <div id="mc_embed_signup_scroll">\n\n        <div class="mc-field-group">\n          <input type="email" value="" name="EMAIL" placeholder="Email Address" class="required email" id="mce-EMAIL">\n        </div>\n          <div id="mce-responses" class="clear">\n            <div class="response" id="mce-error-response" style="display:none"></div>\n            <div class="response" id="mce-success-response" style="display:none"></div>\n          </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->\n            <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_b8558e5be5ed389ffecd8b0a9_f3f9fd75e2" tabindex="-1" value=""></div>\n            <div class="clear" style="margin-left: calc(50% - 68px)"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>\n            </div>\n        </form>\n        </div>\n\n        <p class="text-help text-align" style="color: #b0b0b0;">Explore a secret world by hovering over objects in the room</p></div>\n      ',
      default_modal: true
    },
    portrait_overlay: {
      message: '<div id="aboutus-modal-open">\n        <h1>About Us</h1>\n        <img src="./images/tt-logo.png" class="tt-logo"/>\n        <p style="text-align: left;">We at Tipsy Tales are obsessed with bringing new experiences to the Philippines! Our team of wacky creatives include a variety of artists, writers, actors, chefs and designers, but we\'re all united by the same need - to build our take on a new "Aha!" moment in the life of every Filipino.</p>\n        <p style="text-align: left;">Influenced by immersive theater, escape rooms, Japanese themed cafes and the London underground dining scene, the founders wanted to create a space wherein people of various artistic backgrounds can come together to create unique, immersive experiences that bring to light ideas worth sharing, conversations worth having and most importantly, joy.</p></div>\n\n      '
    },
    chair_overlay: {
      message: '\n      <div id="history-modal-open">\n        <h1>History</h1>\n        <p>After a tragic death in the family, Lola invites you to her home to keep her company. She reminisces about the past and the song she used to share with the forest, before falling into a deep sleep. A mischievous duende, called Kati, pulls you into a world of adventure - a world where stories are still yet to be uncovered: A story of wonder, a story of love, a story full of longing and loss.</p>\n      </div>\n      '
    },
    table_overlay: {
      message: '\n      <div id="abouttheshow-modal-open">\n        <h1>About the Show</h1>\n        <p>Ang Kundiman is a production that showcases Filipino culture in a way you\'ve never seen before. Deeply rooted in Filipino folklore, the story explores the adventure to save your Lola from the grasps of bizarre magical creatures residing in the heart of Manila.</p>\n        <p>Adventurous souls book online for an hour of whimsical storytelling, close encounters with creatures of the unknown and taste a world away from their own. Journey with us and experience new sights and tastes but be careful, the way back home is never so clear and your ending is entirely up to you.</p>\n      </div>\n      '
    },
    frames_overlay: {
      slideClasses: ['notooltip', 'notooltip'],
      links: [{
        title: '',
        href: './images/gallery/Kati.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Kati.png'
      }, {
        title: '',
        href: './images/gallery/Lola 1.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Lola 1.png'
      }, {
        title: '',
        href: './images/gallery/Lola 2.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Lola 2.png'
      }, {
        title: '',
        href: './images/gallery/Tikbalang 1.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Tikbalang 1.png'
      }, {
        title: '',
        href: './images/gallery/Tikbalang 2.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Tikbalang 2.png'
      }, {
        title: '',
        href: './images/gallery/Tikbalang 3.png',
        type: 'image/jpeg',
        thumbnail: './images/gallery/Tikbalang 3.png'
      }]
    },
    flower_overlay: {
      message: '\n      <div id="castandcrew-modal-open">\n        <h1>The Cast & Crew</h1>\n        <p>Lorem ipsum dolor sit amet</p>\n      </div>\n      '
    },
    note_overlay: {
      message: '\n      <div id="producersnote-modal-open">\n        <h1>Producer\'s Note</h1>\n        <p>Enter a world that has always existed alongside ours, speak to beings that you have heard about but haven\'t met yet, be daring and dive into their stories as much as you build your own. Immerse yourself in the experience and let us take you into an adventure like no other.</p>\n        <p>For the brave, the curious and the adventurous, this story will come alive as much as you let it. Allow it to make you think, make you feel and most importantly, make you laugh. Once you\'ve been permitted to see the other side, you are always welcome to come back. </p>\n      </div>\n      '
    },
    shoe_overlay: {
      message: '\n      <div id="synopsis-modal-open">\n        <h1>Synopsis</h1>\n        <p>After a tragic death in the family, Lola invites you to her home to keep her company. She reminisces about the past and the song she used to share with the forest, before falling into a deep sleep. A mischievous duende, called Kati, pulls you into a world of adventure-a world where stories are still yet to be uncovered: A story of wonder, a story of love, a story full of longing and loss.</p>\n      </div>\n      '
    },
    tree_overlay: {
      message: '\n      <div id="partners-modal-open">\n        <h1>Partners</h1>\n        <p>We stand on the shoulders of giants that have come before us. This world would not have come to life if not for the generosity of our partners who have contributed in many ways - time, skills, knowledge and monetary support.</p>\n        <p>Production Partners</p>\n        <p>Co-Presenter</p>\n        <p>Major Sponsor</p>\n        <p>Principal Sponsor</p>\n        <p>Participating Sponsor</p>\n        <p>Individual Sponsors</p>\n        <p>Creative Partners<br/>\n        Set Design: Likhain Productions<br/>\n        Web Design: Cocomilk Design Co</p>\n        <p>Cultural Partners</p>\n      </div>\n      '
    },
    floorsign_overlay: {
      message: '\n      <div id="rulesregulations-modal-open">\n        <h1>Rules and Regulations</h1>\n        <p>Hi everyone! Welcome to Ang Kundiman.</p>\n        <p>Lola is requesting that you leave all your belongings in her flowerbed for safe keeping. She doesn\'t want you to be distracted, so she is requesting that you leave your phone behind on silent mode as well. Don\'t worry, she told me she\'ll allow you to take selfies later! As you will be meeting Lola and Kati\'s friends later, she wanted me to remind you all to respect them in the way that you would your own friends. You know, with respect for their feelings and personal space. Pay attention to their stories and answer their questions, you might be able to get a little treat out of it! We don\'t want you to get lost on our little adventure, so please be aware of the movement of the group. Kati is quite spritely so we need to be able to keep up with her. Lola has a bunch of antiques lying around and she has specifically demanded that you do not touch anything, unless Kati says that you can. Lola loves her visitors but she loves her antiquities more, they\'ve been with her longer. If at any point you get a little too excited or start feeling ill - heaven knows I\'ve felt that way in the company of Kati\'s friends! - please do not hesitate to inform us. Alright! This is your last chance to back out of the adventure! Once we enter Lola\'s house, there\'s no turning back! Is everybody ready?</p>\n      </div>\n      '
    },
    door_overlay: {
      message: '\n      <div id="booknow-modal-open">\n        <h1>Book Now</h1>\n        <p>Lorem ipsum dolor sit amet</p>\n      </div>\n      '
    }
  });
  // TO ADD HTML EMBED: add id and HTML content to the configuration object
  // IN the HTML, put 'config' in the data-content attribute
  //
  room_1 = new Room({
    name: 'room_1',
    wrapper_id: 'sala',
    map_image_id: 'room1_bg',
    has_transition: true,
    transition_trigger: '#shelf',
    transition_element: '#trans_1',
    next_room: '#forest',
    areas: [{
      name: 'shelf',
      x_points: [560, 1010],
      y_points: [60, 650]
    }, {
      name: 'portrait',
      x_points: [1070, 1425],
      y_points: [0, 190]
    }, {
      name: 'chair',
      x_points: [1010, 1150, 1210, 1360, 1388, 1370, 1270, 1075, 870, 870, 1010],
      y_points: [475, 475, 300, 295, 300, 680, 795, 795, 740, 680, 650]
    }, {
      name: 'frames',
      x_points: [1110, 1425, 1425, 1388, 1388, 1360, 1210, 1180, 1110],
      y_points: [275, 260, 385, 385, 300, 295, 300, 380, 380]
    }, {
      name: 'table',
      x_points: [150, 400],
      y_points: [275, 540]
    }]
  });

  room_2 = new Room({
    name: 'room_2',
    wrapper_id: 'forest',
    map_image_id: 'room2_bg',
    has_transition: true,
    transition_trigger: '#burrow',
    transition_element: '#trans_2',
    next_room: '#floor',
    areas: [{
      name: 'burrow',
      x_points: [530, 840],
      y_points: [670, 740]
    }, {
      name: 'flower',
      x_points: [950, 1050, 1290, 1400, 1220, 990],
      y_points: [480, 290, 290, 475, 610, 550]
    }, {
      name: 'note',
      x_points: [1185, 1240, 1210, 1150],
      y_points: [160, 175, 250, 220]
    }, {
      name: 'shoe',
      x_points: [70, 220],
      y_points: [350, 460]
    }, {
      name: 'sign',
      x_points: [755, 800, 885, 955, 955, 895],
      y_points: [520, 420, 360, 360, 440, 580]
    }, {
      name: 'tree',
      x_points: [825, 910, 1030, 1120, 985, 985, 920, 920, 840],
      y_points: [210, 130, 130, 200, 265, 295, 310, 240, 240]
    }]
  });

  room_3 = new Room({
    name: 'room_3',
    wrapper_id: 'floor',
    map_image_id: 'room3_bg',
    areas: [{
      name: 'door',
      x_points: [630, 640, 690, 730, 800, 830, 840],
      y_points: [640, 390, 300, 290, 315, 375, 630]
    }, {
      name: 'floorsign',
      x_points: [1090, 1100, 1180, 1300, 1360, 1260, 1290, 1250, 1130],
      y_points: [390, 300, 230, 230, 360, 415, 490, 490, 470]
    }]
  });

  room_2.custom_transition_listener('#sign', {
    root_selector: '#forest',
    transition_selector: '#trans_2',
    next_room: '#floor'
  });
});

window.addEventListener('load', function () {
  Pace.on('start', function () {
    document.querySelector('#preloader').classList.toggle('open_loader');
  });
  Pace.on('done', function () {
    document.querySelector('#preloader').classList.toggle('open_loader');
  });
  if (window.innerWidth < window.innerHeight) {
    modal.modal_note();
  } else {
    modal.open_welcome_modal();
  }
  room_1.resize_clickables();
  room_2.resize_clickables();
  room_3.resize_clickables();

  switch (location.hash) {
    case '#forest':
      room_1.set_as_unviewable();
      room_2.set_as_viewable();
      room_3.set_as_unviewable();
      break;
    case '#floor':
      room_1.set_as_unviewable();
      room_2.set_as_unviewable();
      room_3.set_as_viewable();
      break;
    default:
      room_1.set_as_viewable();
      room_2.set_as_unviewable();
      room_3.set_as_unviewable();
      break;
  }
});

window.addEventListener('resize', function () {
  if (window.innerWidth < window.innerHeight) {
    modal.modal_note();
  }
  room_1.resize_clickables();
  room_1._set_transition_mask();
  room_2.resize_clickables();
  room_2._set_transition_mask();
  room_3.resize_clickables();
  room_3._set_transition_mask();
});

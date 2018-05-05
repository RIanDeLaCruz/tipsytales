let get_ratio = function(values, axis) {
  let ratio = []
  let divisor = (axis == 'x' ) ?  1425 : 790
  for(let value of values) {
    ratio.push(value/divisor)
  }
  return ratio
}

let coordinate_init = function(x_coordinates, y_coordinates) {
  let x_ratio = get_ratio(x_coordinates, 'x')
  let y_ratio = get_ratio(y_coordinates, 'y')
  return {x: x_ratio, y: y_ratio}
}


let set_point_values = function(selector, x_ratio, y_ratio) {
  let image_width = document.querySelector('#room1_bg').width
  let x_values = x_ratio.map((val, idx) => {
    return val*image_width
  })
  let image_height = document.querySelector('#room1_bg').height
  let y_values = y_ratio.map((val, idx) => {
    return (val*image_height)
  })

  let area_coordinates = ''
  for(let i = 0; i < x_ratio.length; i++) {
    if(i == 0) {
      area_coordinates += `${x_values[i]},${y_values[i]}`
    } else {
      area_coordinates += `,${x_values[i]},${y_values[i]}`
    }
  }
  document.querySelector(selector).setAttribute('coords', area_coordinates)
}

let toggle_explore = function() {
  document.querySelector('#explore-menu').classList.toggle('open')
}
class Room {
  constructor(config) {
    this.config = config
    this.ClickMap = new Map()
    this.map_object = document.querySelector(`[name="${config.name}"]`)
    this.map_image_id = this.config.map_image_id
    this.root = document.querySelector(`#${ this.config.wrapper_id }`)

    for(let area of this.config.areas) {
      let area_coordinates = coordinate_init(area.x_points, area.y_points)
      this.ClickMap.set(`#${area.name}`, {x: area_coordinates.x, y: area_coordinates.y})
    }

    this._set_transition_mask()
    this._attachListeners()
    this._set_parallax()
    this.transition_1_offset = document.querySelector('#trans_1').offsetTop
    this.room_1_height = document.querySelector('#sala').clientHeight
    this.transition_2_offset = document.querySelector('#trans_2').offsetTop
  }

  _set_transition_mask() {
    let trans_mask = this.root.querySelector('.transition_view')
    let image = document.querySelector(`#${ this.map_image_id }`)
    let ratio = image.naturalHeight/image.naturalWidth
    let height = window.innerWidth*ratio

    //trans_mask.style.height = `${height}px`
    if(trans_mask) {
      trans_mask.style.width = '100%'
    }
    //trans_mask.style.top = `${image.y}px`
  }

  _get_threshold_list(numSteps=20) {
    var thresholds = [];

    for (var i=1.0; i<=numSteps; i++) {
      var ratio = i/numSteps;
      thresholds.push(ratio);
    }
    return thresholds.slice(5);
  }

  _set_parallax() {
    window.addEventListener('scroll', () => {
      let trans_1_transform = (window.pageYOffset / 1.65) / this.transition_1_offset
        document
        .querySelector('#trans_1')
        .querySelector('.girl')
        .style
        .transform = `translateY(${trans_1_transform*100-55}%)`

        let room_1_delta = window.pageYOffset - this.room_1_height
        let trans_2_transform = ( room_1_delta * 1.35 ) / this.transition_2_offset
        document
        .querySelector('#trans_2')
        .querySelector('.girl')
        .style
        .transform = `translateY(${trans_2_transform*100-85}%)`
    })
  }

  scrollIt(destination, duration = 200, easing = 'linear', callback) {
    const easings = {
      linear(t) {
        return t;
      },
      easeInQuad(t) {
        return t * t;
      },
      easeOutQuad(t) {
        return t * (2 - t);
      },
      easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
      easeInCubic(t) {
        return t * t * t;
      },
      easeOutCubic(t) {
        return (--t) * t * t + 1;
      },
      easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      easeInQuart(t) {
        return t * t * t * t;
      },
      easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
      },
      easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      },
      easeInQuint(t) {
        return t * t * t * t * t;
      },
      easeOutQuint(t) {
        return 1 + (--t) * t * t * t * t;
      },
      easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
      }
    };

    const start = window.pageYOffset;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const windowHeight = window.innerHeight ||
      document.documentElement.clientHeight ||
      document.getElementsByTagName('body')[0].clientHeight;
    const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
    const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ?
      documentHeight - windowHeight :
      destinationOffset
    );

    if ('requestAnimationFrame' in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) {
        callback();
      }
      return;
    }

    function scroll() {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, ((now - startTime) / duration));
      const timeFunction = easings[easing](time);
      window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));

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


  go_to_next_room(
    root_selector=`#${this.config.wrapper_id}`,
    transition_selector=`${this.config.transition_element}`,
    next_room=`${this.config.next_room}`,
    reverse=false
  ) {
    let root = document.querySelector(root_selector)
    let image = root.querySelector('img')
    let next_room_element = document.querySelector(next_room)
    let transition = root.querySelector(transition_selector)

    this.scrollIt(next_room_element, 2000, 'easeInQuad', () => { console.log('Next Room' )})
  }

  _attachTransitionListeners(trigger_selector) {
    let trigger = document.querySelector(trigger_selector)
    console.log(trigger)
    trigger.addEventListener('click', (evt) => {
      evt.preventDefault()
      this.go_to_next_room()
    })
  }

  _attachListeners() {
    let areas = this.root.querySelectorAll('area')
    for(let area of areas) {
      tippy(area, {
        followCursor: true,
        appendTo: this.map_object,
        placement: 'top-center',
        distance: 10
      })
      if(!area.classList.contains('trigger')) {
        area.addEventListener('click', function(evt) {
          evt.preventDefault()
          this.parentNode.querySelector(`#${evt.target.getAttribute('name')}_overlay`).classList.add('hide')
          window.modal.modal_open(`${evt.target.getAttribute('name')}_overlay`)
        })
      }
    }
    if(this.config.has_transition) {
      this._attachTransitionListeners(this.config.transition_trigger)
    }
  }

  resize_clickables() {
    let overlays = this.root.querySelectorAll('.overlay')
    for(let overlay of overlays) {
      //overlay.style.top = (this.root.querySelector(`#${this.map_image_id}`).y+1)+'px'
      this.root.querySelector(`#${this.map_image_id}`).style.height = this.root.height+'px'
      overlay.style.height = this.root.height+'px'
    }

    for(let area of this.config.areas) {
      let id = `#${area.name}`
      set_point_values(id, this.ClickMap.get(id).x, this.ClickMap.get(id).y)
    }
  }

  set_as_unviewable() {
    this.root.classList.remove('viewable')
  }

  set_as_viewable() {
    this.root.classList.add('viewable')
  }
}

class Modal {
  constructor(config = {}) {
    this.config = config
    this.modal_content = ''
    this.modal = this._init_modal()
    this.is_open = false
    this.default_modal = {}
    this.open_modal = ''

    for(let modal in this.config) {
      if('default_modal' in this.config[modal] && this.config[modal].default_modal) {
        this.default_modal = modal
      }
    }

    document.body.appendChild(this.modal)

    this.modal.addEventListener('click', (evt) => {
        this.modal_close(evt)
    })
    document.addEventListener('keyup', (evt) => {
      this.modal_close(evt, 'key')
    })
  }
  _init_modal() {
    let modal_wrapper = document.createElement('div')
    modal_wrapper.classList.add('modal_wrapper')

    let modal = document.createElement('div')
    modal.classList.add('modal_body')

    let modal_close = document.createElement('button')
    modal_close.classList.add('modal_close')
    modal_close.innerHTML = '<i class="fas fa-times"></i>'
    modal_close.addEventListener('click', (evt) => {
      this.is_open = !this.is_open
      this.modal.classList.toggle('modal_open')
      for(let overlay of document.querySelectorAll('.overlay')) {
        overlay.classList.remove('hide')
      }
    })

    modal_wrapper.appendChild(modal_close)

    modal_wrapper.appendChild(modal)
    return modal_wrapper
  }
  modal_open(id, skip = true) {
    if(document.querySelector('#explore-menu').classList.contains('open')) {
      document.querySelector('#explore-menu').classList.remove('open')
    }
    let content = ''
    if(skip) {
      content = document.querySelector(`#${ id }`).dataset.content
    } else {
      content = 'config'
    }
    if(content === 'config') {
      this.modal.firstChild.nextElementSibling.innerHTML = this.config[id].message
      this.is_open = true
      this.modal.classList.toggle('modal_open')
    } else if( content == 'gallery') {
      blueimp.Gallery(this.config[id].links, {
        index: 0,
        indicatorContainer: 'ol',
        activeIndicatorClass: 'active',
        thumbnailProperty: 'thumbnail',
        thumbnailIndicators: true,
        slideClass: `slide ${this.config[id].slideClasses.join(' ')}`
      })
    } else {
      this.modal.firstChild.nextElementSibling.innerHTML = content
      this.is_open = true
      this.modal.classList.toggle('modal_open')
    }
    this.open_modal = id
  }
  modal_close(evt, handler) {
    switch(handler) {
      case 'key':
        if(evt.keyCode == 27 && this.is_open) {
          this.is_open = !this.is_open
          this.modal.classList.toggle('modal_open')
          for(let overlay of document.querySelectorAll('.overlay')) {
            overlay.classList.remove('hide')
          }
          if(this.open_modal == 'size_modal') {
            this.open_welcome_modal()
          } else {
            this.open_modal = ''
          }
        }
        break
      default:
        if(evt.target === this.modal) {
          this.is_open = !this.is_open
          this.modal.classList.toggle('modal_open')
          for(let overlay of document.querySelectorAll('.overlay')) {
            overlay.classList.remove('hide')
          }
          if(this.open_modal == 'size_modal') {
            this.open_welcome_modal()
          } else {
            this.open_modal = ''
          }
        }
    }
  }
  modal_note() {
    this.modal.firstChild.nextElementSibling.innerHTML = `
    <h2 class="text-center">This site works best in landscape</h2>
    <p>Please rotate your phone for the best experience.</p>
    `
    this.is_open = true
    this.open_modal = 'size_modal'
    this.modal.classList.toggle('modal_open')

  }
  open_welcome_modal() {
    this.modal.firstChild.nextElementSibling.innerHTML = this.config[this.default_modal].message
    this.is_open = true
    this.modal.classList.toggle('modal_open')
    this.open_modal = this.default_modal
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.modal = new Modal({
    subscribe: {
      message: `<div id="subscribe-modal-open"><p class="text-center" style="margin-bottom: 1em;">Subscribe to our mailing list to receive the latest updates!</p>

      <div id="mc_embed_signup">
      <form action="https://tipsytales.us12.list-manage.com/subscribe/post?u=b8558e5be5ed389ffecd8b0a9&amp;id=f3f9fd75e2" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
          <div id="mc_embed_signup_scroll">

      <div class="mc-field-group">
        <input type="email" value="" name="EMAIL" placeholder="Email Address" class="required email" id="mce-EMAIL">
      </div>
        <div id="mce-responses" class="clear">
          <div class="response" id="mce-error-response" style="display:none"></div>
          <div class="response" id="mce-success-response" style="display:none"></div>
        </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_b8558e5be5ed389ffecd8b0a9_f3f9fd75e2" tabindex="-1" value=""></div>
          <div class="clear" style="margin-left: calc(50% - 68px)"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
          </div>
      </form>
      </div></div>`
    },
    shelf_overlay: {
      message: `<div id="welcome-modal-open">
        <h1>Welcome!</h1>
        <p>Lola isn't home right now. We hear she's a bit busy entertaining other guests. Feel free to roam around her home to learn about us and the world we've uncovered for you. We promise that you'll find a few surprises.</p>
        <p class="text-center" style="margin-bottom: 1em;">Be sure to leave your email so we can let you know when she's ready to entertain you!</p>

        <div id="mc_embed_signup">
        <form action="https://tipsytales.us12.list-manage.com/subscribe/post?u=b8558e5be5ed389ffecd8b0a9&amp;id=f3f9fd75e2" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
            <div id="mc_embed_signup_scroll">

        <div class="mc-field-group">
          <input type="email" value="" name="EMAIL" placeholder="Email Address" class="required email" id="mce-EMAIL">
        </div>
          <div id="mce-responses" class="clear">
            <div class="response" id="mce-error-response" style="display:none"></div>
            <div class="response" id="mce-success-response" style="display:none"></div>
          </div>    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
            <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_b8558e5be5ed389ffecd8b0a9_f3f9fd75e2" tabindex="-1" value=""></div>
            <div class="clear" style="margin-left: calc(50% - 68px)"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
            </div>
        </form>
        </div>

        <p class="text-help text-align" style="color: #b0b0b0;">Explore this room to read more about Tipsy Tales</p></div>
      `,
      default_modal: true
    },
    portrait_overlay: {
      message: `<div id="aboutus-modal-open">
        <h1>About Us</h1>
        <img src="./images/tt-logo.png" class="text-center tt-logo"/>
        <p>We at Tipsy Tales are obsessed with bringing new experiences to the Philippines! Our team of wacky creatives include a variety of artists, writers, actors, chefs and designers, but we're all united by the same need - to build our take on a new "Aha!" moment in the life of every Filipino.</p>
        <p>Influenced by immersive theater, escape rooms, Japanese themed cafes and the London underground dining scene, the founders wanted to create a space wherein people of various artistic backgrounds can come together to create unique, immersive experiences that bring to light ideas worth sharing, conversations worth having and most importantly, joy.</p></div>

      `
    },
    chair_overlay: {
      message: `
      <div id="history-modal-open">
        <h1>History</h1>
        <p>After a tragic death in the family, Lola invites you to her home to keep her company. She reminisces about the past and the song she used to share with the forest, before falling into a deep sleep. A mischievous duende, called Kati, pulls you into a world of adventure - a world where stories are still yet to be uncovered: A story of wonder, a story of love, a story full of longing and loss.</p>
      </div>
      `
    },
    table_overlay: {
      message: `
      <div id="abouttheshow-modal-open">
        <h1>About the Show</h1>
        <p>Ang Kundiman is a production that showcases Filipino culture in a way you've never seen before. Deeply rooted in Filipino folklore, the story explores the adventure to save your Lola from the grasps of bizarre magical creatures residing in the heart of Manila.</p>
        <p>Adventurous souls book online for an hour of whimsical storytelling, close encounters with creatures of the unknown and taste a world away from their own. Journey with us and experience new sights and tastes but be careful, the way back home is never so clear and your ending is entirely up to you.</p>
      </div>
      `
    },
    frames_overlay: {
      slideClasses: ['notooltip', 'notooltip'],
      links: [
        {
            title: '',
            href: './images/gallery/Kati.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Kati.png'
        },
        {
            title: '',
            href: './images/gallery/Lola 1.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Lola 1.png'
        },
        {
            title: '',
            href: './images/gallery/Lola 2.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Lola 2.png'
        },
        {
            title: '',
            href: './images/gallery/Tikbalang 1.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 1.png'
        },
        {
            title: '',
            href: './images/gallery/Tikbalang 2.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 2.png'
        },
        {
            title: '',
            href: './images/gallery/Tikbalang 3.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 3.png'
        }
      ]
    },
    flower_overlay: {
      message: `
      <div id="castandcrew-modal-open">
        <h1>The Cast & Crew</h1>
        <p>Lorem ipsum dolor sit amet</p>
      </div>
      `
    },
    note_overlay: {
      message: `
      <div id="producersnote-modal-open">
        <h1>Producer's Note</h1>
        <p>Enter a world that has always existed alongside ours, speak to beings that you have heard about but haven't met yet, be daring and dive into their stories as much as you build your own. Immerse yourself in the experience and let us take you into an adventure like no other.</p>
        <p>For the brave, the curious and the adventurous, this story will come alive as much as you let it. Allow it to make you think, make you feel and most importantly, make you laugh. Once you've been permitted to see the other side, you are always welcome to come back. </p>
      </div>
      `
    },
    shoe_overlay: {
      message: `
      <div id="synopsis-modal-open">
        <h1>Synopsis</h1>
        <p>After a tragic death in the family, Lola invites you to her home to keep her company. She reminisces about the past and the song she used to share with the forest, before falling into a deep sleep. A mischievous duende, called Kati, pulls you into a world of adventure-a world where stories are still yet to be uncovered: A story of wonder, a story of love, a story full of longing and loss.</p>
      </div>
      `
    },
    tree_overlay: {
      message: `
      <div id="partners-modal-open">
        <h1>Partners</h1>
        <p>We stand on the shoulders of giants that have come before us. This world would not have come to life if not for the generosity of our partners who have contributed in many ways - time, skills, knowledge and monetary support.</p>
        <p>Production Partners</p>
        <p>Co-Presenter</p>
        <p>Major Sponsor</p>
        <p>Principal Sponsor</p>
        <p>Participating Sponsor</p>
        <p>Individual Sponsors</p>
        <p>Creative Partners<br/>
        Set Design: Likhain Productions<br/>
        Web Design: Cocomilk Design Co</p>
        <p>Cultural Partners</p>
      </div>
      `
    },
    floorsign_overlay: {
      message: `
      <div id="rulesregulations-modal-open">
        <h1>Rules and Regulations</h1>
        <p>Hi everyone! Welcome to Ang Kundiman.</p>
        <p>Lola is requesting that you leave all your belongings in her flowerbed for safe keeping. She doesn't want you to be distracted, so she is requesting that you leave your phone behind on silent mode as well. Don't worry, she told me she'll allow you to take selfies later! As you will be meeting Lola and Kati's friends later, she wanted me to remind you all to respect them in the way that you would your own friends. You know, with respect for their feelings and personal space. Pay attention to their stories and answer their questions, you might be able to get a little treat out of it! We don't want you to get lost on our little adventure, so please be aware of the movement of the group. Kati is quite spritely so we need to be able to keep up with her. Lola has a bunch of antiques lying around and she has specifically demanded that you do not touch anything, unless Kati says that you can. Lola loves her visitors but she loves her antiquities more, they've been with her longer. If at any point you get a little too excited or start feeling ill - heaven knows I've felt that way in the company of Kati's friends! - please do not hesitate to inform us. Alright! This is your last chance to back out of the adventure! Once we enter Lola's house, there's no turning back! Is everybody ready?</p>
      </div>
      `
    },
    door_overlay: {
      message: `
      <div id="booknow-modal-open">
        <h1>Book Now</h1>
        <p>Lorem ipsum dolor sit amet</p>
      </div>
      `
    },
  })
  // TO ADD HTML EMBED: add id and HTML content to the configuration object
  // IN the HTML, put 'config' in the data-content attribute
  //
  window.room_1 = new Room({
    name: 'room_1',
    wrapper_id: 'sala',
    map_image_id: 'room1_bg',
    has_transition: true,
    transition_trigger: '#shelf',
    transition_element: '#trans_1',
    next_room: '#forest',
    areas: [
      {
        name: 'shelf',
        x_points: [560, 1010],
        y_points: [60,  650]
      },
      {
        name: 'portrait',
        x_points: [1070, 1425],
        y_points: [0, 190]
      },
      {
        name: 'chair',
        x_points: [1010, 1150, 1210, 1360, 1388, 1370, 1270, 1075, 870, 870, 1010],
        y_points: [475,  475,  300,  295,  300,  680,  795,  795,  740, 680, 650]
      },
      {
        name: 'frames',
        x_points: [1110, 1425, 1425, 1388, 1388, 1360, 1210, 1180, 1110],
        y_points: [275,  260,  385,  385,  300,  295,  300,  380,  380]
      },
      {
        name: 'table',
        x_points: [150, 400],
        y_points: [275, 540]
      }
    ]
  })

  window.room_2 = new Room({
    name: 'room_2',
    wrapper_id: 'forest',
    map_image_id: 'room2_bg',
    has_transition: true,
    transition_trigger: '#burrow',
    transition_element: '#trans_2',
    next_room: '#floor',
    areas: [
      {
        name: 'burrow',
        x_points: [530, 840],
        y_points: [670, 740]
      },
      {
        name: 'flower',
        x_points: [950, 1050, 1290, 1400, 1220, 990],
        y_points: [480, 290,  290,  475,  610,  550]
      },
      {
        name: 'note',
        x_points: [1185, 1240, 1210, 1150],
        y_points: [160,  175,  250,  220]
      },
      {
        name: 'shoe',
        x_points: [70, 220],
        y_points: [350, 460]
      },
      {
        name: 'sign',
        x_points: [755, 800, 885, 955, 955, 895],
        y_points: [520, 420, 360, 360, 440, 580]
      },
      {
        name: 'tree',
        x_points: [825, 910, 1030, 1120, 985, 985, 920, 920, 840],
        y_points: [210, 130, 130,  200,  265, 295, 310, 240, 240]
      }
    ]
  })

  window.room_3 = new Room({
    name: 'room_3',
    wrapper_id: 'floor',
    map_image_id: 'room3_bg',
    areas: [
      {
        name: 'door',
        x_points: [630, 640, 690, 730, 800, 830, 840],
        y_points: [640, 390, 300, 290, 315, 375, 630]
      },
      {
        name: 'floorsign',
        x_points: [1090, 1100, 1180, 1300, 1360, 1260, 1290, 1250, 1130],
        y_points: [390,  300,  230,  230,  360,  415,  490,  490,  470]
      }
    ]
  })
})

window.addEventListener('load', function() {
  Pace.on('start', function() {
    document.querySelector('#preloader').classList.toggle('open_loader')
  })
  Pace.on('done', function() {
    document.querySelector('#preloader').classList.toggle('open_loader')
  })
  if(window.innerWidth < window.innerHeight) {
    modal.modal_note()
  } else {
    modal.open_welcome_modal()
  }
  room_1.resize_clickables()
  room_2.resize_clickables()
  room_3.resize_clickables()

  switch(location.hash) {
    case '#forest':
      room_1.set_as_unviewable()
      room_2.set_as_viewable()
      room_3.set_as_unviewable()
      break
    case '#floor':
      room_1.set_as_unviewable()
      room_2.set_as_unviewable()
      room_3.set_as_viewable()
      break
    default:
      room_1.set_as_viewable()
      room_2.set_as_unviewable()
      room_3.set_as_unviewable()
      break
  }
})

window.addEventListener('resize', function() {
  if(window.innerWidth < window.innerHeight) {
    modal.modal_note()
  }
  room_1.resize_clickables()
  room_1._set_transition_mask()
  room_2.resize_clickables()
  room_2._set_transition_mask()
  room_3.resize_clickables()
  room_3._set_transition_mask()
})

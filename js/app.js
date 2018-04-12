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
  }

  _set_transition_mask() {
    let trans_mask = this.root.querySelector('.transition_view')
    let image = document.querySelector(`#${ this.map_image_id }`)
    let ratio = image.naturalHeight/image.naturalWidth
    let height = window.innerWidth*ratio

    trans_mask.style.height = `${height}px`
    trans_mask.style.width = '100%'
    //trans_mask.style.top = `${image.y}px`
    console.dir(image)
    console.log(image.height)
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

    if(!reverse) {
      let black = root.querySelector('.black')
      black.classList.add('animate')
      black.addEventListener('transitionend', function() {
        //next_room_element.classList.toggle('show')
        transition.classList.add('show')
      }, { once: true })
      transition.addEventListener('transitionend', function() {
        black.classList.remove('animate')
        this.classList.remove('show')
        root.classList.remove('viewable')
        next_room_element.classList.add('viewable')
        window.location.hash = next_room
      }, { once: true })
    }

    if(reverse) {
      let black = root.querySelector('.black')
      black.classList.add('animate')

      black.addEventListener('transitionend', function() {
        transition.classList.add('showdown')
      }, { once: true })

      transition.addEventListener('transitionend', function() {
        black.classList.remove('animate')
        transition.classList.remove('showdown')
        root.classList.remove('viewable')
        next_room_element.classList.add('viewable')
        window.location.hash = next_room
      })
    }
  }

  _attachTransitionListeners(trigger_selector) {
    let trigger = document.querySelector(trigger_selector)
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
      overlay.style.top = (this.root.querySelector(`#${this.map_image_id}`).y+1)+'px'
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

class HUD {
  constructor(config = {}) {
    this.config = config
    this._initialize_buttons(0)
  }

  _initialize_buttons() {
    let prev = document.querySelector('#prev')
    let next = document.querySelector('#next')

    prev.addEventListener('click', (evt) => {
      evt.preventDefault()
      let current_hash = location.hash
      if(location.hash == '') current_hash = '#sala'
      this.go_to(current_hash, this.config[current_hash].prev.target, 'prev')
    })

    next.addEventListener('click', (evt) => {
      evt.preventDefault()
      let current_hash = location.hash
      if(location.hash == '') current_hash = '#sala'
      this.go_to(current_hash, this.config[current_hash].next.target, 'next')
    })
  }

  disable_buttons() {
    let prev = document.querySelector('#prev')
    let next = document.querySelector('#next')
    switch(location.hash) {
      case '#forest':
        prev.classList.remove('hidden')
        next.classList.remove('hidden')
        break
      case '#floor':
        prev.classList.remove('hidden')
        next.classList.add('hidden')
        break
      default:
        prev.classList.add('hidden')
        next.classList.remove('hidden')
        break
    }
  }

  go_to(current_hash, target_hash, direction) {
    if(this.config[current_hash][direction]) {
      if(direction == 'next') {
        window.room_1.go_to_next_room(
          current_hash,
          this.config[current_hash][direction].transition,
          target_hash
        )
      } else {
        window.room_1.go_to_next_room(
          current_hash,
          this.config[current_hash][direction].transition,
          target_hash,
          true
        )
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.hud = new HUD({
    '#sala': {
      prev: null,
      next: {
        target: '#forest',
        transition: '#trans_1_next'
      }
    },
    '#forest': {
      prev: {
        target: '#sala',
        transition: '#trans_2_prev'
      },
      next: {
        target: '#floor',
        transition: '#trans_2_next'
      }
    },
    '#floor': {
      prev: {
        target: '#forest',
        transition: '#trans_3_prev'
      },
      next: null
    }
  })

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

  hud.disable_buttons()
})

window.addEventListener('load', function() {
  setTimeout(function() {
    document.querySelector('#preloader').classList.toggle('open_loader')
  }, 2000)
  if(window.innerWidth < window.innerHeight) {
    modal.modal_note()
  } else {
    modal.open_welcome_modal()
  }
  room_1.resize_clickables()
  room_1._set_transition_mask()
  room_2.resize_clickables()
  room_2._set_transition_mask()
  room_3.resize_clickables()
  room_3._set_transition_mask()

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

window.addEventListener('hashchange', function() {
  hud.disable_buttons()
})

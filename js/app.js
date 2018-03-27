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
  let image_width = document.querySelector('#bg').width
  let x_values = x_ratio.map((val, idx) => {
    return val*image_width
  })
  let image_height = document.querySelector('#bg').height
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

class RoomOne {
  constructor() {
    this.ClickMap = new Map()
    this.map_object = document.querySelector('[name="room_1"]')
    this.clickable_ids = [ '#shelf', '#portrait', '#chair', '#frames', '#table' ]
    let shelf_coordinates = coordinate_init(
      [560, 1010],
      [60,  650]
    )
    this.ClickMap.set('#shelf', {x: shelf_coordinates.x, y: shelf_coordinates.y})
    let portrait_coordinates = coordinate_init([1070, 1425], [0, 190])
    this.ClickMap.set('#portrait', {x: portrait_coordinates.x, y: portrait_coordinates.y})
    let chair_coordinates = coordinate_init(
      [1010, 1150, 1210, 1360, 1388, 1370, 1270, 1075, 870, 870, 1010],
      [475,  475,  300,  295,  300,  680,  795,  795,  740, 680, 650]
    )
    this.ClickMap.set('#chair', {x: chair_coordinates.x, y: chair_coordinates.y})
    let frames_coordinates = coordinate_init(
      [1110, 1425, 1425, 1388, 1388, 1360, 1210, 1180, 1110],
      [275,  260,  385,  385,  300,  295,  300,  380,  380]
    )
    this.ClickMap.set('#frames', {x: frames_coordinates.x, y: frames_coordinates.y})
    let table_coordinates = coordinate_init([150, 400], [275, 540])
    this.ClickMap.set('#table', {x: table_coordinates.x, y: table_coordinates.y})
    this._attachListeners()

  }

  resize_clickables() {
    let overlays = document.querySelectorAll('.overlay')
    for(let overlay of overlays) {
      overlay.style.top = document.querySelector('#bg').y+'px'
      overlay.style.height = document.querySelector('#bg').height+'px'
    }
    for(let id of this.clickable_ids) {
      set_point_values(id, this.ClickMap.get(id).x, this.ClickMap.get(id).y)
    }
  }

  _attachListeners() {
    if(CSS.supports('mask: radial-gradient(rgba(0,0,0,1),rgba(0,0,0,0) 0%)')) {
      document.querySelector('.black').classList.toggle('pinhole')
    }
    let areas = document.querySelectorAll('area')
    for(let area of areas) {
      tippy(area, {
        followCursor: true,
        appendTo: this.map_object,
        placement: 'top-center',
        distance: 10
      })
      area.addEventListener('click', function(evt) {
        evt.preventDefault()
        console.log(evt.target)
        document.querySelector(`#${evt.target.getAttribute('name')}_overlay`).classList.add('hide')
        window.modal.modal_open(`${evt.target.getAttribute('name')}_overlay`)
      })
    }
    //let area = document.querySelector('#shelf')
    //area.addEventListener('click', (evt) => {
      //evt.preventDefault()

      //document.querySelector('#bg').classList.toggle('up')

      //if(CSS.supports('mask: radial-gradient(rgba(0,0,0,1),rgba(0,0,0,0) 0%)')) {
        //document.querySelector('.black').classList.toggle('block')
        //document.querySelector('#bg').classList.add('mask')
        //document.querySelector('#bg').addEventListener('animationend', function() {
          //document.querySelector('#bg').classList.add('final_mask')
          //document.querySelector('.transition_1').classList.toggle('show')
        //})
      //} else {
        //document.querySelector('.black').classList.toggle('animate')
        //document.querySelector('.black').addEventListener('transitionend', function() {
          //document.querySelector('.transition_1').classList.toggle('show')
        //})
      //}
      //document.querySelector('.transition_1').addEventListener('transitionend', function() {
        //document.querySelector('.transition_1').classList.toggle('show')
        //document.querySelector('[name="room_2"]').scrollIntoView({behavior: 'smooth'})
      //})
    //})
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
  window.room_1 = new RoomOne()
  window.modal = new Modal({
    subscribe: {
      message: `<p class="text-center" style="margin-bottom: 1em;">Subscribe to our mailing list to receive the latest updates!</p>

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
      </div>`
    },
    shelf_overlay: {
      message: `
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

        <p class="text-help text-align" style="color: #b0b0b0;">Explore this room to read more about Tipsy Tales</p>
      `,
      default_modal: true
    },
    portrait_overlay: {
      message: `
        <h1>About Us</h1>
        <img src="./images/tt-logo.png" class="text-center tt-logo"/>
        <p>We at Tipsy Tales are obsessed with bringing new experiences to the Philippines! Our team of wacky creatives include a variety of artists, writers, actors, chefs and designers, but we're all united by the same need - to build our take on a new "Aha!" moment in the life of every Filipino.</p>
        <p>Influenced by immersive theater, escape rooms, Japanese themed cafes and the London underground dining scene, the founders wanted to create a space wherein people of various artistic backgrounds can come together to create unique, immersive experiences that bring to light ideas worth sharing, conversations worth having and most importantly, joy.</p>

      `
    },
    chair_overlay: {
      message: `
        <h1>History</h1>
        <p>After a tragic death in the family, Lola invites you to her home to keep her company. She reminisces about the past and the song she used to share with the forest, before falling into a deep sleep. A mischievous duende, called Kati, pulls you into a world of adventure - a world where stories are still yet to be uncovered: A story of wonder, a story of love, a story full of longing and loss.</p>
      `
    },
    table_overlay: {
      message: `
        <h1>About the Show</h1>
        <p>Ang Kundiman is a production that showcases Filipino culture in a way you've never seen before. Deeply rooted in Filipino folklore, the story explores the adventure to save your Lola from the grasps of bizarre magical creatures residing in the heart of Manila.</p>
        <p>Adventurous souls book online for an hour of whimsical storytelling, close encounters with creatures of the unknown and taste a world away from their own. Journey with us and experience new sights and tastes but be careful, the way back home is never so clear and your ending is entirely up to you.</p>
      `
    },
    frames_overlay: {
      slideClasses: ['notooltip', 'notooltip'],
      links: [
        {
            title: 'Kati',
            href: './images/gallery/Kati.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Kati.png'
        },
        {
            title: 'Lola 1',
            href: './images/gallery/Lola 1.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Lola 1.png'
        },
        {
            title: 'Lola 2',
            href: './images/gallery/Lola 2.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Lola 2.png'
        },
        {
            title: 'Tikbalang 1',
            href: './images/gallery/Tikbalang 1.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 1.png'
        },
        {
            title: 'Tikbalang 2',
            href: './images/gallery/Tikbalang 2.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 2.png'
        },
        {
            title: 'Tikbalang 3',
            href: './images/gallery/Tikbalang 3.png',
            type: 'image/jpeg',
            thumbnail: './images/gallery/Tikbalang 3.png'
        }
      ]
    },
  })
  // TO ADD HTML EMBED: add id and HTML content to the configuration object
  // IN the HTML, put 'config' in the data-content attribute
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
})

window.addEventListener('resize', function() {
  if(window.innerWidth < window.innerHeight) {
    modal.modal_note()
  }
  room_1.resize_clickables()
})

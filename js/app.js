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

class RoomOne {
  constructor() {
    this.ClickMap = new Map()
    this.map_object = document.querySelector('[name="room_1"]')
    this.clickable_ids = [ '#shelf', '#portrait', '#chair', '#frames', '#table' ]
    let shelf_coordinates = coordinate_init(
      [560, 1010],
      [60,  650]
    )
    this.ClickMap.set('#shelf', {...shelf_coordinates})
    let portrait_coordinates = coordinate_init([1070, 1425], [0, 190])
    this.ClickMap.set('#portrait', {...portrait_coordinates})
    let chair_coordinates = coordinate_init(
      [1010, 1150, 1210, 1360, 1388, 1370, 1270, 1075, 870, 870, 1010],
      [475,  475,  300,  295,  300,  680,  795,  795,  740, 680, 650]
    )
    this.ClickMap.set('#chair', {...chair_coordinates})
    let frames_coordinates = coordinate_init(
      [1110, 1425, 1425, 1388, 1388, 1360, 1210, 1180, 1110],
      [275,  260,  385,  385,  300,  295,  300,  380,  380]
    )
    this.ClickMap.set('#frames', {...frames_coordinates})
    let table_coordinates = coordinate_init([150, 400], [275, 540])
    this.ClickMap.set('#table', {...table_coordinates})
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

    document.body.appendChild(this.modal)

    this.modal.addEventListener('click', function(evt) {
      if(evt.target == this || evt.target.nodeName === 'BUTTON') {
        this.classList.toggle('modal_open')
        for(let overlay of document.querySelectorAll('.overlay')) {
          overlay.classList.remove('hide')
        }
      }
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

    modal_wrapper.appendChild(modal_close)

    modal_wrapper.appendChild(modal)
    return modal_wrapper
  }
  modal_open(id) {
    let content = document.querySelector(`#${ id }`).dataset.content
    if(content === 'config') {
      this.modal.firstChild.nextElementSibling.innerHTML = this.config[id]
    } else {
      this.modal.firstChild.nextElementSibling.innerHTML = content
    }
    this.modal.classList.toggle('modal_open')
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.room_1 = new RoomOne()
  window.modal = new Modal({
    shelf_overlay: `
      <h1>Welcome!</h1>
    `,
    portrait_overlay: `
      <h1>About Us</h1>
      <p>Tipsy Tales creates unique, immersive experiences through brilliant storytelling, production techniques and theatrical performances for an audience looking for a different kind of show.</p>
    `,
    frames_overlay: `
      <h1>Gallery</h1>
    `,
    chair_overlay:  `
      <h1>History</h1>
      <p>Influenced by immersive theater, escape rooms, Japanese themed cafes and the London underground dining scene, the founders wanted to create a space wherein people of various artistic backgrounds can come together to create unique, immersive experiences that bring to light ideas worth sharing, conversations worth having and most importantly, joy.</p>
    `,
    table_overlay: `
      <h1>What Our Show's Like</h1>
      <p>Adventurous souls book online for an hour of whimsical storytelling, close encounters with creatures of the unknown and taste a world away from their own.</p>
    `
  })
  // TO ADD HTML EMBED: add id and HTML content to the configuration object
  // IN the HTML, put 'config' in the data-content attribute
})

window.addEventListener('load', function() {
  room_1.resize_clickables()
})

window.addEventListener('resize', function() {
  room_1.resize_clickables()
})

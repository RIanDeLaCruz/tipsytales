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

class Room {
  constructor(config) {
    this.config = config
    this.ClickMap = new Map()
    this.map_object = document.querySelector(`[name="${config.name}"]`)
    this.map_image_id = this.config.map_image_id
    this.root = document.querySelector(`#${ this.config.wrapper_id }`)
    for(let area of this.config.areas) {
      let area_coordinates = coordinate_init(area.x_points, area.y_points)
      this.ClickMap.set(`#${area.name}`, {...area_coordinates})
    }
    this._attachListeners()
  }

  _attachListeners() {
    if(CSS.supports('mask: radial-gradient(rgba(0,0,0,1),rgba(0,0,0,0) 0%)')) {
      this.root.querySelector('.black').classList.toggle('pinhole')
    }
    let areas = this.root.querySelectorAll('area')
    for(let area of areas) {
      area.addEventListener('click', (evt) => {
        evt.preventDefault()
        this.root.querySelector(`#${evt.target.getAttribute('name')}_overlay`).classList.add('hide')
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

  resize_clickables() {
    let overlays = this.root.querySelectorAll('.overlay')
    for(let overlay of overlays) {
      overlay.style.top = this.root.querySelector(`#${this.map_image_id}`).y+'px'
      overlay.style.height = this.root.querySelector(`#${this.map_image_id}`).height+'px'
    }
    for(let area of this.config.areas) {
      let id = `#${area.name}`
      set_point_values(id, this.ClickMap.get(id).x, this.ClickMap.get(id).y)
    }
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
    modal_close.innerHTML = 'x'

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
  //window.room_1 = new RoomOne()
  window.modal = new Modal({
    shelf_overlay: `
      <h1>HELLO WORLD</h1>
      <p>WTH</p>
    `
  })
  // TO ADD HTML EMBED: add id and HTML content to the configuration object
  // IN the HTML, put 'config' in the data-content attribute
  //
  window.room_1 = new Room({
    name: 'room_1',
    wrapper_id: 'sala',
    map_image_id: 'room1_bg',
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
})

window.addEventListener('load', function() {
  room_1.resize_clickables()
  room_2.resize_clickables()
})

window.addEventListener('resize', function() {
  room_1.resize_clickables()
  room_2.resize_clickables()
})

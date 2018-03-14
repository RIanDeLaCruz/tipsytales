let get_ratio = function(values, axis) {
  let ratio = []
  let height = document.querySelector('#bg').height
  let divisor = (axis == 'x' ) ?
                document.documentElement.clientWidth :
                height
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
  let x_values = x_ratio.map((val, idx) => {
    return val*document.documentElement.clientWidth
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

let resize_clickables = function() {
}

class RoomOne {
  constructor() {
    this.ClickMap = new Map()
    this.map_object = document.querySelector('[name="room_1"]')
    this.clickable_ids = [ '#shelf', '#portrait', '#chair', '#frames', '#table' ]
    let shelf_coordinates = coordinate_init(
      [564, 987],
      [72,  648]
    )
    this.ClickMap.set('#shelf', {...shelf_coordinates})
    let portrait_coordinates = coordinate_init([1067,1410], [0,214])
    this.ClickMap.set('#portrait', {...portrait_coordinates})
    let chair_coordinates = coordinate_init(
      [890,900,1100,1180,1380,1360,1210,840],
      [610,570, 500, 300, 310, 690, 800,750]
    )
    this.ClickMap.set('#chair', {...chair_coordinates})
    let frames_coordinates = coordinate_init(
      [1100,1380,1420,1380,1380,1180,1150,1100],
      [270, 230, 380, 380, 300, 300, 390, 390 ]
    )
    this.ClickMap.set('#frames', {...frames_coordinates})
    let table_coordinates = coordinate_init(
      [165, 380],
      [320, 530]
    )
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
    let area = document.querySelector('#shelf')
    area.addEventListener('click', (evt) => {
      evt.preventDefault()
      //document.querySelector('[name="room_2"]').scrollIntoView({behavior: 'smooth'})
      //

      document.querySelector('#bg').classList.toggle('up')

      if(CSS.supports('mask: radial-gradient(rgba(0,0,0,1),rgba(0,0,0,0) 0%)')) {
        document.querySelector('.black').classList.toggle('block')
        document.querySelector('#bg').classList.add('mask')
        document.querySelector('#bg').addEventListener('animationend', function() {
          document.querySelector('#bg').classList.add('final_mask')
          document.querySelector('.transition_1').classList.toggle('show')
        })
      } else {
        document.querySelector('.black').classList.toggle('animate')
        document.querySelector('.black').addEventListener('transitionend', function() {
          document.querySelector('.transition_1').classList.toggle('show')
        })
      }
      document.querySelector('.transition_1').addEventListener('transitionend', function() {
        document.querySelector('.transition_1').classList.toggle('show')
        document.querySelector('[name="room_2"]').scrollIntoView({behavior: 'smooth'})
      })
    })
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.room_1 = new RoomOne()
  room_1.resize_clickables()
})

window.addEventListener('resize', function() {
  room_1.resize_clickables()
})

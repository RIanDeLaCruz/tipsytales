let get_ratio = function(values, axis) {
  let ratio = []
  let divisor = (axis == 'x' ) ?
                document.documentElement.clientWidth :
                document.documentElement.clientHeight
  for(let value of values) {
    ratio.push(value/divisor)
  }
  return ratio
}

let coordinate_init = function(x_coordinates, y_coordinates) {
  let x_ratio = get_ratio(x_coordinates, 'x')
  let y_ratio = get_ratio(y_coordinates, 'y')
  let x_values = x_ratio.map((val, idx) => {
    return val*document.documentElement.clientWidth
  })
  let y_values = y_ratio.map((val, idx) => {
    return val*document.documentElement.clientHeight
  })

  let area_coordinates = ''
  for(let i = 0; i < x_ratio.length; i++) {
    if(i == 0) {
      area_coordinates += `${x_values[i]},${y_values[i]}`
    } else {
      area_coordinates += `,${x_values[i]},${y_values[i]}`
    }
  }
  return area_coordinates
}

let map_init = function() {
  let shelf_coordinates = coordinate_init(
    [564, 987],
    [72,  648]
  )
  let portrait_coordinates = coordinate_init([1067,1410], [0,214])
  let chair_coordinates = coordinate_init(
    [890,900,1100,1180,1380,1360,1210,840],
    [610,570, 500, 300, 310, 690, 800,750]
  )
  let frames_coordinates = coordinate_init(
    [1100,1380,1420,1380,1380,1180,1150,1100],
    [270, 230, 380, 380, 300, 300, 390, 390 ]
  )
  let table_coordinates = coordinate_init(
    [165, 380],
    [320, 530]
  )

  document.querySelector('#shelf').setAttribute('coords', shelf_coordinates)
  document.querySelector('#portrait').setAttribute('coords', portrait_coordinates)
  document.querySelector('#chair').setAttribute('coords', chair_coordinates)
  document.querySelector('#frames').setAttribute('coords', frames_coordinates)
  document.querySelector('#table').setAttribute('coords', table_coordinates)
}

class RoomOne {
  constructor() {
    this.map_object = document.querySelector('[name="room_1"]')
    if(CSS.supports('mask: radial-gradient(rgba(0,0,0,1),rgba(0,0,0,0) 0%)')) {
      document.querySelector('.black').classList.toggle('pinhole')
    }
    for(let area of this.map_object.querySelectorAll('area')) {
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
}

document.addEventListener('DOMContentLoaded', function() {
  map_init()
  let room_1 = new RoomOne()
})

window.addEventListener('resize', function() {
  map_init()
}, {passive: true})

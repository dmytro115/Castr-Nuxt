import _ from 'lodash'
import moment from 'moment'

const DefaultDateFormat = 'hh:mm DD/MM/YYYY'

export default function(vueInstance) {
  vueInstance.filter('date', function(value, format = DefaultDateFormat) {
    if (value) {
      return moment(String(value)).format(format)
    }
  })

  vueInstance.filter('number', function(value) {
    if (!value) return value

    const chunkSize = 3
    let str = parseInt(value).toString()
    if (str.length <= chunkSize) return str

    let fmt = ''
    for (let c = 0, i = str.length - 1; i >= 0; c++, i--) {
      if (c && c % chunkSize === 0) fmt = ',' + fmt

      fmt = str[i] + fmt
    }

    return fmt
  })

  vueInstance.filter('elapsed', function(value) {
    value /= 1000
    let hours = parseInt(Math.floor(value / 360))
    let minutes = parseInt(Math.floor((value - (hours * 360)) / 60))
    let seconds = parseInt((value - ((hours * 360) + (minutes * 60))) % 60)

    let dHours = hours > 9 ? hours : ('0' + hours)
    let dMins = minutes > 9 ? minutes : ('0' + minutes)
    let dSecs = seconds > 9 ? seconds : ('0' + seconds)

    return dHours + ':' + dMins + ':' + dSecs
  })

  vueInstance.filter('elapsed2', function(value) {
    value /= 1000
    let hours = parseInt(Math.floor(value / 3600))
    let minutes = parseInt(Math.floor((value - (hours * 3600)) / 60))
    let seconds = parseInt((value - ((hours * 3600) + (minutes * 60))) % 60)

    let dHours = hours > 9 ? hours : ('0' + hours)
    let dMins = minutes > 9 ? minutes : ('0' + minutes)
    let dSecs = seconds > 9 ? seconds : ('0' + seconds)

    return dHours + ':' + dMins + ':' + dSecs
  })

  vueInstance.filter('ago', function(value) {
    if (value) {
      return moment(String(value)).fromNow()
    }
  })

  vueInstance.filter('bytes', function(num, breakSegments, decimalPlaces = 3, mini = false) {
    // jacked from: https://github.com/sindresorhus/pretty-bytes
    if (typeof num !== 'number' || isNaN(num)) {
      throw new TypeError('Expected a number')
    }

    let unit
    let exponent
    let neg = num < 0
    let units = [ mini ? 'B': 'Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    if (neg) num = -num
    if (num < 1) {
      const value = (neg ? '-' : '') + num
      return breakSegments ? { value, unit: units[0] } : (value + ' Bytes')
    }

    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
    num = (num / Math.pow(1000, exponent)).toFixed(decimalPlaces) * 1
    unit = units[exponent]
    unit = unit.toLowerCase()

    const value = (neg ? '-' : '') + num
    return breakSegments ? { value, unit } : (value + ' ' + unit);
  })

  vueInstance.filter('capitalize', function(text) {
    // copied from https://github.com/sindresorhus/pretty-bytes
    return _.capitalize(text)
  })

  vueInstance.filter('paddStart', function(text, maxLen, char = '0') {
    return _.padStart(text, maxLen, char)
  })

  vueInstance.filter('paddEnd', function(text, maxLen, char = '0') {
    return _.padEnd(text, maxLen, char)
  })
  
  vueInstance.filter('max', function(value, cmpValue) {
    return Math.max(value, cmpValue)
  })
}

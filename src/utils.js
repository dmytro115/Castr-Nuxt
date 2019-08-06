import _ from 'lodash'

export default {
  toArray,
  swapArray,
  updateArrayItem,
  validateURL,
  resolveURL,
  resolveStreamKey,
  removeArrayItem,
  binarySearch,
  parseQueryString
}

/**
 * @param {string} url
 * @param {object} options
 * @param {Array<string>} options.allowedProtos
 */
function validateURL(url, options) {
  options = _.assign({ validatePathname: true }, options)

  let urlChunks
  try {
    urlChunks = extractUrlSegments(url)
    // console.log(url, urlChunks)
  } catch (e) {}

  if (!urlChunks) return {}
  // console.log(urlChunks)
  // if (!urlChunks.protocol || !urlChunks.host || !urlChunks.pathname) return
  if (!urlChunks.protocol || !validateProto(urlChunks.protocol))
    return { reason: 'protocol' }

  if (!urlChunks.host || !validateHost(urlChunks.host))
    return { reason: 'host' }

  if (!urlChunks.pathname && options.validatePathname)
    return { reason: 'pathname' }

  return { valid: true }

  function validateProto(protocol) {
    const baseProto = _.replace(protocol, '://', '')
    const DefaultAllowedProtos = ['rtmp', 'rtmps', 'rtsp']
    const PROTOS = options.allowedProtos || DefaultAllowedProtos

    return PROTOS.indexOf(baseProto) > -1
  }

  function validateHost(host) {
    // check for dot `.` occurence
    let validated = !!_.size(host.split('.'))
    if (validated) {
      // check for invalid chars
      const ValidChars = /\d|[a-z]|[A-Z]|-|\.|\:/g
      let validCharsCount = _.size(host.match(ValidChars))
      validated = validCharsCount === _.size(host)
    }

    if (validated) {
      // check for valid port spec
      let hasPort = host.indexOf(':') > -1
      if (hasPort)
        validated = /\:\d+$/gi.test(host)
    }

    return validated
  }
}

/**
 * @param {string} url
 */
function resolveURL(url, trimLeadingSlash) {
  let updatedUrl = url
  // replace backslashes to forward slash
  updatedUrl = _.replace(updatedUrl, /\\/i, '/')

  // trim down multiple slashes `/` to just one
  let { protocol } = extractUrlSegments(url)
  let noProtoURL = _.replace(url, protocol, '')

  _.split(noProtoURL, '/').forEach(() => {
    noProtoURL = _.replace(noProtoURL, /\/{2,}/gi, '/')
  })

  updatedUrl = (protocol || '') + noProtoURL

  // facebook RTMPS patch
  if (/^rtmps/i.test(updatedUrl)) {
    updatedUrl = _.replace(updatedUrl, /^rtmps/i, 'rtmp')
    updatedUrl = _.replace(updatedUrl, /\:443\/?/i, ':80/')
  }

  // trim leading slashes if specified
  // if (trimLeadingSlash)
  //   updatedUrl = _.replace(updatedUrl, /\/$/, '')

  return encodeURI(updatedUrl)
}

function resolveStreamKey(streamKey) {
  const trimmedKey = streamKey.replace(/\s|\//g, '')
  return trimmedKey
}

function extractUrlSegments(url) {
  let protocol, host, pathname, auth

  protocol = _.head(url.match(/^\w+\:\/\//gi))
  if (protocol) {
    host = _.chain(url).replace(protocol, '').split('/').head().value()

    let _host = host
    let authSegmentIndex = host.lastIndexOf('@')
    if (authSegmentIndex > -1) {
      let authSegment = host.substr(0, authSegmentIndex)
      if (authSegment) {
        let [user, pass] = _.split(authSegment, ':')
        auth = { user, pass }
      }

      _host = host.substr(authSegmentIndex + 1)
    }

    host = _host
    // let [creds, _host] = _.split(host, '@')
    // if (!_host) host = creds
    // else {
    //   host = _host
    //   auth = creds
    //   if (auth) {
    //     let [user, pass] = _.split(auth, ':')
    //     auth = { user, pass }
    //   }
    // }
  }

  if (protocol && host) {
    pathname = _.chain(url)
      .replace(protocol, '')
      .replace(host)
      .split('/')
      .slice(1)
      .join('/')
      .value()
  }

  return { protocol, host, pathname, href: url, auth }
}

function updateArrayItem(array, newValue, atIndex) {
  return _.concat(
    array.slice(0, atIndex),
    [newValue],
    array.slice(atIndex + 1)
  )
}

function removeArrayItem(array, atIndex) {
  return _.concat(
    array.slice(0, atIndex),
    array.slice(atIndex + 1)
  )
}

function swapArray(array, nodeIndex1, nodeIndex2) {
  let arr = array.slice()
  let tempNode1 = arr[nodeIndex1]
  arr[nodeIndex1] = arr[nodeIndex2]
  arr[nodeIndex2] = tempNode1
  return arr
}

function toArray(param) {
  if (!_.isArray(param)) param = [param]

  return param
}

function binarySearch(ar, el, compareFunc) {
  let m = 0
  let n = ar.length - 1
  while (m <= n) {
    let k = (n + m) >> 1
    let cmp = compareFunc(el, ar[k])
    if (cmp > 0) {
      m = k + 1
    } else if (cmp < 0) {
      n = k - 1
    } else {
      return k
    }
  }

  return -m - 1
}

function parseQueryString(qstring) {
  let query = {}
  // if (qstring && /email\=/.test(qstring)) {
  if (qstring) {
    qstring = qstring.replace('?', '');
    let params = qstring.split('&');
    for (let i = 0; i < params.length; i++) {
      let pars = params[i].split('=');
      query[pars[0]] = pars[1]
    }
  }

  return query
}
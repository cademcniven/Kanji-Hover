var body = document.getElementById('kanjiHover')
if (body) body = body.innerHTML
var kanjis = new Set()
var arr = []

if (isOnline() && body) {
  appendCSS()
  findKanji()
  getKanjiData()

}

function isOnline() {
  return navigator.onLine
}

function findKanji() {
  const regex = /[\u4E00-\u9FAF]/g
  const matches = body.matchAll(regex)
  for (const match of matches) {
    kanjis.add(...match)
  }
}

function getKanjiData() {
  for (let kanji of kanjis) {
    let url = 'https://kanjiapi.dev/v1/kanji/' + kanji

    fetch(url)
      .then(resp => resp.json())
      .then(function (data) {
        buildString(kanji, data)
      })
      .then(function () {
        convertJSON()
        document.getElementById('kanjiHover').innerHTML = body
      })
  }
}

function buildString(kanji, data) {
  let s =
    '<a class="kanjiTooltip" onclick="kanjiClicked(event)" href="https://en.wiktionary.org/wiki/' + kanji + '#Japanese">' + kanji + '<span class="kanjiTooltipText">'
  s += '<span class="hoverText">Kanji:</span> ' + data.kanji + '<br>'
  s += '<span class="hoverText">Grade:</span> ' + data.grade + '<br>'
  s += '<span class="hoverText">Meaning:</span> '
  for (let str of data.meanings) {
    s += str + ', '
  }

  s = s.slice(0, -2)
  s += '<br>'

  if (data.kun_readings.length > 0) {
    s += '<span class="hoverText">Kun\'yomi:</span> '
    for (let str of data.kun_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  if (data.on_readings.length > 0) {
    s += '<span class="hoverText">On\'yomi:</span> '
    for (let str of data.on_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  s += '</span></a>'

  arr.push({
    [kanji]: s
  })
}

function convertJSON() {
  if (arr.length == kanjis.size) {
    const res = arr.reduce((acc, el) => {
      for (let key in el) {
        acc[key] = [...(acc[key] || []), el[key]]
      }
      return acc
    }, {})

    Object.entries(res).forEach(([key, value]) => {
      body = body.replace(new RegExp(key, 'g'), ...value)
    })
  }
}

function appendCSS() {
  var styleSheet = document.createElement('style')
  styleSheet.innerHTML = `
    .kanjiTooltip {
      position: relative;
      display: inline-block;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      user-drag: none; 
      -webkit-user-drag: none;
      user-select: text;
      outline: none;
    }

    .kanjiTooltip .kanjiTooltipText {
      visibility: hidden;
      width: 30vw;
      background-color: #1E1A1E;
      color: #fff;
      text-align: center;
      padding: 5px 0;
      border-radius: 6px;
      z-index: 1;
      display: inline-block;
      position: fixed;
       top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      font-size: 18px;
      writing-mode: horizontal-tb;
    }

    .kanjiTooltip:hover .kanjiTooltipText {
      visibility: visible;
    }

    .kanjiTooltipText {
      user-select: none; 
    }
    
    .hoverText {
      color: #e95464;
    }
    `

  document.head.appendChild(styleSheet)
}

function kanjiClicked(e) {
  if (e.button == 0) e.preventDefault() //disable left clicking (in order to allow for selecting)
}
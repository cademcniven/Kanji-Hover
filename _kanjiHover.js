var body = document.getElementById('kanjiHover')
if (body) body = body.innerHTML
var kanji = new Set()
var kanjiDict = {}

if (isOnline() && body) {
  appendCSS()
  findKanji()
  getKanjiData().then(r => {
    injectKanjiHTML()
  })
}

function isOnline() {
  return navigator.onLine
}

function findKanji() {
  const regex = /[\u4E00-\u9FAF]/g
  const matches = body.matchAll(regex)
  for (const match of matches) {
    kanji.add(...match)
  }
}

async function getKanjiData() {
  kanji = [...kanji]
  let kanjiArr = await Promise.all(
    kanji.map(async character => {
      let res = await fetch('https://kanjiapi.dev/v1/kanji/' + character)
      return res.json()
    })
  )

  //populate dictionary with kanji as key
  for (item of kanjiArr) {
    kanjiDict[item["kanji"]] = item
  }
}

function buildString(kanji) {
  let s =
    '<a class="kanjiTooltip" onclick="kanjiClicked(event)" href="https://en.wiktionary.org/wiki/' + kanji + '#Japanese">' + kanji + '<span class="kanjiTooltipText">'
  s += '<span class="hoverText">Kanji:</span> ' + kanji + '<br>'
  if (kanjiDict[kanji].grade)
    s += '<span class="hoverText">Grade:</span> ' + kanjiDict[kanji].grade + '<br>'
  s += '<span class="hoverText">Meaning:</span> '
  for (let str of kanjiDict[kanji].meanings) {
    s += str + ', '
  }

  s = s.slice(0, -2)
  s += '<br>'

  if (kanjiDict[kanji].kun_readings.length > 0) {
    s += '<span class="hoverText">Kun\'yomi:</span> '
    for (let str of kanjiDict[kanji].kun_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  if (kanjiDict[kanji].on_readings.length > 0) {
    s += '<span class="hoverText">On\'yomi:</span> '
    for (let str of kanjiDict[kanji].on_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  s += '</span></a>'

  return s
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

function injectKanjiHTML() {
  var str = document.getElementById("kanjiHover").innerHTML

  var re = new RegExp(Object.keys(kanjiDict).join("|"), "gi");
  str = str.replace(re, function (matched) {
    if (kanjiDict[matched])
      return buildString(matched)

    return matched
  });

  document.getElementById("kanjiHover").innerHTML = str
}
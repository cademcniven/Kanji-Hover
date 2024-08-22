var currentKanji = null

var hoverDiv = document.getElementsByClassName("hoverDiv")
if (hoverDiv.length !== 0)
{
  hoverDiv[0].innerHtml = ""
  hoverDiv[0].style.display = "none"
}
var mainDiv = document.getElementById('kanjiHover')
if (!mainDiv) mainDiv = document.getElementById('kanjiHoverFront')
if (mainDiv) var body = mainDiv.innerHTML
var kanji = new Set()
var kanjiDict = {}


if (mainDiv) {
  appendCSS()
  appendHoverDiv()
  findKanji()
  getKanjiData().then(r => {
    document.addEventListener('touchmove', function(event) {
        var touch = event.touches[0] || event.changedTouches[0];
        var targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

        if (targetElement && targetElement.classList.contains('kanjiHoverTarget'))
          showKanjiPopup(targetElement.innerHTML)
        else
          onKanjiUnhover(event)
    });
    document.addEventListener('touchend', onKanjiUnhover);

    let kanjiTargets = document.getElementsByClassName("kanjiHoverTarget")
    Array.from(kanjiTargets).forEach(function (element) {
        element.addEventListener('mouseenter', onKanjiHover);
        element.addEventListener('mouseleave', onKanjiUnhover);
        element.addEventListener('touchstart', onKanjiHover);
    });
  })
}

function appendHoverDiv() {
  var hoverDiv = document.createElement('div')
  hoverDiv.classList.add("hoverDiv")
  document.body.appendChild(hoverDiv)
}

function findKanji() {
  const regex = /([\u4E00-\u9FAF])(?![^<]*>|[^<>]*<\/g)/g
  const matches = body.matchAll(regex)
  for (const match of matches) {
    kanji.add(...match)
  }

  body = body.replace(regex, (match) => `<span class="kanjiHoverTarget">${match}</span>`)
  mainDiv.innerHTML = body;
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
    kanjiDict[item["kanji"]] = buildString(item)
  }
}

function onKanjiHover(event) {
  let kanji = event.target.innerHTML
  showKanjiPopup(kanji)
}

function onKanjiUnhover(event) {
  if (currentKanji != null)
  {
    let hoverDiv = document.getElementsByClassName("hoverDiv")[0]
    hoverDiv.innerHtml = ""
    hoverDiv.style.display = "none"
    currentKanji = null
  }
}

function showKanjiPopup(kanji) {
  if (currentKanji != kanji)
  {
    let hoverDiv = document.getElementsByClassName("hoverDiv")[0]
    hoverDiv.innerHTML = kanjiDict[kanji]
    hoverDiv.style.display = "block"
    currentKanji = kanji
  }
}

function buildString(kanjiData) {
  let s = '<span class="hoverText">Kanji:</span> ' + kanjiData.kanji + '<br>'
  if (kanjiData.grade)
    s += '<span class="hoverText">Grade:</span> ' + kanjiData.grade + '<br>'
  s += '<span class="hoverText">Meaning:</span> '
  for (let str of kanjiData.meanings) {
    s += str + ', '
  }

  s = s.slice(0, -2)
  s += '<br>'

  if (kanjiData.kun_readings.length > 0) {
    s += '<span class="hoverText">Kun\'yomi:</span> '
    for (let str of kanjiData.kun_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  if (kanjiData.on_readings.length > 0) {
    s += '<span class="hoverText">On\'yomi:</span> '
    for (let str of kanjiData.on_readings) {
      s += str + ', '
    }
    s = s.slice(0, -2)
    s += '<br>'
  }

  s += '</span>'

  return s
}

function appendCSS() {
  var styleSheet = document.createElement('style')
  styleSheet.innerHTML = `
  .hoverDiv {
    width: 30vw;
    background-color: #1E1A1E;
    color: #fff;
    text-align: center;
    display: none;
    position: fixed;
	padding: 5px 0;
	border-radius: 6px;
    left: 50vw;
    top: 50vh;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    font-size: 18px;
    writing-mode: horizontal-tb;
  }
  
  .hoverText {
    color: #e95464;
  }

  @media only screen and (max-width: 768px) {
      .hoverDiv {width: 90vw;}
  }
  `
  document.head.appendChild(styleSheet)
}

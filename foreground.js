let initialState = {
  active: false,
  pending: false,
  x1: null,
  y1: null,
  w: null,
  h: null,
  host: null,
  fill: null,
  line1: null,
  line2: null,
  line3: null,
  line4: null,
}

let state = Object.assign({}, initialState);

function start() {
  stop();
  state.active = true;
  state.host = document.createElement('div')
  state.host.className = 'measure-it'
  document.body.appendChild(state.host)
  let shadow = state.host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 2147483647;
      }

      :host * {
        pointer-events: none;
      }

      .line {
        position: absolute;
      }

      .line-h {
        right: 0;
        left: 0;
        transform: translateY(-1px);
      }

      .line-h::before {
        content: '';
        display: block;
        border-top: 1px solid rgba(0, 0, 0, .5);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .line-h::after {
        content: '';
        display: block;
        border-top: 1px dashed rgba(255, 255, 255, .5);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .line-v {
        top: 0;
        bottom: 0;
        transform: translateX(-1px);
      }

      .line-v::before {
        content: '';
        display: block;
        border-left: 1px solid rgba(0, 0, 0, .5);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .line-v::after {
        content: '';
        display: block;
        border-left: 1px dashed rgba(255, 255, 255, .5);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      #fill {
        position: absolute;
        background-color: rgba(127, 255, 255, .5);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
      }

      #results {
        font-family: "Courier New", Courier, monospace;
        color: #000000;
        text-shadow: 0 0 4px #FFFFFF;
        opacity: .75;
        padding: 2px 4px;
      }

      #results.outside {
        background-color: #FFFFFF;
        position: absolute;
      }
    </style>
    <div id="fill">
      <div id="results"></div>
    </div>
    <div id="line-1" class="line line-h"></div>
    <div id="line-2" class="line line-h"></div>
    <div id="line-3" class="line line-v"></div>
    <div id="line-4" class="line line-v"></div>
  `
  state.fill = shadow.querySelector('#fill')
  state.results = shadow.querySelector('#results')
  state.line1 = shadow.querySelector('#line-1')
  state.line2 = shadow.querySelector('#line-2')
  state.line3 = shadow.querySelector('#line-3')
  state.line4 = shadow.querySelector('#line-4')
  chrome.runtime.sendMessage({ type: 'MEASURE_IT_START' });
}

function stop() {
  if (state.host) {
    document.body.removeChild(state.host);
    Object.assign(state, initialState);
    chrome.runtime.sendMessage({ type: 'MEASURE_IT_STOP' });
  }
}

window.addEventListener('load', () => {
  document.addEventListener('mousemove', ({ clientX, clientY }) => {
    if (state.active) {
      if (state.pending) {
        const fillX = Math.min(state.x1, clientX);
        const fillY = Math.min(state.y1, clientY);
        state.w = state.x1 !== null ? Math.abs(clientX - state.x1) : null;
        state.h = state.y1 !== null ? Math.abs(clientY - state.y1) : null;
        state.line2.style.transform = `translateY(${clientY}px)`;
        state.line4.style.transform = `translateX(${clientX}px)`;
        state.fill.style.transform = `translate(${fillX}px, ${fillY}px)`;
        state.fill.style.width = `${state.w}px`;
        state.fill.style.height = `${state.h}px`;
        state.results.innerText = `${state.w}x${state.h}`;
        const resultsSize = { w: state.results.offsetWidth, h: state.results.offsetHeight };

        if (resultsSize.w > state.w || resultsSize.h > state.h) {
          const isLeft = fillX > (window.innerWidth - (fillX + state.w));
          const isTop = fillY > (window.innerHeight - (fillY + state.h));
          const translateX = isLeft ? -resultsSize.w : resultsSize.w;
          const translateY = isTop ? -resultsSize.h : resultsSize.h;
          state.results.classList.add('outside');
          state.results.style.top = isTop ? '0' : 'auto';
          state.results.style.right = isLeft ? 'auto' : '0';
          state.results.style.bottom = isTop ? 'auto' : '0';
          state.results.style.left = isLeft ? '0' : 'auto';
          state.results.style.transform = `translate(${translateX}px, ${translateY}px)`;
        } else {
          state.results.classList.remove('outside');
          state.results.style.top = '';
          state.results.style.right = '';
          state.results.style.bottom = ''
          state.results.style.left = '';
          state.results.style.transform = '';
        }
      } else {
        state.x1 = clientX;
        state.y1 = clientY;
        state.line1.style.transform = `translateY(${clientY}px)`;
        state.line3.style.transform = `translateX(${clientX}px)`;
      }
    }
  })

  document.addEventListener('mousedown', ({ clientX, clientY }) => {
    if (state.active) {
      state.pending = true;
    }
  })

  document.addEventListener('mouseup', ({ clientX, clientY, altKey }) => {
    if (state.active) {
      const width = state.w || 0;
      const height = state.h || 0;
      if (altKey) {
        alert(`${width}x${height}`);
      }
      console.log({ width, height });
      stop();
    }
  })

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
      case 'MEASURE_IT_CLICK':
        if (state.active) {
          stop();
        } else {
          start();
        }
        break;
      case 'MEASURE_IT_STOP':
        stop();
        break;
    }
    sendResponse(state);
  });
})
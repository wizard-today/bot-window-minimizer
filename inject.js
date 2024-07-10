const CozeChatbotMinimizerExtension = (() => {
  console.log('"Coze chatbot minimizer" extension is loaded')

  const DISPLAY_NONE_CLASS = 'bot-window-hidden'
  const src = {
    logo: chrome.runtime.getURL('icon/500.png')
  }

  showProgressScreen(onPageLoaded)

  async function onPageLoaded() {
    if (document.title === 'Coze') { // page loading error
      return location.reload()
    }

    DevPanel.hide() // UI minimize

    setTimeout(() => {
      document.querySelector('.rc-textarea').focus() // prompt input focus
    }, 0)
  }

  // DevPanel

  const DevPanel = (() => {
    // changes
    const selectors = {
      // top headers
      '.semi-spin-children > div:nth-child(1)': DISPLAY_NONE_CLASS, // Page header
      '.semi-spin-children > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)': DISPLAY_NONE_CLASS, // Preview header

      // left panel
      '.semi-spin-children > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)': DISPLAY_NONE_CLASS, // left panel
      '.semi-spin-children > div:nth-child(2) > div:nth-child(1)': 'bot-window-flexed', // right margin

      // bottom input
      '.pStAbHgTdAlDVUlpMOGP': DISPLAY_NONE_CLASS, // bottom warning
      '.qtV_UKcJKqgw6X0fPvI4': DISPLAY_NONE_CLASS, // input top shaddow
    }

    // unique class names
    const classes = Array.from(new Set(Object.values(selectors)))

    // state

    const iconLink = document.querySelector(`link[rel*='icon']`)

    let isHidden = true
    let originalTitle = document.title
    let originalIcon = iconLink.href

    // actions

    function hide() {
      isHidden = true

      originalTitle = document.title
      originalIcon = iconLink.href

      document.title = document.title.split(' - ')[0]
      iconLink.href = document.querySelector('.semi-avatar > img').src

      for (const selector in selectors) {
        const element = document.querySelector(selector)
        if (element) {
          element.classList.add(selectors[selector])
        } else {
          console.error('CozeChatbotMinimizerExtension | selector not found: ' + selector)
        }
      }
    }

    function show() {
      isHidden = false

      document.title = originalTitle
      iconLink.href = originalIcon

      for (const className of classes) {
        document.querySelectorAll('.' + className).forEach(element => {
          element.classList.remove(className)
        })
      }
    }

    function toogle() {
      if (isHidden) {
        show()
      } else {
        hide()
      }
    }

    return {
      hide,
      show,
      toogle,
    }
  })()

  // ProgressScreen

  /**
   * @param {() => Promise<void>} onFinish 
   */
  function showProgressScreen(onFinish) {
    document.querySelector('#root').classList.add(DISPLAY_NONE_CLASS)
    document.body.appendChild(
      document.createRange().createContextualFragment(`
        <div id="bot-loading-container">
          <div class="bot-loading-image-container">
            <img src="${src.logo}" alt="Bot window minimizer">
          </div>
          <b>
            Coze chatbot minimizer
          </b>
          <div class="bot-loading-progress-bar">
            <div id="bot-loading-progress-bar-fill"></div>
          </div>
        </div>
      `)
    )

    const whaitSec = 3
    const retryAfterSec = 2
    let spentSec = 0

    const timerId = setInterval(async () => {
      if (spentSec < whaitSec) {
        spentSec++
        setProgress(spentSec * 4)
      } else {
        clearInterval(timerId)
        await handleOnFinishCallback()
        document.querySelector('#root').classList.remove(DISPLAY_NONE_CLASS)
        document.querySelector(`#bot-loading-container`).remove()
      }
    }, 1000)

    /**
     * @param {number} value 
     */
    function setProgress(value) {
      const progressBarFill = document.getElementById('bot-loading-progress-bar-fill')
      let progressValue = value

      if (progressValue < 0) {
        progressValue = 0
      } else if (progressValue > 10) {
        progressValue = 10
      }

      progressBarFill.style.width = `${progressValue * 10}%`
    }

    async function handleOnFinishCallback() {
      try {
        await onFinish()
      } catch {
        return new Promise(resolve => {
          setTimeout(
            () => handleOnFinishCallback().then(resolve),
            retryAfterSec
          )
        })
      }
    }
  }

  // exports

  return {
    onActionIconClicked() {
      DevPanel.toogle()
    }
  }
})()

# Video to Slides

This Chrome extension allows you to take screenshots of any given YouTube video and generate a PDF from them (optionally also with text recognition, creating a searchable PDF). The screenshots and PDF are stored in any folder of your choice.

## Installation

As this Chrome Extension has not been published in the Chrome Store, you need to clone its repo (or download the code) and install it in developer mode.

Instructions:

1. Get the code (by cloning this repo or downloading and unzipping)
2. Install the project's dependencies + build the project by running `npm install` and `npm build` (For this, Node.js has to be installed on your system!)
3. Go to `chrome://extensions`
4. Make sure Developer mode is on (switch in the upper-right corner)
5. Click on `Load unpacked`
6. Choose the `dist` subfolder of this project (should contain the project build from step 2)

## Development info

### "Tech Stack" Overview

This Chrome extension is written in Typescript. React is used for the content script and popup page. The production/development build pipeline is implemented using webpack. The project was built on top of [this](https://github.com/chibat/chrome-extension-typescript-starter) starter template. Testing with Jest would theoretically also be possible but no tests are implemented.

PDFs are generated with [jspdf](https://parall.ax/products/jspdf). For OCR, [tessseract.js](https://tesseract.projectnaptha.com/) was used. Many added UI components rely on [React Material UI](https://mui.com/). [use-chrome-storage](https://github.com/onikienko/use-chrome-storage) made accessing Chrome storage from React quite convenient.

### Setup

```
npm install
```

### Build

```
npm run build
```

### While developing

Make use of automated dev-build updates on every change in the source code by running

```
npm run watch
```

or hit <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> (if using VS code)

Unfortunately, there is no easy auto-hot-reload option for Chrome extensions. However, the next best thing I could find is the [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=de) Chrome Extension. With this extension you can reload all unpacked extensions by clicking the extension icon or via a keyboard shortcut (default: <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd>).

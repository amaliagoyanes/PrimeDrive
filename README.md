# BWARE-frontend

Frontend mobile application for bware.

### Tech
* [Javascript] - high-level programming language.
* [ReactJS] - framework for js.
* [ReactNative] - framework for building native apps using JS and React.

### Development

Take git repository:
```sh
$ mkdir bwareFrontend
$ cd bwareFrontend
$ git clone ssh://git@git.milosolutions.com:8922/bware/bware-frontend.git .
```

Install React Native prerequisites:
```sh
$ npm install -g react-native-cli
```

Install dependencies:
```sh
$ npm install
```

Install custom 3rd-party libraries:
1. Download libraries from here https://seafile.milosolutions.com/d/7d358b2e92/.
2. Copy them into project's directory and install:
```sh
$ npm install ./react-native-star-io-1.0.0.tgz
$ npm install ./react-native-verifone-0.0.1.tgz
$ npm install ./react-native-usb-printer-0.0.4.tgz
$ npm install ./react-native-acr-reader-1.0.0.tgz
```

Check ```node_modules/intl/.babelrc``` file, delete it if exists:
```sh
$ rm -f node_modules/intl/.babelrc
```

Start react packager without cache:
```sh
$ npm start -- --reset-cashe
```

Run on android:
```sh
$ react-native run-android
```

Run on ios:
```sh
$ react-native run-ios
```

Clean project in case of 'Could not delete path' exception:
```sh
$ cd android && ./gradlew clean
```

Repositories for custom 3-rd party libraries:
* [StarIO library]
* [USB printer library]
* [external NFC reader library]
* [Verifone terminal library]


License
----
Propertiary



   [StarIO library]: <https://git.milosolutions.com/bware/star-io>
   [USB printer library]: <https://git.milosolutions.com/bware/react-native-usb-printer>
   [external NFC reader library]: <https://git.milosolutions.com/bware/acr-reader>
   [Verifone terminal library]: <https://git.milosolutions.com/bware/primedrive-verifone>
   [Javascript]: <https://developer.mozilla.org/pl/docs/Web/JavaScript>
   [ReactJS]: <https://facebook.github.io/react/>
   [ReactNative]: <https://facebook.github.io/react-native/>
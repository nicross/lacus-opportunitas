# Lacus Opportunitas
A lunar lake trading simulator created for [Games for Blind Gamers 4](https://itch.io/jam/games-for-blind-gamers-4).

## Getting started
To get started, please use [npm](https://nodejs.org) to install the required dependencies:
```sh
npm install
```

### Common tasks
Common tasks have been automated with [Gulp](https://gulpjs.com):

#### Build once
```sh
npx gulp build
```

#### Build continuously
```sh
npx gulp watch
```

#### Create distributables
```sh
npx gulp dist
```

#### Open in Electron
```sh
npx gulp electron
```

#### Build and open in Electron
```sh
npx gulp electron-build
```

### Start web server
```sh
npx gulp serve
```

### Start web server and build continuously
```sh
npx gulp dev
```

#### Command line flags
| Flag | Description |
| - | - |
| `--debug` | Suppresses minification. |
